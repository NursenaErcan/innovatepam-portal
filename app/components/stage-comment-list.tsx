import React from 'react';
import { STAGE_LABELS, ReviewStage } from '@/lib/review-stages';

export interface StageCommentEntry {
  id: string;
  stage: ReviewStage;
  stageLabel?: string;
  text: string;
  createdAt: string;
  admin?: { id: string; email: string };
}

interface StageCommentListProps {
  comments: StageCommentEntry[];
  showAdmin?: boolean;
}

export const StageCommentList: React.FC<StageCommentListProps> = ({ comments, showAdmin }) => (
  <ul className="space-y-2" aria-label="Stage Comments">
    {comments.map(comment => (
      <li key={comment.id} className="rounded border p-2 bg-slate-50" tabIndex={0}>
        <div className="flex items-center gap-2">
          <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700" aria-label={STAGE_LABELS[comment.stage] || comment.stageLabel}>
            {STAGE_LABELS[comment.stage] || comment.stageLabel}
          </span>
          <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</span>
          {showAdmin && comment.admin && (
            <span className="ml-2 text-xs text-slate-400">by {comment.admin.email}</span>
          )}
        </div>
        <div className="mt-1 text-sm text-slate-800">{comment.text}</div>
      </li>
    ))}
  </ul>
);
