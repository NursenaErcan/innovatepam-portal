/**
 * useScoreSummary Hook
 * Manages score summary fetching for submitter dashboard
 * Only fetches scores if idea status allows visibility (accepted/rejected)
 */

import { useState, useEffect, useCallback } from "react";
import type { AggregateScore } from "@/lib/scoring-types";

export function useScoreSummary(ideaId: string, ideaStatus: string | null) {
  const [scores, setScores] = useState<AggregateScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVisibleStatus = ideaStatus === "accepted" || ideaStatus === "rejected";

  const fetchScores = useCallback(async () => {
    // Don't fetch if idea is not in a visible status
    if (!isVisibleStatus) {
      setScores(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ideas/${ideaId}/score-summary`);

      if (!response.ok) {
        if (response.status === 403) {
          // Score summary not visible yet
          setScores(null);
          setError(null);
          setLoading(false);
          return;
        }
        if (response.status === 404) {
          setScores(null);
          setLoading(false);
          return;
        }
        throw new Error(`Failed to fetch score summary (${response.status})`);
      }

      const data = await response.json();
      setScores({
        innovation: data.innovation || null,
        feasibility: data.feasibility || null,
        businessImpact: data.businessImpact || null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch score summary";
      setError(message);
      setScores(null);
    } finally {
      setLoading(false);
    }
  }, [ideaId, isVisibleStatus]);

  // Fetch scores when idea status changes to visible
  useEffect(() => {
    if (isVisibleStatus) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchScores();
    } else {
      setScores(null);
      setLoading(false);
    }
  }, [ideaId, isVisibleStatus, fetchScores]);

  return { scores, loading, error };
}
