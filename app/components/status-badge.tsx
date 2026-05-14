type StatusBadgeProps = {
  status: string;
  label?: string;
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-sky-100 text-sky-800",
  submitted: "bg-slate-100 text-slate-800",
  under_review: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
  initial_screening: "bg-indigo-100 text-indigo-800",
  technical_review: "bg-blue-100 text-blue-800",
  business_impact_review: "bg-violet-100 text-violet-800",
  final_decision: "bg-purple-100 text-purple-800",
};

function statusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-800"
      }`}
    >
      {label ?? statusLabel(status)}
    </span>
  );
}
