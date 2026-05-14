"use client";

/**
 * ScoreSummary Component
 * Submitter-visible component showing aggregated scores after Final Decision
 * Displays average scores for Innovation, Feasibility, Business Impact
 */

import { ScoreSummaryProps } from "@/lib/scoring-types";

export function ScoreSummary({ scores, loading = false }: ScoreSummaryProps) {
  if (loading) {
    return (
      <div className="border rounded p-4 bg-gray-50 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-32 mb-3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasScores =
    scores.innovation !== null ||
    scores.feasibility !== null ||
    scores.businessImpact !== null;

  if (!hasScores) {
    return (
      <div className="border rounded p-4 bg-gray-50 text-gray-600 text-sm">
        No evaluation scores available.
      </div>
    );
  }

  const formatScore = (value: number | null): string => {
    if (value === null) return "—";
    return value.toFixed(1);
  };

  return (
    <div className="border rounded p-4 bg-blue-50">
      <h3 className="font-semibold text-gray-900 mb-3">Evaluation Scores</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-3 rounded">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
            Innovation
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {formatScore(scores.innovation)}
          </p>
          <p className="text-xs text-gray-500 mt-1">out of 5</p>
        </div>
        <div className="bg-white p-3 rounded">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
            Feasibility
          </p>
          <p className="text-2xl font-bold text-green-600">
            {formatScore(scores.feasibility)}
          </p>
          <p className="text-xs text-gray-500 mt-1">out of 5</p>
        </div>
        <div className="bg-white p-3 rounded">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
            Business Impact
          </p>
          <p className="text-2xl font-bold text-purple-600">
            {formatScore(scores.businessImpact)}
          </p>
          <p className="text-xs text-gray-500 mt-1">out of 5</p>
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-3">
        Scores represent the average evaluation from the review panel.
      </p>
    </div>
  );
}
