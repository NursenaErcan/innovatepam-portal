import StatusBadge from "@/app/components/status-badge";
import CustomFieldsView from "@/app/components/custom-fields-view";

type IdeaCardProps = {
  idea: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    customFields?: unknown;
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
    submitter?: {
      email: string;
    };
  };
  showSubmitter?: boolean;
  showCustomFields?: boolean;
};

export default function IdeaCard({
  idea,
  showSubmitter = false,
  showCustomFields = false,
}: IdeaCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{idea.title}</h3>
          <p className="mt-1 text-sm text-slate-600">
            Category: {idea.category.replaceAll("_", " ")}
          </p>
          <p className="text-sm text-slate-600">
            Created: {new Date(idea.createdAt).toLocaleString()}
          </p>
          {showSubmitter && idea.submitter ? (
            <p className="text-sm text-slate-700">Submitter: {idea.submitter.email}</p>
          ) : null}
        </div>
        <StatusBadge status={idea.status} />
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{idea.description}</p>

      {showCustomFields ? (
        <CustomFieldsView category={idea.category} customFields={idea.customFields} />
      ) : null}

      {idea.attachments && idea.attachments.length > 0 ? (
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
          <p className="font-medium text-slate-800">Attachments</p>
          <ul className="mt-2 space-y-3">
            {idea.attachments.map((attachment) => (
              <li key={attachment.id} className="rounded border border-slate-200 bg-white p-2">
                {attachment.previewUrl ? (
                  <a href={attachment.previewUrl} target="_blank" rel="noreferrer" className="inline-block">
                    <img
                      src={attachment.previewUrl}
                      alt={`Preview of ${attachment.fileName}`}
                      className="mb-2 h-24 w-24 rounded object-cover"
                    />
                  </a>
                ) : null}
                {attachment.previewUrl ? (
                  <a
                    href={attachment.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline"
                  >
                    {attachment.fileName}
                  </a>
                ) : (
                  <span className="text-slate-800">{attachment.fileName}</span>
                )}
                <div className="mt-2">
                  <a
                    href={attachment.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Download
                  </a>
                </div>
                <p className="text-slate-600">
                  {(attachment.size / 1024).toFixed(1)} KB • {attachment.mimeType}
                </p>
                <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                  <p>previewUrl: {attachment.previewUrl ?? "(none)"}</p>
                  <p>downloadUrl: {attachment.downloadUrl}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {idea.evaluationComments && idea.evaluationComments.length > 0 ? (
        <div className="mt-4 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-800">Evaluation Comments</p>
          {idea.evaluationComments.map((comment) => (
            <div key={comment.id} className="text-sm text-slate-700">
              <p>{comment.text}</p>
              <p className="text-xs text-slate-500">
                {comment.admin?.email ? `${comment.admin.email} • ` : ""}
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
