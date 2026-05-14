/**
 * useScoreUpdate Hook
 * Manages score update state and API calls for ScoreInput component
 */

import { useState, useCallback } from "react";

export function useScoreUpdate(ideaId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateScore = useCallback(
    async (dimension: string, value: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/${ideaId}/score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dimension, value }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Failed to update score (${response.status})`);
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update score";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [ideaId]
  );

  return { updateScore, loading, error };
}
