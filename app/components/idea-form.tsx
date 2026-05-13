"use client";

import { FormEvent, useState } from "react";

export const IDEA_CATEGORIES = [
  { label: "Technical Innovation", value: "Technical_Innovation" },
  { label: "Process Improvement", value: "Process_Improvement" },
  { label: "Client Solution", value: "Client_Solution" },
  { label: "Other", value: "Other" },
];

type IdeaFormProps = {
  onSubmitted: () => Promise<void>;
};

export default function IdeaForm({ onSubmitted }: IdeaFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(IDEA_CATEGORIES[0].value);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError("Please attach one file.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("attachment", file);

    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => ({ error: "Unexpected response" }));
      if (!response.ok) {
        setError(payload.error ?? "Failed to submit idea.");
        return;
      }

      setTitle("");
      setDescription("");
      setCategory(IDEA_CATEGORIES[0].value);
      setFile(null);
      await onSubmitted();
    } catch {
      setError("Failed to submit idea.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Submit New Idea</h2>

      <div>
        <label htmlFor="idea-title" className="block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          id="idea-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          required
        />
      </div>

      <div>
        <label htmlFor="idea-description" className="block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="idea-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          rows={4}
          required
        />
      </div>

      <div>
        <label htmlFor="idea-category" className="block text-sm font-medium text-slate-700">
          Category
        </label>
        <select
          id="idea-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          {IDEA_CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="idea-file" className="block text-sm font-medium text-slate-700">
          Attachment (PDF, PNG, JPG, JPEG, DOCX, max 10MB)
        </label>
        <input
          id="idea-file"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.docx"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          required
        />
      </div>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-70"
      >
        {submitting ? "Submitting..." : "Submit Idea"}
      </button>
    </form>
  );
}
