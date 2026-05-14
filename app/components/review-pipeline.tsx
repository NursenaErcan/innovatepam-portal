import React from 'react';
import { STAGE_LABELS, REVIEW_STAGES, ReviewStage } from '@/lib/review-stages';

interface ReviewPipelineProps {
  currentStage: ReviewStage | null;
  isAdmin?: boolean;
  onAdvance?: () => void;
  onRetreat?: () => void;
  disableAdvance?: boolean;
  disableRetreat?: boolean;
}

export const ReviewPipeline: React.FC<ReviewPipelineProps> = ({
  currentStage,
  isAdmin = false,
  onAdvance,
  onRetreat,
  disableAdvance,
  disableRetreat,
}) => {
  const currentIdx = currentStage ? REVIEW_STAGES.indexOf(currentStage) : -1;

  return (
    <nav aria-label="Review Stages" className="flex items-center gap-2" tabIndex={0}>
      {REVIEW_STAGES.map((stage, idx) => (
        <React.Fragment key={stage}>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              idx === currentIdx
                ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}
            aria-current={idx === currentIdx ? 'step' : undefined}
            aria-label={STAGE_LABELS[stage]}
          >
            {STAGE_LABELS[stage]}
          </span>
          {idx < REVIEW_STAGES.length - 1 && <span aria-hidden="true">→</span>}
        </React.Fragment>
      ))}
      {isAdmin && (
        <div className="flex gap-1 ml-4">
          <button
            type="button"
            onClick={onRetreat}
            disabled={disableRetreat}
            tabIndex={0}
            aria-disabled={disableRetreat}
            title={disableRetreat ? 'Cannot retreat before Initial Screening' : 'Retreat to previous stage'}
            className={`px-2 py-1 rounded border text-xs ${disableRetreat ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'}`}
          >
            ◀
          </button>
          <button
            type="button"
            onClick={onAdvance}
            disabled={disableAdvance}
            tabIndex={0}
            aria-disabled={disableAdvance}
            title={disableAdvance ? 'Cannot advance past Final Decision' : 'Advance to next stage'}
            className={`px-2 py-1 rounded border text-xs ${disableAdvance ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'}`}
          >
            ▶
          </button>
        </div>
      )}
    </nav>
  );
};
