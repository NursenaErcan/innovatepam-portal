/**
 * TypeScript types and interfaces for Phase 7 Scoring System
 */

import { IdeaScore as PrismaIdeaScore } from "@prisma/client";

// Re-export Prisma type
export type IdeaScore = PrismaIdeaScore;

// Scoring dimension type
export type ScoringDimension = "INNOVATION" | "FEASIBILITY" | "BUSINESS_IMPACT";

// Aggregate score summary (for submitter view)
export interface AggregateScore {
  innovation: number | null;
  feasibility: number | null;
  businessImpact: number | null;
}

// Score with reviewer info
export interface ScoreWithReviewer extends IdeaScore {
  reviewer: {
    id: string;
    email: string;
  };
}

// Score input component props
export interface ScoreInputProps {
  ideaId: string;
  dimension: ScoringDimension;
  currentValue?: number | null;
  onSave?: (value: number) => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  isDraft?: boolean;
}

// Score summary component props
export interface ScoreSummaryProps {
  scores: AggregateScore;
  loading?: boolean;
}

// Admin score list component props
export interface AdminScoreListProps {
  ideaId: string;
  scores: ScoreWithReviewer[];
  onRefresh?: () => Promise<void>;
  loading?: boolean;
}

// API response types
export interface ScoreApiResponse {
  success: boolean;
  score?: IdeaScore;
  error?: string;
}

export interface ScoresApiResponse {
  scores: ScoreWithReviewer[];
}

export interface ScoreSummaryApiResponse {
  innovation: number | null;
  feasibility: number | null;
  businessImpact: number | null;
}

// Score input form data
export interface ScoreFormData {
  dimension: ScoringDimension;
  value: number | null;
}

// Bulk score update request
export interface BulkScoreUpdate {
  ideaId: string;
  scores: ScoreFormData[];
}
