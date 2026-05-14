/**
 * useScoreFetch Hook
 * Manages score fetching for the admin review panel
 * Organizes scores by dimension for easy access
 */

import { useState, useEffect, useCallback } from "react";
import type { ScoringDimension } from "@/lib/scoring-types";

interface ScoresByDimension {
  INNOVATION?: number;
  FEASIBILITY?: number;
  BUSINESS_IMPACT?: number;
}

interface ScoreApiEntry {
  dimension: ScoringDimension;
  value: number;
  createdAt: string;
}

export function useScoreFetch(ideaId: string) {
  const [scores, setScores] = useState<ScoresByDimension>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/${ideaId}/score`);

      if (!response.ok) {
        if (response.status === 404) {
          // Idea not found or no scores
          setScores({});
          return;
        }
        throw new Error(`Failed to fetch scores (${response.status})`);
      }

      const data = await response.json();
      const scoresByDimension: ScoresByDimension = {};

      if (data.scores && Array.isArray(data.scores)) {
        // Get the most recent score for each dimension (by createdAt)
        const latestScores: { [key: string]: { value: number; createdAt: string } } = {};

        (data.scores as ScoreApiEntry[]).forEach((score) => {
          const dimension = score.dimension as ScoringDimension;
          if (!latestScores[dimension] || new Date(score.createdAt) > new Date(latestScores[dimension].createdAt)) {
            latestScores[dimension] = {
              value: score.value,
              createdAt: score.createdAt,
            };
          }
        });

        // Extract values for each dimension
        (Object.keys(latestScores) as ScoringDimension[]).forEach((dimension) => {
          scoresByDimension[dimension] = latestScores[dimension].value;
        });
      }

      setScores(scoresByDimension);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch scores";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [ideaId]);

  // Fetch scores on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchScores();
  }, [fetchScores]);

  return { scores, loading, error, refetch: fetchScores };
}
