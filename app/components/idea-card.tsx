import StatusBadge from "@/app/components/status-badge";

type IdeaCardProps = {
  idea: {
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
    submitter?: {
      email: string;
    };
  };
  showSubmitter?: boolean;
};

export default function IdeaCard({ idea, showSubmitter = false }: IdeaCardProps) {
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

      {idea.attachment ? (
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
          <p className="font-medium text-slate-800">Attachment</p>
          <a
            href={idea.attachment.storagePath}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 underline"
          >
            {idea.attachment.fileName}
          </a>
          <p className="text-slate-600">
            {(idea.attachment.size / 1024).toFixed(1)} KB • {idea.attachment.mimeType}
          </p>
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
