"use client";

import { FormEvent, useState } from "react";
import IdeaCard from "@/app/components/idea-card";

type AdminIdea = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string | Date;
  submitter: {
    email: string;
  };
  attachment?: {
    fileName: string;
    storagePath: string;
    size: number;
    mimeType: string;
  } | null;
  evaluationComments: Array<{
    id: string;
    text: string;
    createdAt: string | Date;
    admin?: {
      email: string;
    };
  }>;
};

type AdminIdeasPanelProps = {
  initialIdeas: AdminIdea[];
};

const STATUSES = ["submitted", "under_review", "accepted", "rejected"];

export default function AdminIdeasPanel({ initialIdeas }: AdminIdeasPanelProps) {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [error, setError] = useState<string | null>(null);

  async function refreshIdeas() {
    const response = await fetch("/api/admin/ideas");
    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    setIdeas(payload.ideas ?? []);
  }

  async function onStatusChange(ideaId: string, status: string) {
    setError(null);

    const response = await fetch(`/api/admin/${ideaId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Status update failed." }));
      setError(payload.error ?? "Status update failed.");
      return;
    }

    await refreshIdeas();
  }

  async function onAddComment(event: FormEvent<HTMLFormElement>, ideaId: string) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const commentText = String(formData.get("commentText") ?? "").trim();

    if (!commentText) {
      setError("Comment cannot be empty.");
      return;
    }

    const response = await fetch(`/api/admin/${ideaId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentText }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Comment submission failed." }));
      setError(payload.error ?? "Comment submission failed.");
      return;
    }

    event.currentTarget.reset();
    await refreshIdeas();
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      {ideas.map((idea) => (
        <section key={idea.id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <IdeaCard idea={idea} showSubmitter />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor={`status-${idea.id}`} className="block text-sm font-medium text-slate-700">
                Update status
              </label>
              <select
                id={`status-${idea.id}`}
                defaultValue={idea.status}
                onChange={(event) => onStatusChange(idea.id, event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={(event) => onAddComment(event, idea.id)} className="space-y-2">
              <label htmlFor={`comment-${idea.id}`} className="block text-sm font-medium text-slate-700">
                Add evaluation comment
              </label>
              <input
                id={`comment-${idea.id}`}
                name="commentText"
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Save comment
              </button>
            </form>
          </div>
        </section>
      ))}
    </div>
  );
}
