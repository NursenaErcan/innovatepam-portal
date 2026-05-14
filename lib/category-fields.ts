export type IdeaCategoryValue =
  | "Technical_Innovation"
  | "Process_Improvement"
  | "Client_Solution"
  | "Other";

export type ImplementationComplexity = "low" | "medium" | "high";

export type DynamicFieldType = "text" | "textarea" | "number" | "select";

export type DynamicFieldDefinition = {
  key: string;
  label: string;
  type: DynamicFieldType;
  required: boolean;
  options?: string[];
  min?: number;
};

export const IDEA_CATEGORIES: Array<{ label: string; value: IdeaCategoryValue }> = [
  { label: "Technical Innovation", value: "Technical_Innovation" },
  { label: "Process Improvement", value: "Process_Improvement" },
  { label: "Client Solution", value: "Client_Solution" },
  { label: "Other", value: "Other" },
];

export const IMPLEMENTATION_COMPLEXITY_OPTIONS: ImplementationComplexity[] = [
  "low",
  "medium",
  "high",
];

export const CATEGORY_FIELD_DEFINITIONS: Record<IdeaCategoryValue, DynamicFieldDefinition[]> = {
  Technical_Innovation: [
    {
      key: "architectureImpact",
      label: "Architecture impact",
      type: "textarea",
      required: true,
    },
    {
      key: "technologyStack",
      label: "Technology stack",
      type: "text",
      required: true,
    },
    {
      key: "implementationComplexity",
      label: "Implementation complexity",
      type: "select",
      required: true,
      options: IMPLEMENTATION_COMPLEXITY_OPTIONS,
    },
  ],
  Process_Improvement: [
    {
      key: "currentProcess",
      label: "Current process",
      type: "textarea",
      required: true,
    },
    {
      key: "proposedImprovement",
      label: "Proposed improvement",
      type: "textarea",
      required: true,
    },
    {
      key: "estimatedTimeSavingsHours",
      label: "Estimated time savings (hours)",
      type: "number",
      required: true,
      min: 1,
    },
  ],
  Client_Solution: [
    {
      key: "clientProblem",
      label: "Client problem",
      type: "textarea",
      required: true,
    },
    {
      key: "businessImpact",
      label: "Business impact",
      type: "textarea",
      required: true,
    },
    {
      key: "targetIndustry",
      label: "Target industry",
      type: "text",
      required: true,
    },
  ],
  Other: [],
};

export function isIdeaCategory(value: string): value is IdeaCategoryValue {
  return Object.keys(CATEGORY_FIELD_DEFINITIONS).includes(value);
}

export function getCategoryFieldDefinitions(category: string): DynamicFieldDefinition[] {
  if (!isIdeaCategory(category)) {
    return [];
  }

  return CATEGORY_FIELD_DEFINITIONS[category];
}

export function getCategoryLabel(category: string): string {
  return category.replaceAll("_", " ");
}
