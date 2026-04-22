import { prisma } from "@/lib/prisma";

export async function getAdminDashboardData() {
  const [
    userCount,
    adminCount,
    projectCount,
    publishedInvitationCount,
    renderJobCount,
    failedRenderJobCount,
    templateCount,
    activeTemplateCount,
    supportInquiryCount,
    openSupportInquiryCount,
    users,
    projects,
    renderJobs,
    templates,
    supportInquiries,
    renderJobsByStatus
  ] = await prisma.$transaction([
    prisma.user.count({
      where: {
        deletedAt: null
      }
    }),
    prisma.user.count({
      where: {
        role: "ADMIN",
        deletedAt: null
      }
    }),
    prisma.weddingProject.count({
      where: {
        deletedAt: null
      }
    }),
    prisma.invitationProject.count({
      where: {
        status: "PUBLISHED",
        deletedAt: null
      }
    }),
    prisma.renderJob.count({
      where: {
        deletedAt: null
      }
    }),
    prisma.renderJob.count({
      where: {
        status: "FAILED",
        deletedAt: null
      }
    }),
    prisma.template.count({
      where: {
        deletedAt: null
      }
    }),
    prisma.template.count({
      where: {
        isActive: true,
        deletedAt: null
      }
    }),
    prisma.supportInquiry.count({
      where: {
        deletedAt: null
      }
    }),
    prisma.supportInquiry.count({
      where: {
        status: "OPEN",
        deletedAt: null
      }
    }),
    prisma.user.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 50,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            renderJobs: true
          }
        }
      }
    }),
    prisma.weddingProject.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 50,
      select: {
        id: true,
        title: true,
        groomName: true,
        brideName: true,
        status: true,
        weddingDate: true,
        createdAt: true,
        owner: {
          select: {
            email: true,
            name: true
          }
        },
        invitationProject: {
          select: {
            status: true,
            publicSlug: true
          }
        },
        _count: {
          select: {
            renderJobs: true,
            mediaAssets: true
          }
        }
      }
    }),
    prisma.renderJob.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 50,
      select: {
        id: true,
        status: true,
        progress: true,
        attempts: true,
        maxAttempts: true,
        errorMessage: true,
        createdAt: true,
        startedAt: true,
        finishedAt: true,
        user: {
          select: {
            email: true,
            name: true
          }
        },
        weddingProject: {
          select: {
            title: true
          }
        },
        outputAsset: {
          select: {
            url: true,
            fileName: true
          }
        }
      }
    }),
    prisma.template.findMany({
      where: {
        deletedAt: null
      },
      orderBy: [
        {
          type: "asc"
        },
        {
          sortOrder: "asc"
        },
        {
          createdAt: "desc"
        }
      ],
      take: 50,
      select: {
        id: true,
        key: true,
        name: true,
        type: true,
        tier: true,
        isActive: true,
        sortOrder: true,
        createdAt: true
      }
    }),
    prisma.supportInquiry.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 30,
      select: {
        id: true,
        name: true,
        email: true,
        category: true,
        subject: true,
        message: true,
        status: true,
        createdAt: true
      }
    }),
    prisma.renderJob.groupBy({
      by: ["status"],
      where: {
        deletedAt: null
      },
      _count: {
        _all: true
      }
    })
  ]);

  return {
    stats: {
      userCount,
      adminCount,
      projectCount,
      publishedInvitationCount,
      renderJobCount,
      failedRenderJobCount,
      templateCount,
      activeTemplateCount,
      supportInquiryCount,
      openSupportInquiryCount,
      renderJobsByStatus: renderJobsByStatus.map((item) => ({
        status: item.status,
        count: item._count._all
      }))
    },
    users,
    projects,
    renderJobs,
    templates,
    supportInquiries
  };
}
