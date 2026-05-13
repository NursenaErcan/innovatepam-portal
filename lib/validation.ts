import { IdeaCategory, IdeaStatus } from "@prisma/client";
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
