import path from "node:path";

export const DATABASE_URL = process.env.DATABASE_URL ?? "file:./dev.db";
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./public/uploads";
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export function resolveUploadDirectory(): string {
  return path.resolve(process.cwd(), UPLOAD_DIR);
}
