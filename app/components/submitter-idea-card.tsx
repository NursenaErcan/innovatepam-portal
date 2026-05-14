"use client";

/**
 * SubmitterIdeaCard Component
 * Wrapper around IdeaCard that adds score summary for decided ideas
 * Used in submitter dashboard to show scores after Final Decision
 */

import IdeaCard from "@/app/components/idea-card";
import { ScoreSummary } from "@/app/components/score-summary";
import { useScoreSummary } from "@/lib/hooks/useScoreSummary";
import type { ReviewStage } from "@/lib/review-stages";

interface SubmitterIdeaCardProps {
  idea: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    reviewStage?: ReviewStage | null;
    createdAt: string | Date;
    attachments?: Array<{
      id: string;
      fileName: string;
      downloadUrl: string;
      previewUrl?: string | null;
      size: number;
      mimeType: string;
      displayOrder?: number;
    }>;
    evaluationComments?: Array<{
      id: string;
      text: string;
      createdAt: string | Date;
      admin?: {
        email: string;
      };
    }>;
    stageComments?: Array<{
      id: string;
      text: string;
      stage: ReviewStage;
      createdAt: string | Date;
    }>;
  };
  onEditDraft?: (id: string) => void;
  onDeleteDraft?: (id: string) => void;
  onSubmitDraft?: (id: string) => void;
  actionBusy?: boolean;
}

export function SubmitterIdeaCard({
  idea,
  onEditDraft,
  onDeleteDraft,
  onSubmitDraft,
  actionBusy,
}: SubmitterIdeaCardProps) {
  const { scores, loading } = useScoreSummary(idea.id, idea.status);

  const showScoreSummary = idea.status === "accepted" || idea.status === "rejected";

  return (
    <div className="space-y-3">
      <IdeaCard
        idea={idea}
        onEditDraft={onEditDraft}
        onDeleteDraft={onDeleteDraft}
        onSubmitDraft={onSubmitDraft}
        actionBusy={actionBusy}
      />
      
      {showScoreSummary && scores && (
        <div className="ml-4 mr-4">
          <ScoreSummary scores={scores} loading={loading} />
        </div>
      )}
    </div>
  );
}
