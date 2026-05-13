"use client";

import { useState } from "react";
import IdeaCard from "@/app/components/idea-card";
import IdeaForm from "@/app/components/idea-form";

type SubmitterIdea = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string | Date;
  attachment?: {
    fileName: string;
    storagePath: string;
    size: number;
    mimeType: string;
  } | null;
  evaluationComments?: Array<{
    id: string;
    text: string;
    createdAt: string | Date;
    admin?: {
      email: string;
    };
  }>;
};

type SubmitterDashboardProps = {
  initialIdeas: SubmitterIdea[];
};

export default function SubmitterDashboard({ initialIdeas }: SubmitterDashboardProps) {
  const [ideas, setIdeas] = useState(initialIdeas);

  async function refreshIdeas() {
    const response = await fetch("/api/ideas", { method: "GET" });
    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    setIdeas(payload.ideas ?? []);
  }

  return (
    <div className="space-y-6">
      <IdeaForm onSubmitted={refreshIdeas} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Your Submitted Ideas</h2>
        {ideas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            No ideas submitted yet. Start by sharing your first innovation idea.
          </div>
        ) : (
          ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)
        )}
      </section>
    </div>
  );
}
