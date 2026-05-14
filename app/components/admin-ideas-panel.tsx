"use client";

import { useState } from "react";
import IdeaCard from "@/app/components/idea-card";
import { ReviewPipeline } from "@/app/components/review-pipeline";
import { StageCommentForm } from "@/app/components/stage-comment-form";
import { StageCommentList } from "@/app/components/stage-comment-list";
import { REVIEW_STAGES, isBlindStage, type ReviewStage } from "@/lib/review-stages";

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

function resolveReviewStage(status: string, reviewStage: ReviewStage | null): ReviewStage | null {
  if (reviewStage) {
    return reviewStage;
  }

  if (status === "submitted" || status === "under_review") {
    return "initial_screening";
  }

  return null;
}

function canRevealSubmitter(status: string, reviewStage: ReviewStage | null): boolean {
  if (status === "accepted" || status === "rejected") {
    return true;
  }

  if (!reviewStage) {
    return false;
  }

  return !isBlindStage(reviewStage);
}

function normalizeIdea(idea: AdminIdea): AdminIdea {
  const normalizedStage = resolveReviewStage(idea.status, idea.reviewStage);
  const revealSubmitter = canRevealSubmitter(idea.status, normalizedStage);

  return {
    ...idea,
    reviewStage: normalizedStage,
    submitter: {
      ...idea.submitter,
      email: revealSubmitter ? idea.submitter.email : "Anonymous Submitter",
    },
  };
}

function extractIdeas(payload: unknown): AdminIdea[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const typedPayload = payload as {
    ideas?: AdminIdea[];
    active?: AdminIdea[];
    resolved?: AdminIdea[];
  };

  if (Array.isArray(typedPayload.ideas)) {
    return typedPayload.ideas.map(normalizeIdea);
  }

  const active = Array.isArray(typedPayload.active) ? typedPayload.active : [];
  const resolved = Array.isArray(typedPayload.resolved) ? typedPayload.resolved : [];
  return [...active, ...resolved].map(normalizeIdea);
}

export default function AdminIdeasPanel({ initialIdeas }: AdminIdeasPanelProps) {
  const [ideas, setIdeas] = useState(initialIdeas.map(normalizeIdea));
  const [error, setError] = useState<string | null>(null);
  const [submittingCommentIdeaId, setSubmittingCommentIdeaId] = useState<string | null>(null);

  async function refreshIdeas() {
    const response = await fetch("/api/admin/ideas");
    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    setIdeas(extractIdeas(payload));
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

  async function onFinalDecision(ideaId: string, status: "accepted" | "rejected") {
    setError(null);

    const response = await fetch(`/api/admin/${ideaId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Failed to update final decision." }));
      setError(payload.error ?? "Failed to update final decision.");
      return;
    }

    await refreshIdeas();
  }

  const activeIdeas = ideas.filter((idea) => idea.status === "submitted" || idea.status === "under_review");
  const resolvedIdeas = ideas.filter((idea) => idea.status === "accepted" || idea.status === "rejected");

  function renderIdea(idea: AdminIdea) {
    const canTakeFinalDecision = idea.reviewStage === "final_decision" && idea.status === "submitted";

    return (
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

          {canTakeFinalDecision ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onFinalDecision(idea.id, "accepted")}
                className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => onFinalDecision(idea.id, "rejected")}
                className="rounded bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Reject
              </button>
            </div>
          ) : null}

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
                createdAt: typeof comment.createdAt === "string" ? comment.createdAt : comment.createdAt.toISOString(),
              }))}
              showAdmin
            />
          ) : (
            <p className="text-sm text-slate-500">No stage comments yet.</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Active Ideas</h2>
        {activeIdeas.length === 0 ? <p className="text-sm text-slate-500">No active ideas.</p> : activeIdeas.map(renderIdea)}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Resolved Ideas</h2>
        {resolvedIdeas.length === 0 ? <p className="text-sm text-slate-500">No resolved ideas.</p> : resolvedIdeas.map(renderIdea)}
      </section>
    </div>
  );
}
