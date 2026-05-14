import AdminIdeasPanel from "@/app/components/admin-ideas-panel";
import { normalizeAttachmentsForApi } from "@/lib/attachments";
import { requireRoleForPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminIdeasPage() {
  await requireRoleForPage("admin");

  const ideas = await prisma.idea.findMany({
    where: {
      status: {
        not: "draft",
      },
    },
    include: {
      submitter: {
        select: {
          email: true,
        },
      },
      attachments: {
        orderBy: {
          displayOrder: "asc",
        },
      },
      evaluationComments: {
        include: {
          admin: {
            select: {
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      stageComments: {
        include: {
          admin: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const serializedIdeas = ideas.map((idea) => ({
    ...idea,
    attachments: normalizeAttachmentsForApi(idea.attachments),
    stageComments: idea.stageComments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })),
  }));

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Review Dashboard</h1>
        <p className="text-sm text-slate-600">Review all submissions with stage-based review controls.</p>
      </div>

      <AdminIdeasPanel initialIdeas={serializedIdeas} />
    </main>
  );
}
