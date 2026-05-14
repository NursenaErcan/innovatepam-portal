/**
 * GET /api/ideas/[ideaId]/score-summary
 * Retrieve aggregated score summary for a submitted idea
 * Visible only to submitter after idea is decided (accepted/rejected)
 * Submitter-accessible endpoint (no admin role required)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuthFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aggregateScores, canViewScoreSummaryForSubmitter } from "@/lib/scoring-aggregation";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ideaId: string }> }
) {
  try {
    // Verify authentication
    const auth = await requireAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = auth.user;

    const { ideaId } = await context.params;

    // Retrieve idea
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      select: {
        id: true,
        status: true,
        reviewStage: true,
        submitterId: true,
        scores: true,
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    // Verify user is the submitter or an admin
    const isSubmitter = idea.submitterId === user.id;
    const isAdmin = user.role === "admin";

    if (!isSubmitter && !isAdmin) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // For submitters: only show scores if idea is decided
    if (isSubmitter && !canViewScoreSummaryForSubmitter(idea.status, idea.reviewStage)) {
      return NextResponse.json(
        { error: "Score summary only visible after Final Decision" },
        { status: 403 }
      );
    }

    // Admins can see scores at any time

    // Compute aggregate scores
    const summary = aggregateScores(idea.scores);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error retrieving score summary:", error);
    return NextResponse.json(
      { error: "Failed to retrieve score summary" },
      { status: 500 }
    );
  }
}
