import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";

type CreateWeddingProjectInput = {
  ownerId: string;
  title: string;
  groomName: string;
  brideName: string;
  weddingDate?: Date;
};

export async function createWeddingProject(input: CreateWeddingProjectInput) {
  const baseSlug = createSlug(input.title) || "wedding";
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  return prisma.weddingProject.create({
    data: {
      ownerId: input.ownerId,
      title: input.title,
      slug,
      groomName: input.groomName,
      brideName: input.brideName,
      weddingDate: input.weddingDate,
      members: {
        create: {
          userId: input.ownerId,
          role: "OWNER"
        }
      },
      videoProject: {
        create: {
          title: `${input.title} 식전영상`
        }
      },
      invitationProject: {
        create: {
          title: `${input.title} 모바일 청첩장`,
          publicSlug: slug
        }
      }
    }
  });
}

export async function getWeddingProjectsByUserId(userId: string) {
  return prisma.weddingProject.findMany({
    where: {
      deletedAt: null,
      OR: [
        {
          ownerId: userId
        },
        {
          members: {
            some: {
              userId,
              deletedAt: null
            }
          }
        }
      ]
    },
    include: {
      invitationProject: {
        select: {
          publicSlug: true,
          status: true
        }
      },
      videoProject: {
        select: {
          id: true
        }
      },
      renderJobs: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1,
        select: {
          id: true,
          status: true,
          progress: true,
          errorMessage: true,
          createdAt: true
        }
      },
      _count: {
        select: {
          mediaAssets: true,
          renderJobs: true
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });
}

export async function getWeddingProjectForVideoEditor(userId: string, projectId: string) {
  return prisma.weddingProject.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      OR: [
        {
          ownerId: userId
        },
        {
          members: {
            some: {
              userId,
              deletedAt: null
            }
          }
        }
      ]
    },
    select: {
      id: true,
      title: true,
      groomName: true,
      brideName: true,
      videoProject: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });
}
