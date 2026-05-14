"use client";

/**
 * ScoreInput Component
 * Admin-only component for entering 1-5 scores for a single dimension
 * Appears inline in admin review panel
 */

import { useState, useCallback } from "react";
import { ScoreInputProps } from "@/lib/scoring-types";
import { validateScore } from "@/lib/scoring-validation";

const DIMENSION_LABELS: Record<string, string> = {
  INNOVATION: "Innovation",
  FEASIBILITY: "Feasibility",
  BUSINESS_IMPACT: "Business Impact",
};

export function ScoreInput({
  ideaId,
  dimension,
  currentValue,
  onSave,
  disabled = false,
  loading = false,
  isDraft = false,
}: ScoreInputProps) {
  const [value, setValue] = useState<number | "">(currentValue || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const isDisabled = disabled || saving || loading;

  const handleSave = useCallback(async () => {
    // Clear messages
    setError("");
    setSuccess(false);

    // Allow empty (optional scores)
    if (value === "") return;

    // Validate
    const validation = validateScore(value);
    if (!validation.valid) {
      setError(validation.error || "Invalid score");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/${ideaId}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dimension, value }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setSuccess(true);
      if (onSave) await onSave(typeof value === "number" ? value : 0);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save score");
    } finally {
      setSaving(false);
    }
  }, [ideaId, dimension, value, onSave]);

  return (
    <div className="space-y-1">
      {isDraft ? (
        <div className="text-sm text-gray-600">Scores cannot be added to draft ideas.</div>
      ) : (
        <div className="flex items-center gap-2">
          <label
            htmlFor={`score-${dimension}`}
            className="text-sm font-medium text-gray-700 min-w-32"
          >
            {DIMENSION_LABELS[dimension] || dimension}
          </label>
          <input
            id={`score-${dimension}`}
            type="number"
            min="1"
            max="5"
            value={value}
            onChange={(e) => {
              const next = e.target.value;
              setValue(next === "" ? "" : Number(next));
            }}
            disabled={isDisabled}
            className="border border-gray-300 rounded px-2 py-1 w-16 disabled:bg-gray-100 disabled:cursor-not-allowed"
            aria-label={`Score for ${DIMENSION_LABELS[dimension]}`}
            aria-invalid={error ? "true" : "false"}
          />
          <button
            onClick={handleSave}
            disabled={isDisabled || value === ""}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}
      {error && (
        <p className="text-red-600 text-xs" role="alert">
          {error}
        </p>
      )}
      {success && <p className="text-green-600 text-xs">Saved successfully</p>}
    </div>
  );
}
