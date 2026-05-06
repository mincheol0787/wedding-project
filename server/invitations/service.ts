import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/prisma-client";
import {
  invitationConfigSchema,
  invitationGalleryItemSchema,
  parseInvitationConfig,
  parseInvitationGallery,
  type InvitationConfig,
  type InvitationGalleryItem
} from "@/lib/invitation/types";

export async function getInvitationEditorProject(userId: string, projectId: string) {
  const project = await prisma.weddingProject.findFirst({
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
    include: {
      invitationProject: true
    }
  });

  if (!project?.invitationProject) {
    return null;
  }

  return {
    ...project,
    invitationProject: {
      ...project.invitationProject,
      parsedConfig: parseInvitationConfig(project.invitationProject.config),
      parsedGallery: parseInvitationGallery(project.invitationProject.gallery)
    }
  };
}

type UpdateInvitationInput = {
  invitationProjectId: string;
  status: "DRAFT" | "PUBLISHED";
  title: string;
  greeting?: string;
  groomName: string;
  brideName: string;
  groomFatherName?: string;
  groomMotherName?: string;
  brideFatherName?: string;
  brideMotherName?: string;
  contactPhoneGroom?: string;
  contactPhoneBride?: string;
  eventDate?: Date;
  venueName?: string;
  venueAddress?: string;
  venueDetail?: string;
  mapProvider?: string;
  mapLat?: string;
  mapLng?: string;
  gallery: InvitationGalleryItem[];
  config: InvitationConfig;
};

export async function updateInvitationProject(input: UpdateInvitationInput) {
  const gallery = invitationGalleryItemSchema.array().parse(input.gallery);
  const config = invitationConfigSchema.parse(input.config);

  return prisma.invitationProject.update({
    where: {
      id: input.invitationProjectId
    },
    data: {
      status: input.status,
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      title: input.title,
      greeting: input.greeting,
      groomFatherName: input.groomFatherName,
      groomMotherName: input.groomMotherName,
      brideFatherName: input.brideFatherName,
      brideMotherName: input.brideMotherName,
      contactPhoneGroom: input.contactPhoneGroom,
      contactPhoneBride: input.contactPhoneBride,
      eventDate: input.eventDate,
      venueName: input.venueName,
      venueAddress: input.venueAddress,
      venueDetail: input.venueDetail,
      mapProvider: input.mapProvider,
      mapLat: input.mapLat ? new Prisma.Decimal(input.mapLat) : null,
      mapLng: input.mapLng ? new Prisma.Decimal(input.mapLng) : null,
      gallery: gallery as Prisma.InputJsonArray,
      config: config as Prisma.InputJsonObject,
      weddingProject: {
        update: {
          groomName: input.groomName,
          brideName: input.brideName,
          weddingDate: input.eventDate,
          venueName: input.venueName,
          venueAddress: input.venueAddress
        }
      }
    }
  });
}

export type InvitationResponseDashboard = Awaited<ReturnType<typeof getInvitationResponseDashboard>>;

export async function getInvitationResponseDashboard(userId: string, projectId: string) {
  const project = await prisma.weddingProject.findFirst({
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
      invitationProject: {
        select: {
          id: true,
          publicSlug: true,
          status: true
        }
      }
    }
  });

  if (!project?.invitationProject) {
    return null;
  }

  const invitationProjectId = project.invitationProject.id;
  const rsvpWhere = {
    invitationProjectId,
    deletedAt: null
  };

  const [attendanceGroups, sideGroups, guestbookCount, hiddenGuestbookCount, rsvps, guestbookEntries] =
    await prisma.$transaction([
    prisma.rSVP.groupBy({
      by: ["attendance"],
      where: rsvpWhere,
      _count: {
        _all: true
      },
      _sum: {
        guestCount: true
      }
    }),
    prisma.rSVP.groupBy({
      by: ["side"],
      where: rsvpWhere,
      _count: {
        _all: true
      },
      _sum: {
        guestCount: true
      }
    }),
    prisma.guestbook.count({
      where: {
        invitationProjectId,
        deletedAt: null
      }
    }),
    prisma.guestbook.count({
      where: {
        invitationProjectId,
        deletedAt: null,
        isHidden: true
      }
    }),
    prisma.rSVP.findMany({
      where: rsvpWhere,
      orderBy: {
        createdAt: "desc"
      },
      take: 200,
      select: {
        id: true,
        name: true,
        phone: true,
        side: true,
        attendance: true,
        guestCount: true,
        mealOption: true,
        message: true,
        createdAt: true
      }
    }),
    prisma.guestbook.findMany({
      where: {
        invitationProjectId,
        deletedAt: null
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 100,
      select: {
        id: true,
        name: true,
        message: true,
        isPrivate: true,
        isHidden: true,
        createdAt: true
      }
    })
  ]);

  const attendance = {
    attending: getGroupValue(attendanceGroups, "attendance", "ATTENDING"),
    notAttending: getGroupValue(attendanceGroups, "attendance", "NOT_ATTENDING"),
    undecided: getGroupValue(attendanceGroups, "attendance", "UNDECIDED")
  };

  const side = {
    groom: getGroupValue(sideGroups, "side", "GROOM"),
    bride: getGroupValue(sideGroups, "side", "BRIDE"),
    both: getGroupValue(sideGroups, "side", "BOTH"),
    unknown: getGroupValue(sideGroups, "side", "UNKNOWN")
  };

  return {
    projectTitle: project.title,
    invitation: project.invitationProject,
    summary: {
      responseCount: attendance.attending.count + attendance.notAttending.count + attendance.undecided.count,
      guestCount:
        attendance.attending.guestCount +
        attendance.notAttending.guestCount +
        attendance.undecided.guestCount,
      attendingGuestCount: attendance.attending.guestCount,
      notAttendingCount: attendance.notAttending.count,
      undecidedCount: attendance.undecided.count,
      groomGuestCount: side.groom.guestCount,
      brideGuestCount: side.bride.guestCount,
      bothGuestCount: side.both.guestCount,
      unknownGuestCount: side.unknown.guestCount,
      guestbookCount,
      hiddenGuestbookCount
    },
    rsvps: rsvps.map((rsvp) => ({
      ...rsvp,
      createdAt: rsvp.createdAt.toISOString()
    })),
    guestbookEntries: guestbookEntries.map((entry) => ({
      ...entry,
      createdAt: entry.createdAt.toISOString()
    }))
  };
}

function getGroupValue<
  TGroup extends {
    _count: {
      _all: number;
    };
    _sum: {
      guestCount?: number | null;
    };
  },
  TKey extends keyof TGroup
>(groups: TGroup[], key: TKey, value: TGroup[TKey]) {
  const group = groups.find((item) => item[key] === value);

  return {
    count: group?._count._all ?? 0,
    guestCount: group?._sum.guestCount ?? 0
  };
}
