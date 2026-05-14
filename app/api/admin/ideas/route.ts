import { NextRequest, NextResponse } from "next/server";
import { requireRoleFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireRoleFromRequest(request, "admin");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const ideas = await prisma.idea.findMany({
    include: {
      submitter: {
        select: {
          id: true,
          email: true,
        },
      },
      attachment: true,
      evaluationComments: {
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

  return NextResponse.json(
    {
      ideas: ideas.map((idea) => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        status: idea.status,
        customFields: idea.customFields,
        createdAt: idea.createdAt,
        submitter: idea.submitter,
        attachment: idea.attachment,
        evaluationComments: idea.evaluationComments,
      })),
    },
    { status: 200 },
  );
}
