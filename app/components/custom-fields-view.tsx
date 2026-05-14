import { getCategoryFieldDefinitions } from "@/lib/category-fields";

type CustomFieldsViewProps = {
  category: string;
  customFields?: unknown;
};

function getRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function formatValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }

  return "";
}

export default function CustomFieldsView({ category, customFields }: CustomFieldsViewProps) {
  const fields = getCategoryFieldDefinitions(category);
  const values = getRecord(customFields);

  if (!fields.length || Object.keys(values).length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
      <p className="text-sm font-medium text-slate-800">Category Details</p>
      {fields.map((field) => {
        const value = formatValue(values[field.key]);
        if (!value) {
          return null;
        }

        return (
          <div key={field.key} className="text-sm text-slate-700">
            <p className="font-medium text-slate-800">{field.label}</p>
            <p className="whitespace-pre-wrap">{value}</p>
          </div>
        );
      })}
    </div>
  );
}
