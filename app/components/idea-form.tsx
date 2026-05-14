"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { IDEA_CATEGORIES, IMPLEMENTATION_COMPLEXITY_OPTIONS } from "@/lib/category-fields";

type IdeaCategory = (typeof IDEA_CATEGORIES)[number]["value"];

type EditableIdea = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  customFields?: unknown;
};

type IdeaFormProps = {
  onChanged: () => Promise<void>;
  editingIdea?: EditableIdea | null;
  onEditingCleared?: () => void;
};

const MAX_ATTACHMENTS_PER_IDEA = 10;
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpg",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

export default function IdeaForm({ onChanged, editingIdea, onEditingCleared }: IdeaFormProps) {
  const initialCustomFields = toRecord(editingIdea?.customFields);
  const [title, setTitle] = useState(editingIdea?.title ?? "");
  const [description, setDescription] = useState(editingIdea?.description ?? "");
  const [category, setCategory] = useState<IdeaCategory>(
    (editingIdea?.category as IdeaCategory) || IDEA_CATEGORIES[0].value,
  );
  const [architectureImpact, setArchitectureImpact] = useState(
    String(initialCustomFields.architectureImpact ?? ""),
  );
  const [technologyStack, setTechnologyStack] = useState(
    String(initialCustomFields.technologyStack ?? ""),
  );
  const [implementationComplexity, setImplementationComplexity] = useState(
    String(initialCustomFields.implementationComplexity ?? ""),
  );
  const [currentProcess, setCurrentProcess] = useState(String(initialCustomFields.currentProcess ?? ""));
  const [proposedImprovement, setProposedImprovement] = useState(
    String(initialCustomFields.proposedImprovement ?? ""),
  );
  const [estimatedTimeSavingsHours, setEstimatedTimeSavingsHours] = useState(
    initialCustomFields.estimatedTimeSavingsHours == null
      ? ""
      : String(initialCustomFields.estimatedTimeSavingsHours),
  );
  const [clientProblem, setClientProblem] = useState(String(initialCustomFields.clientProblem ?? ""));
  const [businessImpact, setBusinessImpact] = useState(String(initialCustomFields.businessImpact ?? ""));
  const [targetIndustry, setTargetIndustry] = useState(String(initialCustomFields.targetIndustry ?? ""));
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const isEditingDraft = Boolean(editingIdea && editingIdea.status === "draft");

  const formTitle = useMemo(() => {
    if (isEditingDraft) {
      return "Edit Draft";
    }

    return "Submit New Idea";
  }, [isEditingDraft]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setCategory(IDEA_CATEGORIES[0].value);
    setArchitectureImpact("");
    setTechnologyStack("");
    setImplementationComplexity("");
    setCurrentProcess("");
    setProposedImprovement("");
    setEstimatedTimeSavingsHours("");
    setClientProblem("");
    setBusinessImpact("");
    setTargetIndustry("");
    setFiles([]);
    setFieldErrors({});
    setError(null);
  }

  function getCustomFieldsPayload(): Record<string, unknown> {
    if (category === "Technical_Innovation") {
      return {
        architectureImpact: architectureImpact.trim(),
        technologyStack: technologyStack.trim(),
        implementationComplexity,
      };
    }

    if (category === "Process_Improvement") {
      const parsedHours = Number.parseInt(estimatedTimeSavingsHours, 10);
      return {
        currentProcess: currentProcess.trim(),
        proposedImprovement: proposedImprovement.trim(),
        estimatedTimeSavingsHours: Number.isNaN(parsedHours) ? estimatedTimeSavingsHours : parsedHours,
      };
    }

    if (category === "Client_Solution") {
      return {
        clientProblem: clientProblem.trim(),
        businessImpact: businessImpact.trim(),
        targetIndustry: targetIndustry.trim(),
      };
    }

    return {};
  }

  function validateCustomFields(): Record<string, string> {
    const errors: Record<string, string> = {};

    if (category === "Technical_Innovation") {
      if (!architectureImpact.trim()) {
        errors.architectureImpact = "Architecture impact is required.";
      }
      if (!technologyStack.trim()) {
        errors.technologyStack = "Technology stack is required.";
      }
      if (!IMPLEMENTATION_COMPLEXITY_OPTIONS.includes(implementationComplexity as "low" | "medium" | "high")) {
        errors.implementationComplexity = "Select low, medium, or high.";
      }
    }

    if (category === "Process_Improvement") {
      if (!currentProcess.trim()) {
        errors.currentProcess = "Current process is required.";
      }
      if (!proposedImprovement.trim()) {
        errors.proposedImprovement = "Proposed improvement is required.";
      }

      const parsed = Number.parseInt(estimatedTimeSavingsHours, 10);
      if (!estimatedTimeSavingsHours.trim() || String(parsed) !== estimatedTimeSavingsHours.trim() || parsed <= 0) {
        errors.estimatedTimeSavingsHours = "Enter a positive integer number of hours.";
      }
    }

    if (category === "Client_Solution") {
      if (!clientProblem.trim()) {
        errors.clientProblem = "Client problem is required.";
      }
      if (!businessImpact.trim()) {
        errors.businessImpact = "Business impact is required.";
      }
      if (!targetIndustry.trim()) {
        errors.targetIndustry = "Target industry is required.";
      }
    }

    return errors;
  }

  function getAttachmentErrors(inputFiles: File[]): Record<string, string> {
    const errors: Record<string, string> = {};

    if (inputFiles.length > MAX_ATTACHMENTS_PER_IDEA) {
      errors.attachments = `Select up to ${MAX_ATTACHMENTS_PER_IDEA} files.`;
    }

    inputFiles.forEach((file, index) => {
      if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(file.type)) {
        errors[`attachments.${index}`] = "Only PDF, PNG, JPG, JPEG, and DOCX files are supported.";
        return;
      }

      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        errors[`attachments.${index}`] = "Attachment must be 10MB or smaller.";
      }
    });

    return errors;
  }

  function onAddFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) {
      return;
    }

    const mergedFiles = [...files, ...selected];
    const attachmentErrors = getAttachmentErrors(mergedFiles);
    setFiles(mergedFiles);
    setFieldErrors((previous) => ({
      ...Object.fromEntries(Object.entries(previous).filter(([key]) => !key.startsWith("attachments"))),
      ...attachmentErrors,
    }));

    event.target.value = "";
  }

  function onRemoveFile(indexToRemove: number) {
    const nextFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(nextFiles);

    const attachmentErrors = getAttachmentErrors(nextFiles);
    setFieldErrors((previous) => ({
      ...Object.fromEntries(Object.entries(previous).filter(([key]) => !key.startsWith("attachments"))),
      ...attachmentErrors,
    }));
  }

  async function createIdea(submissionMode: "draft" | "final"): Promise<Response> {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("submissionMode", submissionMode);
    formData.append("customFields", JSON.stringify(getCustomFieldsPayload()));
    files.forEach((file) => {
      formData.append("attachment", file);
    });

    return fetch("/api/ideas", {
      method: "POST",
      body: formData,
    });
  }

  async function updateDraft(): Promise<Response> {
    return fetch(`/api/ideas/${editingIdea?.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        category,
        customFields: getCustomFieldsPayload(),
      }),
    });
  }

  async function submitExistingDraft(): Promise<Response> {
    return fetch(`/api/ideas/${editingIdea?.id}/submit`, {
      method: "POST",
    });
  }

  async function handleAction(submissionMode: "draft" | "final") {
    setError(null);
    setFieldErrors({});

    const attachmentErrors = getAttachmentErrors(files);
    const customFieldErrors = submissionMode === "final" ? validateCustomFields() : {};
    const nextFieldErrors = {
      ...attachmentErrors,
      ...customFieldErrors,
    };

    if (submissionMode === "final") {
      if (!title.trim() || !description.trim()) {
        nextFieldErrors.title = !title.trim() ? "Title is required." : nextFieldErrors.title;
        nextFieldErrors.description = !description.trim()
          ? "Description is required."
          : nextFieldErrors.description;
      }
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);

    try {
      let response: Response;

      if (isEditingDraft) {
        response = submissionMode === "draft" ? await updateDraft() : await submitExistingDraft();
      } else {
        response = await createIdea(submissionMode);
      }

      const payload = await response.json().catch(() => ({ error: "Unexpected response" }));
      if (!response.ok) {
        if (payload.fieldErrors && typeof payload.fieldErrors === "object") {
          setFieldErrors(payload.fieldErrors as Record<string, string>);
        }
        setError(payload.error ?? "Failed to save idea.");
        return;
      }

      await onChanged();

      if (submissionMode === "final") {
        resetForm();
        onEditingCleared?.();
      } else if (!isEditingDraft && submissionMode === "draft") {
        // Also reset after saving a new draft, so form is ready for new idea
        resetForm();
      } else if (isEditingDraft && submissionMode === "draft") {
        setError("Draft saved.");
      }
    } catch {
      setError("Failed to save idea.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleAction("final");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{formTitle}</h2>

      <div>
        <label htmlFor="idea-title" className="block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          id="idea-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          aria-invalid={Boolean(fieldErrors.title)}
        />
        {fieldErrors.title ? <p className="mt-1 text-sm text-rose-700">{fieldErrors.title}</p> : null}
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
          aria-invalid={Boolean(fieldErrors.description)}
        />
        {fieldErrors.description ? <p className="mt-1 text-sm text-rose-700">{fieldErrors.description}</p> : null}
      </div>

      <div>
        <label htmlFor="idea-category" className="block text-sm font-medium text-slate-700">
          Category
        </label>
        <select
          id="idea-category"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value as IdeaCategory);
            setFieldErrors({});
          }}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          {IDEA_CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {category === "Technical_Innovation" ? (
        <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">Technical Innovation Details</p>
          <div>
            <label htmlFor="architecture-impact" className="block text-sm font-medium text-slate-700">
              Architecture impact
            </label>
            <textarea
              id="architecture-impact"
              value={architectureImpact}
              onChange={(event) => setArchitectureImpact(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              rows={3}
            />
            {fieldErrors.architectureImpact ? <p className="mt-1 text-sm text-rose-700">{fieldErrors.architectureImpact}</p> : null}
          </div>
          <div>
            <label htmlFor="technology-stack" className="block text-sm font-medium text-slate-700">Technology stack</label>
            <input
              id="technology-stack"
              value={technologyStack}
              onChange={(event) => setTechnologyStack(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
            {fieldErrors.technologyStack ? <p className="mt-1 text-sm text-rose-700">{fieldErrors.technologyStack}</p> : null}
          </div>
          <div>
            <label htmlFor="implementation-complexity" className="block text-sm font-medium text-slate-700">Implementation complexity</label>
            <select
              id="implementation-complexity"
              value={implementationComplexity}
              onChange={(event) => setImplementationComplexity(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="">Select complexity</option>
              {IMPLEMENTATION_COMPLEXITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {fieldErrors.implementationComplexity ? <p className="mt-1 text-sm text-rose-700">{fieldErrors.implementationComplexity}</p> : null}
          </div>
        </div>
      ) : null}

      {category === "Process_Improvement" ? (
        <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">Process Improvement Details</p>
          <div>
            <label htmlFor="current-process" className="block text-sm font-medium text-slate-700">Current process</label>
            <textarea
              id="current-process"
              value={currentProcess}
              onChange={(event) => setCurrentProcess(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              rows={3}
            />
            {fieldErrors.currentProcess ? <p className="mt-1 text-sm text-rose-700">{fieldErrors.currentProcess}</p> : null}
          </div>
          <div>
            <label htmlFor="proposed-improvement" className="block text-sm font-medium text-slate-700">Proposed improvement</label>
            <textarea
              id="proposed-improvement"
              value={proposedImprovement}
              onChange={(event) => setProposedImprovement(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              rows={3}
            />
            {fieldErrors.proposedImprovement ? <p className="mt-1 text-sm text-rose-700">{fieldErrors.proposedImprovement}</p> : null}
          </div>
          <div>
            <label htmlFor="estimated-hours" className="block text-sm font-medium text-slate-700">Estimated time savings (hours)</label>
            <input
              id="estimated-hours"
              type="number"
              min={1}
              step={1}
              value={estimatedTimeSavingsHours}
              onChange={(event) => setEstimatedTimeSavingsHours(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
            {fieldErrors.estimatedTimeSavingsHours ? <p className="mt-1 text-sm text-rose-700">{fieldErrors.estimatedTimeSavingsHours}</p> : null}
          </div>
        </div>
      ) : null}

      {category === "Client_Solution" ? (
        <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">Client Solution Details</p>
          <div>
            <label htmlFor="client-problem" className="block text-sm font-medium text-slate-700">Client problem</label>
            <textarea
              id="client-problem"
              value={clientProblem}
              onChange={(event) => setClientProblem(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              rows={3}
            />
            {fieldErrors.clientProblem ? <p className="mt-1 text-sm text-rose-700">{fieldErrors.clientProblem}</p> : null}
          </div>
          <div>
            <label htmlFor="business-impact" className="block text-sm font-medium text-slate-700">Business impact</label>
            <textarea
              id="business-impact"
              value={businessImpact}
              onChange={(event) => setBusinessImpact(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              rows={3}
            />
            {fieldErrors.businessImpact ? <p className="mt-1 text-sm text-rose-700">{fieldErrors.businessImpact}</p> : null}
          </div>
          <div>
            <label htmlFor="target-industry" className="block text-sm font-medium text-slate-700">Target industry</label>
            <input
              id="target-industry"
              value={targetIndustry}
              onChange={(event) => setTargetIndustry(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
            {fieldErrors.targetIndustry ? <p className="mt-1 text-sm text-rose-700">{fieldErrors.targetIndustry}</p> : null}
          </div>
        </div>
      ) : null}

      <div>
        <label htmlFor="idea-file" className="block text-sm font-medium text-slate-700">
          Attachments (optional, up to 10 files, PDF/PNG/JPG/JPEG/DOCX, max 10MB each)
        </label>
        <input
          id="idea-file"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.docx"
          multiple
          onChange={onAddFiles}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        {fieldErrors.attachments ? <p className="mt-1 text-sm text-rose-700">{fieldErrors.attachments}</p> : null}

        {files.length > 0 ? (
          <ul className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            {files.map((file, index) => (
              <li key={`${file.name}-${file.size}-${index}`} className="rounded border border-slate-200 bg-white p-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-600">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Remove
                  </button>
                </div>
                {fieldErrors[`attachments.${index}`] ? (
                  <p className="mt-1 text-sm text-rose-700">{fieldErrors[`attachments.${index}`]}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {error ? (
        <p className={`text-sm ${error === "Draft saved." ? "text-emerald-700" : "text-rose-700"}`}>{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleAction("draft")}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-70"
        >
          {submitting ? "Saving..." : isEditingDraft ? "Save Draft" : "Save as Draft"}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-70"
        >
          {submitting ? "Submitting..." : isEditingDraft ? "Submit Draft" : "Submit Idea"}
        </button>
        {isEditingDraft ? (
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              onEditingCleared?.();
              resetForm();
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-70"
          >
            Cancel Editing
          </button>
        ) : null}
      </div>
    </form>
  );
}

