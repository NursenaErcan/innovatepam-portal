"use client";

import { useState } from "react";
import IdeaCard from "@/app/components/idea-card";
import IdeaForm from "@/app/components/idea-form";
import type { AggregateScore } from "@/lib/scoring-types";
import type { ReviewStage } from "@/lib/review-stages";

type SubmitterIdea = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  reviewStage?: ReviewStage | null;
  scoreSummary?: AggregateScore | null;
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

type SubmitterDashboardProps = {
  initialIdeas: SubmitterIdea[];
};

export default function SubmitterDashboard({ initialIdeas }: SubmitterDashboardProps) {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshIdeas() {
    const response = await fetch("/api/ideas", { method: "GET" });
    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    setIdeas(payload.ideas ?? []);
  }

  async function deleteDraft(ideaId: string) {
    setError(null);
    setActionBusy(true);

    try {
      const response = await fetch(`/api/ideas/${ideaId}`, { method: "DELETE" });
      const payload = await response.json().catch(() => ({ error: "Failed to delete draft." }));
      if (!response.ok) {
        setError(payload.error ?? "Failed to delete draft.");
        return;
      }

      if (editingDraftId === ideaId) {
        setEditingDraftId(null);
      }

      await refreshIdeas();
    } finally {
      setActionBusy(false);
    }
  }

  async function submitDraft(ideaId: string) {
    setError(null);
    setActionBusy(true);

    try {
      const response = await fetch(`/api/ideas/${ideaId}/submit`, { method: "POST" });
      const payload = await response.json().catch(() => ({ error: "Failed to submit draft." }));
      if (!response.ok) {
        setError(payload.error ?? "Failed to submit draft.");
        return;
      }

      if (editingDraftId === ideaId) {
        setEditingDraftId(null);
      }

      await refreshIdeas();
    } finally {
      setActionBusy(false);
    }
  }

  const editingIdea =
    editingDraftId == null ? null : ideas.find((idea) => idea.id === editingDraftId && idea.status === "draft") ?? null;

  return (
    <div className="space-y-6">
      <IdeaForm
        key={editingDraftId ?? "new-idea"}
        onChanged={refreshIdeas}
        editingIdea={editingIdea}
        onEditingCleared={() => setEditingDraftId(null)}
      />

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Your Ideas</h2>
        {ideas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            No ideas submitted yet. Start by sharing your first innovation idea.
          </div>
        ) : (
          ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onEditDraft={idea.status === "draft" ? setEditingDraftId : undefined}
              onDeleteDraft={idea.status === "draft" ? deleteDraft : undefined}
              onSubmitDraft={idea.status === "draft" ? submitDraft : undefined}
              actionBusy={actionBusy}
            />
          ))
        )}
      </section>
    </div>
  );
}

