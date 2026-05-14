import { NextRequest, NextResponse } from "next/server";
import { normalizeAttachmentsForApi } from "@/lib/attachments";
import { requireRoleFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isBlindStage, type ReviewStage } from "@/lib/review-stages";

function resolveReviewStage(status: string, reviewStage: ReviewStage | null): ReviewStage | null {
  if (reviewStage) {
    return reviewStage;
  }

  if (status === "submitted" || status === "under_review") {
    return "initial_screening";
  }

  return null;
}

function canRevealSubmitter(status: string, reviewStage: ReviewStage | null): boolean {
  if (status === "accepted" || status === "rejected") {
    return true;
  }

  if (!reviewStage) {
    return false;
  }

  return !isBlindStage(reviewStage);
}

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
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      status: true,
      reviewStage: true,
      customFields: true,
      createdAt: true,
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

  const mappedIdeas = ideas.map((idea) => {
    const normalizedStage = resolveReviewStage(idea.status, idea.reviewStage);
    const revealSubmitter = canRevealSubmitter(idea.status, normalizedStage);

    return {
      id: idea.id,
      title: idea.title,
      description: idea.description,
      category: idea.category,
      status: idea.status,
      reviewStage: normalizedStage,
      customFields: idea.customFields,
      createdAt: idea.createdAt,
      submitter: {
        ...idea.submitter,
        email: revealSubmitter ? idea.submitter.email : "Anonymous Submitter",
      },
      attachments: normalizeAttachmentsForApi(idea.attachments),
      evaluationComments: idea.evaluationComments,
      stageComments: idea.stageComments,
    };
  });

  const active = mappedIdeas.filter((idea) => idea.status === "submitted" || idea.status === "under_review");
  const resolved = mappedIdeas.filter((idea) => idea.status === "accepted" || idea.status === "rejected");

  return NextResponse.json({ ideas: mappedIdeas, active, resolved }, { status: 200 });
}
