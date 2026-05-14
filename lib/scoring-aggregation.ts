/**
 * Score aggregation and visibility utilities for Phase 7 Scoring System
 * Computes aggregate scores and manages visibility rules
 */

import { IdeaScore } from "@prisma/client";

export interface AggregateScore {
  innovation: number | null;
  feasibility: number | null;
  businessImpact: number | null;
}

/**
 * Aggregates scores by dimension and computes average per dimension
 * Returns null for dimensions with no scores
 */
export function aggregateScores(scores: IdeaScore[]): AggregateScore {
  const byDimension: Record<string, number[]> = {
    INNOVATION: [],
    FEASIBILITY: [],
    BUSINESS_IMPACT: [],
  };

  for (const score of scores) {
    if (score.value >= 1 && score.value <= 5) {
      byDimension[score.dimension].push(score.value);
    }
  }

  const average = (values: number[]): number | null => {
    if (values.length === 0) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    // Round to nearest 0.5 for clarity
    return Math.round((sum / values.length) * 2) / 2;
  };

  return {
    innovation: average(byDimension.INNOVATION),
    feasibility: average(byDimension.FEASIBILITY),
    businessImpact: average(byDimension.BUSINESS_IMPACT),
  };
}

/**
 * Determines if score summary should be visible to submitter
 * Only visible after idea has been decided (accepted or rejected)
 */
export function canViewScoreSummary(ideaStatus: string): boolean {
  return ideaStatus === "accepted" || ideaStatus === "rejected";
}

export function canViewScoreSummaryForSubmitter(
  ideaStatus: string,
  reviewStage: string | null | undefined,
): boolean {
  void reviewStage;
  return canViewScoreSummary(ideaStatus);
}

/**
 * Filters scores by dimension for display purposes
 */
export function filterScoresForDisplay(
  scores: IdeaScore[],
  dimension: string
): IdeaScore[] {
  return scores.filter((s) => s.dimension === dimension);
}
