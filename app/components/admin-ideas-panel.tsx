"use client";

import { useState } from "react";
import IdeaCard from "@/app/components/idea-card";
import { ReviewPipeline } from "@/app/components/review-pipeline";
import { StageCommentForm } from "@/app/components/stage-comment-form";
import { StageCommentList } from "@/app/components/stage-comment-list";
import { REVIEW_STAGES, type ReviewStage } from "@/lib/review-stages";

type AdminIdea = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  reviewStage: ReviewStage | null;
  customFields?: unknown;
  createdAt: string | Date;
  submitter: {
    email: string;
  };
  attachments?: Array<{
    id: string;
    fileName: string;
    downloadUrl: string;
    previewUrl?: string | null;
    size: number;
    mimeType: string;
    displayOrder?: number;
  }>;
  evaluationComments: Array<{
    id: string;
    text: string;
    createdAt: string | Date;
    admin?: {
      email: string;
    };
  }>;
  stageComments: Array<{
    id: string;
    stage: ReviewStage;
    stageLabel?: string;
    text: string;
    createdAt: string | Date;
    admin?: {
      id: string;
      email: string;
    };
  }>;
};

type AdminIdeasPanelProps = {
  initialIdeas: AdminIdea[];
};

export default function AdminIdeasPanel({ initialIdeas }: AdminIdeasPanelProps) {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [error, setError] = useState<string | null>(null);
  const [submittingCommentIdeaId, setSubmittingCommentIdeaId] = useState<string | null>(null);

  async function refreshIdeas() {
    const response = await fetch("/api/admin/ideas");
    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    setIdeas(payload.ideas ?? []);
  }

  async function onStageTransition(ideaId: string, direction: "forward" | "backward") {
    setError(null);

    const response = await fetch(`/api/admin/${ideaId}/review-stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Stage transition failed." }));
      setError(payload.error ?? "Stage transition failed.");
      return;
    }

    await refreshIdeas();
  }

  async function onAddStageComment(ideaId: string, text: string, stage: ReviewStage) {
    setError(null);
    setSubmittingCommentIdeaId(ideaId);

    if (!text.trim()) {
      setError("Comment cannot be empty.");
      setSubmittingCommentIdeaId(null);
      return;
    }

    const response = await fetch(`/api/admin/${ideaId}/stage-comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, stage }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Comment submission failed." }));
      setError(payload.error ?? "Comment submission failed.");
      setSubmittingCommentIdeaId(null);
      return;
    }

    await refreshIdeas();
    setSubmittingCommentIdeaId(null);
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      {ideas.map((idea) => (
        <section key={idea.id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <IdeaCard idea={idea} showSubmitter showCustomFields />

          <div className="space-y-4">
            <ReviewPipeline
              currentStage={idea.reviewStage}
              isAdmin
              onAdvance={() => onStageTransition(idea.id, "forward")}
              onRetreat={() => onStageTransition(idea.id, "backward")}
              disableAdvance={
                !idea.reviewStage ||
                idea.status === "accepted" ||
                idea.status === "rejected" ||
                idea.status === "draft" ||
                REVIEW_STAGES.indexOf(idea.reviewStage) === REVIEW_STAGES.length - 1
              }
              disableRetreat={
                !idea.reviewStage ||
                idea.status === "accepted" ||
                idea.status === "rejected" ||
                idea.status === "draft" ||
                REVIEW_STAGES.indexOf(idea.reviewStage) <= 0
              }
            />

            {idea.reviewStage ? (
              <StageCommentForm
                currentStage={idea.reviewStage}
                onSubmit={(text, stage) => onAddStageComment(idea.id, text, stage)}
                submitting={submittingCommentIdeaId === idea.id}
              />
            ) : (
              <p className="text-sm text-slate-600">This idea is not yet assigned to the review pipeline.</p>
            )}

            {idea.stageComments.length > 0 ? (
              <StageCommentList
                comments={idea.stageComments.map((comment) => ({
                  ...comment,
                  createdAt:
                    typeof comment.createdAt === "string" ? comment.createdAt : comment.createdAt.toISOString(),
                }))}
                showAdmin
              />
            ) : (
              <p className="text-sm text-slate-500">No stage comments yet.</p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
