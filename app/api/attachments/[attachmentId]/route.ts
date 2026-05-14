import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { isPreviewEligibleMimeType } from "@/lib/attachments";
import { canAccessIdeaAttachment, requireAuthFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: Promise<{
    attachmentId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuthFromRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { attachmentId } = await params;

  const attachment = await prisma.attachment.findUnique({
    where: {
      id: attachmentId,
    },
    include: {
      idea: {
        select: {
          submitterId: true,
        },
      },
    },
  });

  if (!attachment) {
    return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
  }

  if (!canAccessIdeaAttachment(auth.user, attachment.idea.submitterId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const relativeStoragePath = attachment.storagePath.replace(/^\/+/, "");
  const absolutePath = path.resolve(process.cwd(), "public", relativeStoragePath);

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(absolutePath);
  } catch {
    return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
  }

  const isPreviewImage = isPreviewEligibleMimeType(attachment.mimeType);
  const forceDownload = request.nextUrl.searchParams.get("download") === "1";
  const dispositionType = forceDownload || !isPreviewImage ? "attachment" : "inline";
  const safeAsciiFileName = attachment.fileName.replace(/"/g, "");
  const encodedName = encodeURIComponent(attachment.fileName);

  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Length": String(fileBuffer.byteLength),
      "Content-Disposition": `${dispositionType}; filename="${safeAsciiFileName}"; filename*=UTF-8''${encodedName}`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
