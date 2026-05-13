import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { IdeaCategory } from "@prisma/client";
import { requireRoleFromRequest } from "@/lib/auth";
import { resolveUploadDirectory } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { validateIdeaInput } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const auth = await requireRoleFromRequest(request, "submitter");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const ideas = await prisma.idea.findMany({
    where: { submitterId: auth.user.id },
    include: {
      attachment: true,
      evaluationComments: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ideas }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const auth = await requireRoleFromRequest(request, "submitter");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  const files = formData
    .getAll("attachment")
    .filter((value): value is File => value instanceof File && value.size > 0);

  const firstFile = files[0];
  const validationError = validateIdeaInput({
    title,
    description,
    category,
    attachmentCount: files.length,
    attachmentMimeType: firstFile?.type ?? "",
    attachmentSize: firstFile?.size ?? 0,
  });

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const uploadDir = resolveUploadDirectory();
  await mkdir(uploadDir, { recursive: true });

  const extension = path.extname(firstFile.name) || "";
  const uniqueName = `${crypto.randomUUID()}${extension}`;
  const absolutePath = path.join(uploadDir, uniqueName);
  const storagePath = `/uploads/${uniqueName}`;

  const fileBuffer = Buffer.from(await firstFile.arrayBuffer());
  await writeFile(absolutePath, fileBuffer);

  const idea = await prisma.idea.create({
    data: {
      title,
      description,
      category: category as IdeaCategory,
      submitterId: auth.user.id,
      attachment: {
        create: {
          fileName: firstFile.name,
          storagePath,
          mimeType: firstFile.type,
          size: firstFile.size,
        },
      },
    },
    include: {
      attachment: true,
    },
  });

  return NextResponse.json(
    {
      success: true,
      idea: {
        id: idea.id,
        title: idea.title,
        status: idea.status,
      },
    },
    { status: 201 },
  );
}
