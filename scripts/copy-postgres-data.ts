import { PrismaClient } from "@/lib/prisma-client";

const sourceUrl = process.env.SOURCE_DATABASE_URL;
const targetUrl = process.env.TARGET_DATABASE_URL;

if (!sourceUrl || !targetUrl) {
  throw new Error("SOURCE_DATABASE_URL and TARGET_DATABASE_URL are required.");
}

const source = new PrismaClient({
  datasources: {
    db: {
      url: sourceUrl
    }
  }
});

const target = new PrismaClient({
  datasources: {
    db: {
      url: targetUrl
    }
  }
});

type CopyStep = {
  name: string;
  read: () => Promise<unknown[]>;
  write: (data: unknown[]) => Promise<{ count: number }>;
};

const steps: CopyStep[] = [
  {
    name: "User",
    read: () => source.user.findMany(),
    write: (data) => target.user.createMany({ data: data as never[], skipDuplicates: true })
  },
  {
    name: "Account",
    read: () => source.account.findMany(),
    write: (data) => target.account.createMany({ data: data as never[], skipDuplicates: true })
  },
  {
    name: "Session",
    read: () => source.session.findMany(),
    write: (data) => target.session.createMany({ data: data as never[], skipDuplicates: true })
  },
  {
    name: "VerificationToken",
    read: () => source.verificationToken.findMany(),
    write: (data) =>
      target.verificationToken.createMany({ data: data as never[], skipDuplicates: true })
  },
  {
    name: "Template",
    read: () => source.template.findMany(),
    write: (data) => target.template.createMany({ data: data as never[], skipDuplicates: true })
  },
  {
    name: "WeddingProject",
    read: () => source.weddingProject.findMany(),
    write: (data) => target.weddingProject.createMany({ data: data as never[], skipDuplicates: true })
  },
  {
    name: "ProjectMember",
    read: () => source.projectMember.findMany(),
    write: (data) => target.projectMember.createMany({ data: data as never[], skipDuplicates: true })
  },
  {
    name: "ProjectScheduleEvent",
    read: () => source.projectScheduleEvent.findMany(),
    write: (data) =>
      target.projectScheduleEvent.createMany({ data: data as never[], skipDuplicates: true })
  },
  {
    name: "MediaAsset",
    read: () => source.mediaAsset.findMany(),
    write: (data) => target.mediaAsset.createMany({ data: data as never[], skipDuplicates: true })
  },
  {
    name: "VideoProject",
    read: () => source.videoProject.findMany(),
    write: (data) => target.videoProject.createMany({ data: data as never[], skipDuplicates: true })
  },
  {
    name: "InvitationProject",
    read: () => source.invitationProject.findMany(),
    write: (data) =>
      target.invitationProject.createMany({ data: data as never[], skipDuplicates: true })
  },
  {
    name: "VideoScene",
    read: () => source.videoScene.findMany(),
    write: (data) => target.videoScene.createMany({ data: data as never[], skipDuplicates: true })
  },
  {
    name: "LyricSegment",
    read: () => source.lyricSegment.findMany(),
    write: (data) => target.lyricSegment.createMany({ data: data as never[], skipDuplicates: true })
  },
  {
    name: "RenderJob",
    read: () => source.renderJob.findMany(),
    write: (data) => target.renderJob.createMany({ data: data as never[], skipDuplicates: true })
  },
  {
    name: "RSVP",
    read: () => source.rSVP.findMany(),
    write: (data) => target.rSVP.createMany({ data: data as never[], skipDuplicates: true })
  },
  {
    name: "Guestbook",
    read: () => source.guestbook.findMany(),
    write: (data) => target.guestbook.createMany({ data: data as never[], skipDuplicates: true })
  }
];

async function main() {
  for (const step of steps) {
    const rows = await step.read();

    if (!rows.length) {
      console.log(`${step.name}: 0 rows`);
      continue;
    }

    const result = await step.write(rows);
    console.log(`${step.name}: copied ${result.count}/${rows.length} rows`);
  }
}

main()
  .finally(async () => {
    await source.$disconnect();
    await target.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  });
