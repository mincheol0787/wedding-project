import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";

type CreateWeddingProjectInput = {
  ownerId: string;
  title: string;
  groomName: string;
  brideName: string;
  weddingDate?: Date;
};

type CreateScheduleEventInput = {
  userId: string;
  projectId: string;
  title: string;
  description?: string;
  category:
    | "MEETING"
    | "VENUE"
    | "STUDIO"
    | "DRESS"
    | "MAKEUP"
    | "INVITATION"
    | "VIDEO"
    | "PAYMENT"
    | "TODO";
  startsAt: Date;
  endsAt?: Date;
  isAllDay?: boolean;
};

type UpdateScheduleEventInput = CreateScheduleEventInput & {
  eventId: string;
  isCompleted: boolean;
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
        { ownerId: userId },
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
      scheduleEvents: {
        where: {
          deletedAt: null,
          isCompleted: false,
          startsAt: {
            gte: startOfToday(),
            lte: addDays(new Date(), 14)
          }
        },
        orderBy: {
          startsAt: "asc"
        },
        take: 2
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
        { ownerId: userId },
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

export async function getWeddingProjectDetail(userId: string, projectId: string) {
  return prisma.weddingProject.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      OR: [
        { ownerId: userId },
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
          id: true,
          publicSlug: true,
          status: true,
          updatedAt: true
        }
      },
      videoProject: {
        select: {
          id: true,
          updatedAt: true
        }
      },
      scheduleEvents: {
        where: {
          deletedAt: null
        },
        orderBy: [{ startsAt: "asc" }, { sortOrder: "asc" }]
      },
      renderJobs: {
        orderBy: {
          createdAt: "desc"
        },
        take: 5,
        select: {
          id: true,
          status: true,
          progress: true,
          createdAt: true,
          errorMessage: true
        }
      }
    }
  });
}

export async function createProjectScheduleEvent(input: CreateScheduleEventInput) {
  const project = await prisma.weddingProject.findFirst({
    where: {
      id: input.projectId,
      deletedAt: null,
      OR: [
        { ownerId: input.userId },
        {
          members: {
            some: {
              userId: input.userId,
              deletedAt: null
            }
          }
        }
      ]
    },
    select: {
      id: true
    }
  });

  if (!project) {
    return null;
  }

  const sortOrder = await prisma.projectScheduleEvent.count({
    where: {
      weddingProjectId: project.id,
      deletedAt: null
    }
  });

  return prisma.projectScheduleEvent.create({
    data: {
      weddingProjectId: project.id,
      title: input.title,
      description: input.description,
      category: input.category,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      isAllDay: input.isAllDay ?? false,
      sortOrder
    }
  });
}

export async function toggleProjectScheduleEvent(
  userId: string,
  projectId: string,
  eventId: string,
  isCompleted: boolean
) {
  const event = await prisma.projectScheduleEvent.findFirst({
    where: {
      id: eventId,
      weddingProjectId: projectId,
      deletedAt: null,
      weddingProject: {
        deletedAt: null,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
                deletedAt: null
              }
            }
          }
        ]
      }
    },
    select: {
      id: true
    }
  });

  if (!event) {
    return null;
  }

  return prisma.projectScheduleEvent.update({
    where: {
      id: event.id
    },
    data: {
      isCompleted
    }
  });
}

export async function updateProjectScheduleEvent(input: UpdateScheduleEventInput) {
  const event = await getEditableScheduleEvent(input.userId, input.projectId, input.eventId);

  if (!event) {
    return null;
  }

  return prisma.projectScheduleEvent.update({
    where: {
      id: event.id
    },
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      isAllDay: input.isAllDay ?? false,
      isCompleted: input.isCompleted
    }
  });
}

export async function deleteProjectScheduleEvent(
  userId: string,
  projectId: string,
  eventId: string
) {
  const event = await getEditableScheduleEvent(userId, projectId, eventId);

  if (!event) {
    return null;
  }

  return prisma.projectScheduleEvent.update({
    where: {
      id: event.id
    },
    data: {
      deletedAt: new Date()
    }
  });
}

async function getEditableScheduleEvent(userId: string, projectId: string, eventId: string) {
  return prisma.projectScheduleEvent.findFirst({
    where: {
      id: eventId,
      weddingProjectId: projectId,
      deletedAt: null,
      weddingProject: {
        deletedAt: null,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
                deletedAt: null
              }
            }
          }
        ]
      }
    },
    select: {
      id: true
    }
  });
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}
