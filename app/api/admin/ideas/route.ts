import { NextRequest, NextResponse } from "next/server";
import { normalizeAttachmentsForApi } from "@/lib/attachments";
import { requireRoleFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireRoleFromRequest(request, "admin");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const ideas = await prisma.idea.findMany({
    where: {
      status: {
        not: "draft",
      },
    },
    include: {
      submitter: {
        select: {
          id: true,
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
        attachments: normalizeAttachmentsForApi(idea.attachments),
        evaluationComments: idea.evaluationComments,
      })),
    },
    { status: 200 },
  );
}
