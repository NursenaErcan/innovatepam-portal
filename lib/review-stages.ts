// Review stage constants and helpers for multi-stage review pipeline

export const REVIEW_STAGES = [
  'initial_screening',
  'technical_review',
  'business_impact_review',
  'final_decision',
] as const;

export type ReviewStage = typeof REVIEW_STAGES[number];

// Blind review: stages where submitter identity is hidden from admin view
export const BLIND_STAGES: readonly ReviewStage[] = [
  'initial_screening',
  'technical_review',
  'business_impact_review',
];

export function isBlindStage(stage: ReviewStage | null): boolean {
  return stage !== null && (BLIND_STAGES as readonly string[]).includes(stage);
}

export const STAGE_LABELS: Record<ReviewStage, string> = {
  initial_screening: 'Initial Screening',
  technical_review: 'Technical Review',
  business_impact_review: 'Business Impact Review',
  final_decision: 'Final Decision',
};

export function getNextStage(stage: ReviewStage): ReviewStage | null {
  const idx = REVIEW_STAGES.indexOf(stage);
  if (idx === -1 || idx === REVIEW_STAGES.length - 1) return null;
  return REVIEW_STAGES[idx + 1];
}

export function getPreviousStage(stage: ReviewStage): ReviewStage | null {
  const idx = REVIEW_STAGES.indexOf(stage);
  if (idx <= 0) return null;
  return REVIEW_STAGES[idx - 1];
}

export function isValidReviewStage(value: unknown): value is ReviewStage {
  return typeof value === 'string' && (REVIEW_STAGES as readonly string[]).includes(value);
}
