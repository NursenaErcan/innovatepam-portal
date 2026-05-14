/**
 * Database query utilities for Phase 7 Scoring System
 * Encapsulates Prisma queries for scores
 */

import { prisma } from "./prisma";

export type ScoringDimension = "INNOVATION" | "FEASIBILITY" | "BUSINESS_IMPACT";

/**
 * Retrieves all scores for a given idea
 */
export async function getScoresForIdea(ideaId: string) {
  return prisma.ideaScore.findMany({
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
}

/**
 * Retrieves scores for a specific dimension of an idea
 */
export async function getScoresByDimension(
  ideaId: string,
  dimension: ScoringDimension
) {
  return prisma.ideaScore.findMany({
    where: {
      ideaId,
      dimension,
    },
    include: {
      reviewer: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Checks if a specific reviewer has already scored a dimension
 */
export async function hasReviewerScored(
  ideaId: string,
  dimension: ScoringDimension,
  reviewerId: string
): Promise<boolean> {
  const score = await prisma.ideaScore.findUnique({
    where: {
      ideaId_dimension_reviewedBy: {
        ideaId,
        dimension,
        reviewedBy: reviewerId,
      },
    },
  });
  return !!score;
}

/**
 * Gets or creates a score record for a reviewer
 */
export async function upsertScore(
  ideaId: string,
  dimension: ScoringDimension,
  value: number,
  reviewerId: string
) {
  return prisma.ideaScore.upsert({
    where: {
      ideaId_dimension_reviewedBy: {
        ideaId,
        dimension,
        reviewedBy: reviewerId,
      },
    },
    update: { value },
    create: {
      ideaId,
      dimension,
      value,
      reviewedBy: reviewerId,
    },
    include: {
      reviewer: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
}
