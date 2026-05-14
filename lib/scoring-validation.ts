/**
 * Scoring validation utilities for Phase 7 Scoring System
 * Validates score values and dimensions against business rules
 */

export function validateScore(value: unknown): { valid: boolean; error?: string } {
  if (value === null || value === undefined || value === "") {
    // Scores are optional - null/empty is valid
    return { valid: true };
  }

  const numValue = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(numValue)) {
    return { valid: false, error: "Score must be an integer" };
  }

  if (numValue < 1 || numValue > 5) {
    return { valid: false, error: "Score must be between 1 and 5" };
  }

  return { valid: true };
}

export type ScoringDimension = "INNOVATION" | "FEASIBILITY" | "BUSINESS_IMPACT";

const VALID_DIMENSIONS: Record<string, boolean> = {
  INNOVATION: true,
  FEASIBILITY: true,
  BUSINESS_IMPACT: true,
};

export function validateDimension(dimension: unknown): dimension is ScoringDimension {
  return typeof dimension === "string" && VALID_DIMENSIONS[dimension] === true;
}

export function isValidDimension(dimension: unknown): boolean {
  return validateDimension(dimension);
}
