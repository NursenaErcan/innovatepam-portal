import SubmitterDashboard from "@/app/components/submitter-dashboard";
import { normalizeAttachmentsForApi } from "@/lib/attachments";
import { requireRoleForPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SubmitterIdeasPage() {
  const user = await requireRoleForPage("submitter");

  const ideas = await prisma.idea.findMany({
    where: { submitterId: user.id },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      status: true,
      reviewStage: true,
      customFields: true,
      createdAt: true,
      attachments: {
        orderBy: {
          displayOrder: "asc",
        },
        select: {
          id: true,
          fileName: true,
          storagePath: true,
          mimeType: true,
          size: true,
          displayOrder: true,
        },
      },
      evaluationComments: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          text: true,
          createdAt: true,
          admin: {
            select: {
              email: true,
            },
          },
        },
      },
      stageComments: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          text: true,
          stage: true,
          createdAt: true,
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
  }));

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Submitter Dashboard</h1>
        <p className="text-sm text-slate-600">Create ideas and track your submission status.</p>
      </div>

      <SubmitterDashboard initialIdeas={serializedIdeas} />
    </main>
  );
}
