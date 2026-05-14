type StatusBadgeProps = {
  status: string;
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-sky-100 text-sky-800",
  submitted: "bg-slate-100 text-slate-800",
  under_review: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

function statusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-800"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}
