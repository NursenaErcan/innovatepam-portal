"use client";

/**
 * IdeaScoreSection Component
 * Displays score inputs for an idea with pre-populated values from existing scores
 * Used in admin review panel
 */

import { useScoreFetch } from "@/lib/hooks/useScoreFetch";

interface IdeaScoreSectionProps {
  ideaId: string;
  isDraft: boolean;
  onScoreSaved: (ideaId: string) => void;
  isSaving: boolean;
}

export function IdeaScoreSection({
  ideaId,
  isDraft,
  onScoreSaved,
  isSaving,
}: IdeaScoreSectionProps) {
  const { scores, loading, error, refetch } = useScoreFetch(ideaId);

  if (isDraft) {
    return (
      <div className="border-t border-slate-200 pt-4 text-sm text-slate-600">
        Scores cannot be added to draft ideas.
      </div>
    );
  }

  const handleScoreSaved = async () => {
    await refetch();
    onScoreSaved(ideaId);
  };

  const dimensionValues = [scores.INNOVATION, scores.FEASIBILITY, scores.BUSINESS_IMPACT].filter(
    (entry): entry is number => typeof entry === "number"
  );
  const averageScore =
    dimensionValues.length > 0
      ? (dimensionValues.reduce((accumulator, current) => accumulator + current, 0) / dimensionValues.length).toFixed(2)
      : null;

  return (
    <div className="space-y-3 border-t border-slate-200 pt-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-sm text-slate-900">Evaluation Scores</h3>
        <p className="text-xs font-medium text-slate-700">
          Average Score: {averageScore ?? "-"}
        </p>
      </div>

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      
      {loading && (
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 rounded w-full"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      )}

      {!loading && (
        <div className="space-y-2">
          <ScoreInputWithValue
            ideaId={ideaId}
            dimension="INNOVATION"
            currentValue={scores.INNOVATION}
            onSave={handleScoreSaved}
            disabled={isSaving}
          />
          <ScoreInputWithValue
            ideaId={ideaId}
            dimension="FEASIBILITY"
            currentValue={scores.FEASIBILITY}
            onSave={handleScoreSaved}
            disabled={isSaving}
          />
          <ScoreInputWithValue
            ideaId={ideaId}
            dimension="BUSINESS_IMPACT"
            currentValue={scores.BUSINESS_IMPACT}
            onSave={handleScoreSaved}
            disabled={isSaving}
          />
        </div>
      )}
    </div>
  );
}

// Lazy import to avoid circular dependencies
import { ScoreInput } from "@/app/components/score-input";

interface ScoreInputWithValueProps {
  ideaId: string;
  dimension: "INNOVATION" | "FEASIBILITY" | "BUSINESS_IMPACT";
  currentValue?: number;
  onSave: (value: number) => Promise<void>;
  disabled: boolean;
}

function ScoreInputWithValue({
  ideaId,
  dimension,
  currentValue,
  onSave,
  disabled,
}: ScoreInputWithValueProps) {
  return (
    <ScoreInput
      key={`${dimension}-${currentValue ?? "empty"}`}
      ideaId={ideaId}
      dimension={dimension}
      currentValue={currentValue}
      onSave={onSave}
      disabled={disabled}
    />
  );
}
