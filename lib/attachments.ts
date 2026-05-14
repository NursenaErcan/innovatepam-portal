export const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpg",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export type AttachmentApiItem = {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  displayOrder: number;
  downloadUrl: string;
  previewUrl: string | null;
};

type AttachmentRecord = {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  displayOrder: number;
};

export function isPreviewEligibleMimeType(mimeType: string): boolean {
  return mimeType === "image/png" || mimeType === "image/jpg" || mimeType === "image/jpeg";
}

export function mapAttachmentForApi(attachment: AttachmentRecord): AttachmentApiItem {
  const previewUrl = `/api/attachments/${attachment.id}`;
  const downloadUrl = `${previewUrl}?download=1`;

  return {
    id: attachment.id,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    size: attachment.size,
    displayOrder: attachment.displayOrder,
    downloadUrl,
    previewUrl: isPreviewEligibleMimeType(attachment.mimeType) ? previewUrl : null,
  };
}

export function normalizeAttachmentsForApi(attachments: AttachmentRecord[]): AttachmentApiItem[] {
  return [...attachments]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map(mapAttachmentForApi);
}
