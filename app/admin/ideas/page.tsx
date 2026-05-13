import AdminIdeasPanel from "@/app/components/admin-ideas-panel";
import { requireRoleForPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminIdeasPage() {
  await requireRoleForPage("admin");

  const ideas = await prisma.idea.findMany({
    include: {
      submitter: {
        select: {
          email: true,
        },
      },
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
        <h1 className="text-2xl font-semibold text-slate-900">Admin Review Dashboard</h1>
        <p className="text-sm text-slate-600">
          Review all submissions, update statuses, and add evaluation comments.
        </p>
      </div>

      <AdminIdeasPanel initialIdeas={ideas} />
    </main>
  );
}
