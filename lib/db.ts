import path from "node:path";

export const DATABASE_URL = process.env.DATABASE_URL ?? "file:./dev.db";
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./public/uploads";
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_IDEA = Number(process.env.MAX_ATTACHMENTS_PER_IDEA ?? 10);
export const DRAFT_REOPEN_TARGET_SECONDS = Number(process.env.DRAFT_REOPEN_TARGET_SECONDS ?? 30);
export const DRAFT_REOPEN_SAMPLE_SIZE = Number(process.env.DRAFT_REOPEN_SAMPLE_SIZE ?? 5);

export function resolveUploadDirectory(): string {
  return path.resolve(process.cwd(), UPLOAD_DIR);
}
