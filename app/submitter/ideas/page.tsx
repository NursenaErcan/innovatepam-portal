import SubmitterDashboard from "@/app/components/submitter-dashboard";
import { requireRoleForPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SubmitterIdeasPage() {
  const user = await requireRoleForPage("submitter");

  const ideas = await prisma.idea.findMany({
    where: { submitterId: user.id },
    include: {
      attachment: true,
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
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Submitter Dashboard</h1>
        <p className="text-sm text-slate-600">Create ideas and track your submission status.</p>
      </div>

      <SubmitterDashboard initialIdeas={ideas} />
    </main>
  );
}
