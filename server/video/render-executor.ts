import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { prisma } from "@/lib/prisma";
import {
  defaultVideoRenderInput,
  videoRenderInputSchema,
  type VideoRenderInput
} from "@/lib/video/render-input";
import {
  markRenderJobFailed,
  markRenderJobProcessing,
  markRenderJobSucceeded,
  updateRenderJobProgress
} from "@/server/video/render-jobs";

export async function executeRenderJob(renderJobId: string, attempt: number) {
  const renderJob = await prisma.renderJob.findUnique({
    where: {
      id: renderJobId
    }
  });

  if (!renderJob) {
    throw new Error(`RenderJob not found: ${renderJobId}`);
  }

  if (renderJob.deletedAt || renderJob.status === "CANCELED") {
    return;
  }

  await markRenderJobProcessing(renderJobId, attempt);

  const parsed = videoRenderInputSchema.safeParse(renderJob.input);

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(", ");
    await markRenderJobFailed(renderJobId, `Invalid render input: ${message}`, attempt);
    throw new Error(message);
  }

  const workspaceRoot = process.cwd();
  const tmpDir = path.join(workspaceRoot, "tmp", "render-jobs", renderJobId);
  const publicRenderDir = path.join(workspaceRoot, "public", "renders");
  const propsPath = path.join(tmpDir, "props.json");
  const outputFileName = `${renderJobId}.mp4`;
  const outputPath = path.join(publicRenderDir, outputFileName);

  await mkdir(tmpDir, { recursive: true });
  await mkdir(publicRenderDir, { recursive: true });
  const renderInput = normalizeRenderInput(parsed.data);

  await writeFile(propsPath, JSON.stringify({ input: renderInput }, null, 2), "utf8");
  await updateRenderJobProgress(renderJobId, 25);

  if (await isRenderJobCanceled(renderJobId)) {
    return;
  }

  await runRemotionRender(path.relative(workspaceRoot, propsPath), path.relative(workspaceRoot, outputPath));

  if (await isRenderJobCanceled(renderJobId)) {
    return;
  }

  await updateRenderJobProgress(renderJobId, 90);

  const outputFile = await stat(outputPath).catch(() => ({ size: 0 }));

  const outputAsset = await prisma.mediaAsset.create({
    data: {
      ownerId: renderJob.userId,
      weddingProjectId: renderJob.weddingProjectId,
      type: "VIDEO",
      visibility: "PRIVATE",
      storageKey: `renders/${outputFileName}`,
      bucket: "local-public",
      url: `/renders/${outputFileName}`,
      fileName: outputFileName,
      contentType: "video/mp4",
      sizeBytes: outputFile.size
    }
  });

  await markRenderJobSucceeded(renderJobId, outputAsset.id);
}

function normalizeRenderInput(input: VideoRenderInput): VideoRenderInput {
  const fallbackImages = defaultVideoRenderInput.assets.images;
  const images = input.assets.images.map((asset, index) => {
    if (isServerRenderableSource(asset.src)) {
      return asset;
    }

    const fallback = fallbackImages[index % fallbackImages.length] ?? fallbackImages[0];

    return {
      ...asset,
      src: fallback.src
    };
  });
  const audio =
    input.assets.audio && isServerRenderableSource(input.assets.audio.src) ? input.assets.audio : undefined;

  return {
    ...input,
    assets: {
      ...input.assets,
      audio,
      images
    }
  };
}

function isServerRenderableSource(src: string) {
  return src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:") || src.startsWith("/");
}

async function isRenderJobCanceled(renderJobId: string) {
  const job = await prisma.renderJob.findUnique({
    where: {
      id: renderJobId
    },
    select: {
      status: true,
      deletedAt: true
    }
  });

  return !job || Boolean(job.deletedAt) || job.status === "CANCELED";
}

function runRemotionRender(propsPath: string, outputPath: string) {
  return new Promise<void>((resolve, reject) => {
    const args = [
      "remotion",
      "render",
      "remotion/index.ts",
      "WeddingVideo",
      outputPath,
      `--props=${propsPath}`,
      "--overwrite"
    ];
    const child =
      process.platform === "win32"
        ? spawn("cmd.exe", ["/d", "/c", ["npx", ...args.map(quoteWindowsArg)].join(" ")], {
            cwd: process.cwd(),
            env: process.env,
            stdio: "pipe"
          })
        : spawn("npx", args, {
            cwd: process.cwd(),
            env: process.env,
            stdio: "pipe"
          });

    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr || `Remotion exited with code ${code}`));
    });
  });
}

function quoteWindowsArg(arg: string) {
  if (!/[\s&()^|<>"]/.test(arg)) {
    return arg;
  }

  return `"${arg.replace(/"/g, '""')}"`;
}
