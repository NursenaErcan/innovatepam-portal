import { IdeaCategory, IdeaStatus } from "@prisma/client";
import {
  IMPLEMENTATION_COMPLEXITY_OPTIONS,
  isIdeaCategory,
  type ImplementationComplexity,
} from "@/lib/category-fields";
import { ALLOWED_ATTACHMENT_MIME_TYPES } from "@/lib/attachments";
import { MAX_ATTACHMENTS_PER_IDEA, MAX_UPLOAD_SIZE_BYTES } from "@/lib/db";

type IdeaValidationResult = {
  error: string;
  fieldErrors?: Record<string, string>;
};

export type SubmissionMode = "draft" | "final";

export function parseSubmissionMode(value: unknown): SubmissionMode {
  return value === "draft" ? "draft" : "final";
}

export function validateEmail(email: string): string | null {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Provide a valid email address.";
  }

  return null;
}

export function validatePassword(password: string): string | null {
  if (!password || password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  return null;
}

export function validateRegisterInput(email: string, password: string): string | null {
  return validateEmail(email) ?? validatePassword(password);
}

export function validateLoginInput(email: string, password: string): string | null {
  if (!email || !password) {
    return "Email and password are required.";
  }

  return validateEmail(email);
}

export function validateIdeaInput(input: {
  title: string;
  description: string;
  category: string;
  attachmentCount: number;
  attachments: Array<{ mimeType: string; size: number }>;
}): IdeaValidationResult | null {
  if (!input.title.trim() || !input.description.trim() || !input.category.trim()) {
    return { error: "Title, description, and category are required." };
  }

  if (!Object.values(IdeaCategory).includes(input.category as IdeaCategory)) {
    return { error: "Invalid idea category." };
  }

  if (input.attachmentCount > MAX_ATTACHMENTS_PER_IDEA) {
    return {
      error: `A maximum of ${MAX_ATTACHMENTS_PER_IDEA} attachments is allowed.`,
      fieldErrors: {
        attachments: `Select up to ${MAX_ATTACHMENTS_PER_IDEA} files.`,
      },
    };
  }

  const fieldErrors: Record<string, string> = {};

  input.attachments.forEach((attachment, index) => {
    if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(attachment.mimeType)) {
      fieldErrors[`attachments.${index}`] =
        "Only PDF, PNG, JPG, JPEG, and DOCX files are supported.";
      return;
    }

    if (attachment.size > MAX_UPLOAD_SIZE_BYTES) {
      fieldErrors[`attachments.${index}`] = "Attachment must be 10MB or smaller.";
    }
  });

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: "One or more attachments are invalid.",
      fieldErrors,
    };
  }

  return null;
}

export function validateDraftIdeaInput(input: {
  title?: string;
  description?: string;
  category?: string;
  attachmentCount: number;
  attachments: Array<{ mimeType: string; size: number }>;
}): IdeaValidationResult | null {
  if (input.category?.trim()) {
    if (!Object.values(IdeaCategory).includes(input.category as IdeaCategory)) {
      return { error: "Invalid idea category." };
    }
  }

  if (input.attachmentCount > MAX_ATTACHMENTS_PER_IDEA) {
    return {
      error: `A maximum of ${MAX_ATTACHMENTS_PER_IDEA} attachments is allowed.`,
      fieldErrors: {
        attachments: `Select up to ${MAX_ATTACHMENTS_PER_IDEA} files.`,
      },
    };
  }

  const fieldErrors: Record<string, string> = {};

  input.attachments.forEach((attachment, index) => {
    if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(attachment.mimeType)) {
      fieldErrors[`attachments.${index}`] =
        "Only PDF, PNG, JPG, JPEG, and DOCX files are supported.";
      return;
    }

    if (attachment.size > MAX_UPLOAD_SIZE_BYTES) {
      fieldErrors[`attachments.${index}`] = "Attachment must be 10MB or smaller.";
    }
  });

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: "One or more attachments are invalid.",
      fieldErrors,
    };
  }

  return null;
}

function getRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function validateCategoryCustomFields(
  category: string,
  customFields: unknown,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!isIdeaCategory(category)) {
    return {
      category: "Invalid idea category.",
    };
  }

  if (category === "Other") {
    return fieldErrors;
  }

  const fields = getRecord(customFields);

  if (category === "Technical_Innovation") {
    if (!getNonEmptyString(fields.architectureImpact)) {
      fieldErrors.architectureImpact = "Architecture impact is required.";
    }

    if (!getNonEmptyString(fields.technologyStack)) {
      fieldErrors.technologyStack = "Technology stack is required.";
    }

    const complexity = fields.implementationComplexity;
    if (
      typeof complexity !== "string" ||
      !IMPLEMENTATION_COMPLEXITY_OPTIONS.includes(
        complexity as ImplementationComplexity,
      )
    ) {
      fieldErrors.implementationComplexity =
        "Implementation complexity must be low, medium, or high.";
    }
  }

  if (category === "Process_Improvement") {
    if (!getNonEmptyString(fields.currentProcess)) {
      fieldErrors.currentProcess = "Current process is required.";
    }

    if (!getNonEmptyString(fields.proposedImprovement)) {
      fieldErrors.proposedImprovement = "Proposed improvement is required.";
    }

    const hours = fields.estimatedTimeSavingsHours;
    if (
      typeof hours !== "number" ||
      !Number.isInteger(hours) ||
      hours <= 0
    ) {
      fieldErrors.estimatedTimeSavingsHours =
        "Estimated time savings must be a positive integer number of hours.";
    }
  }

  if (category === "Client_Solution") {
    if (!getNonEmptyString(fields.clientProblem)) {
      fieldErrors.clientProblem = "Client problem is required.";
    }

    if (!getNonEmptyString(fields.businessImpact)) {
      fieldErrors.businessImpact = "Business impact is required.";
    }

    if (!getNonEmptyString(fields.targetIndustry)) {
      fieldErrors.targetIndustry = "Target industry is required.";
    }
  }

  return fieldErrors;
}

export function validateStatusTransition(current: IdeaStatus, next: string): string | null {
  if (!Object.values(IdeaStatus).includes(next as IdeaStatus)) {
    return "Invalid status value.";
  }

  const target = next as IdeaStatus;

  const allowedTransitions: Record<IdeaStatus, IdeaStatus[]> = {
    draft: ["submitted"],
    submitted: ["under_review", "accepted", "rejected"],
    under_review: ["accepted", "rejected"],
    accepted: ["accepted"],
    rejected: ["rejected"],
  };

  if (!allowedTransitions[current].includes(target)) {
    return "Invalid status transition for this idea.";
  }

  return null;
}

export function canMutateDraft(status: IdeaStatus): boolean {
  return status === "draft";
}
