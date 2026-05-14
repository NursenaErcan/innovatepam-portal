import { IdeaCategory, IdeaStatus } from "@prisma/client";
import {
  IMPLEMENTATION_COMPLEXITY_OPTIONS,
  isIdeaCategory,
  type ImplementationComplexity,
} from "@/lib/category-fields";
import { MAX_UPLOAD_SIZE_BYTES } from "@/lib/db";

export const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpg",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

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
  attachmentMimeType: string;
  attachmentSize: number;
}): string | null {
  if (!input.title.trim() || !input.description.trim() || !input.category.trim()) {
    return "Title, description, and category are required.";
  }

  if (!Object.values(IdeaCategory).includes(input.category as IdeaCategory)) {
    return "Invalid idea category.";
  }

  if (input.attachmentCount !== 1) {
    return "Exactly one attachment is required.";
  }

  if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(input.attachmentMimeType)) {
    return "Only PDF, PNG, JPG, JPEG, and DOCX files are supported.";
  }

  if (input.attachmentSize > MAX_UPLOAD_SIZE_BYTES) {
    return "Attachment must be 10MB or smaller.";
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
