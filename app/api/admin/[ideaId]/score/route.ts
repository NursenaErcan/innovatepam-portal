/**
 * POST /api/admin/[ideaId]/score
 * Create or update a score for an idea dimension
 * Admin-only endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { requireRoleFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateScore, validateDimension } from "@/lib/scoring-validation";
import { upsertScore } from "@/lib/score-queries";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ ideaId: string }> }
) {
  try {
    // Verify admin role
    const auth = await requireRoleFromRequest(request, "admin");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = auth.user;

    const { ideaId } = await context.params;
    const body = await request.json();
    const { dimension, value } = body;

    // Validate dimension
    if (!validateDimension(dimension)) {
      return NextResponse.json(
        { error: "Invalid dimension. Must be INNOVATION, FEASIBILITY, or BUSINESS_IMPACT" },
        { status: 400 }
      );
    }

    // Validate score value
    const scoreValidation = validateScore(value);
    if (!scoreValidation.valid) {
      return NextResponse.json(
        { error: scoreValidation.error || "Invalid score value" },
        { status: 400 }
      );
    }

    // If score is null/empty, reject (value is required for POST)
    if (value === null || value === undefined || value === "") {
      return NextResponse.json(
        { error: "Score value is required" },
        { status: 400 }
      );
    }

    const numericValue = typeof value === "number" ? value : Number(value);

    // Check idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    // Prevent scoring draft ideas
    if (idea.status === "draft") {
      return NextResponse.json(
        { error: "Cannot score draft ideas" },
        { status: 409 }
      );
    }

    // Upsert score
    const score = await upsertScore(
      ideaId,
      dimension,
      numericValue,
      user.id
    );

    return NextResponse.json({
      success: true,
      score,
    });
  } catch (error) {
    console.error("Error creating score:", error);
    return NextResponse.json(
      { error: "Failed to create score" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ideaId: string }> }
) {
  try {
    // Verify admin role
    const auth = await requireRoleFromRequest(request, "admin");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { ideaId } = await context.params;

    // Check idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    // Retrieve all scores for idea
    const scores = await prisma.ideaScore.findMany({
      where: { ideaId },
      include: {
        reviewer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: [{ dimension: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ scores });
  } catch (error) {
    console.error("Error retrieving scores:", error);
    return NextResponse.json(
      { error: "Failed to retrieve scores" },
      { status: 500 }
    );
  }
}
