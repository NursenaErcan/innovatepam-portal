import React, { useState } from 'react';
import { ReviewStage, STAGE_LABELS } from '@/lib/review-stages';

interface StageCommentFormProps {
  currentStage: ReviewStage;
  onSubmit: (text: string, stage: ReviewStage) => void;
  submitting?: boolean;
}

export const StageCommentForm: React.FC<StageCommentFormProps> = ({ currentStage, onSubmit, submitting }) => {
  const [text, setText] = useState('');
  const [stage, setStage] = useState<ReviewStage>(currentStage);
  const [userManuallyChangedStage, setUserManuallyChangedStage] = useState(false);

  // Update stage when currentStage changes, unless user manually changed it
  // Reset manual flag when currentStage actually changes (indicates refresh from API)
  if (!userManuallyChangedStage && stage !== currentStage) {
    setStage(currentStage);
  }

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStage = e.target.value as ReviewStage;
    setStage(newStage);
    setUserManuallyChangedStage(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text, stage);
      // Reset form after submission
      setText('');
      setStage(currentStage);
      setUserManuallyChangedStage(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2"
    >
      <label htmlFor="stage-comment-text" className="text-sm font-medium">Comment</label>
      <textarea
        id="stage-comment-text"
        value={text}
        onChange={e => setText(e.target.value)}
        required
        className="rounded border px-2 py-1 text-sm focus:outline-blue-500"
        aria-label="Stage comment text"
        disabled={submitting}
      />
      <label htmlFor="stage-select" className="text-sm font-medium">Stage</label>
      <select
        id="stage-select"
        value={stage}
        onChange={handleStageChange}
        className="rounded border px-2 py-1 text-sm focus:outline-blue-500"
        aria-label="Stage for comment"
        disabled={submitting}
      >
        {Object.entries(STAGE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded bg-blue-600 text-white px-3 py-1 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        disabled={submitting || !text.trim()}
        aria-disabled={submitting || !text.trim()}
      >
        {submitting ? 'Submitting...' : 'Add Comment'}
      </button>
    </form>
  );
};
