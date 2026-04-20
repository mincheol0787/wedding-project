import { prisma } from "@/lib/prisma";
import { parseInvitationConfig, parseInvitationGallery } from "@/lib/invitation/types";

export async function getPublishedInvitationBySlug(slug: string) {
  const invitation = await prisma.invitationProject.findFirst({
    where: {
      publicSlug: slug,
      status: "PUBLISHED",
      deletedAt: null,
      weddingProject: {
        deletedAt: null
      }
    },
    include: {
      weddingProject: true,
      coverAsset: true,
      template: true,
      guestbookEntries: {
        where: {
          isHidden: false,
          deletedAt: null
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 50
      }
    }
  });

  if (!invitation) {
    return null;
  }

  return {
    ...invitation,
    parsedConfig: parseInvitationConfig(invitation.config),
    parsedGallery: parseInvitationGallery(invitation.gallery)
  };
}
