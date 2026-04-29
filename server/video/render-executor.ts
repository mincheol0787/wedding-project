import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { prisma } from "@/lib/prisma";
import { videoRenderInputSchema, type VideoRenderInput } from "@/lib/video/render-input";
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

  const outputAsset = await prisma.mediaAsset.upsert({
    where: {
      storageKey: `renders/${outputFileName}`
    },
    create: {
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
    },
    update: {
      contentType: "video/mp4",
      deletedAt: null,
      fileName: outputFileName,
      ownerId: renderJob.userId,
      sizeBytes: outputFile.size,
      type: "VIDEO",
      url: `/renders/${outputFileName}`,
      visibility: "PRIVATE",
      weddingProjectId: renderJob.weddingProjectId
    }
  });

  await markRenderJobSucceeded(renderJobId, outputAsset.id);
}

function normalizeRenderInput(input: VideoRenderInput): VideoRenderInput {
  const images = input.assets.images.map((asset, index) => {
    if (isServerRenderableSource(asset.src)) {
      return asset;
    }

    return {
      ...asset,
      src: createCinematicFallbackImage(index)
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

function createCinematicFallbackImage(index: number) {
  const palettes = [
    ["#181513", "#e8c2ac", "#f7eee5"],
    ["#151719", "#b8c9bd", "#f4f0e8"],
    ["#1d1718", "#dbb7c0", "#fff3ec"],
    ["#161716", "#d8c39a", "#f7f0df"]
  ];
  const [base, accent, paper] = palettes[index % palettes.length];
  const title = getFallbackTitle(index);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <radialGradient id="light" cx="48%" cy="38%" r="72%">
          <stop offset="0%" stop-color="${paper}" stop-opacity="0.82"/>
          <stop offset="42%" stop-color="${accent}" stop-opacity="0.36"/>
          <stop offset="100%" stop-color="${base}" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="veil" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.34"/>
          <stop offset="56%" stop-color="#ffffff" stop-opacity="0.05"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.22"/>
        </linearGradient>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.12"/>
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width="1920" height="1080" fill="url(#light)"/>
      <rect width="1920" height="1080" filter="url(#grain)" opacity="0.48"/>
      <path d="M252 916 C514 584 642 272 1002 212 C1294 164 1540 296 1696 488" fill="none" stroke="${paper}" stroke-opacity="0.24" stroke-width="2"/>
      <path d="M470 862 C642 610 816 474 1060 430 C1248 396 1420 446 1548 548" fill="none" stroke="${accent}" stroke-opacity="0.36" stroke-width="3"/>
      <g opacity="0.88">
        <ellipse cx="850" cy="544" rx="126" ry="176" fill="#191716" opacity="0.54"/>
        <ellipse cx="1018" cy="550" rx="132" ry="184" fill="#211a1a" opacity="0.58"/>
        <path d="M736 748 C824 604 940 584 1036 748 Z" fill="${paper}" opacity="0.72"/>
        <path d="M966 748 C1056 588 1216 600 1294 748 Z" fill="#171514" opacity="0.66"/>
      </g>
      <rect x="164" y="124" width="1592" height="832" rx="28" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2"/>
      <text x="960" y="858" fill="${paper}" fill-opacity="0.9" font-family="Georgia, serif" font-size="62" text-anchor="middle">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getFallbackTitle(index: number) {
  const titles = [
    "Our first chapter",
    "A warm season",
    "The way we smiled",
    "Every little promise",
    "Together, slowly",
    "Family and friends",
    "The day is near",
    "A quiet vow",
    "Bless this moment",
    "Our beginning"
  ];

  return titles[index % titles.length];
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
