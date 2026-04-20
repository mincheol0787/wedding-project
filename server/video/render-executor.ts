import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { prisma } from "@/lib/prisma";
import { videoRenderInputSchema } from "@/lib/video/render-input";
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
  await writeFile(propsPath, JSON.stringify({ input: parsed.data }, null, 2), "utf8");
  await updateRenderJobProgress(renderJobId, 25);

  await runRemotionRender(propsPath, outputPath);
  await updateRenderJobProgress(renderJobId, 90);

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
      sizeBytes: 0
    }
  });

  await markRenderJobSucceeded(renderJobId, outputAsset.id);
}

function runRemotionRender(propsPath: string, outputPath: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(
      process.platform === "win32" ? "npx.cmd" : "npx",
      [
        "remotion",
        "render",
        "remotion/index.ts",
        "WeddingVideo",
        outputPath,
        "--props",
        propsPath,
        "--overwrite"
      ],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: "pipe"
      }
    );

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
