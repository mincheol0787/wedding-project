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
