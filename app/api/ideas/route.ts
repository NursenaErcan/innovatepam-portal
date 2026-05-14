import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { IdeaCategory, Prisma } from "@prisma/client";
import { requireRoleFromRequest } from "@/lib/auth";
import { resolveUploadDirectory } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { validateCategoryCustomFields, validateIdeaInput } from "@/lib/validation";

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

  return NextResponse.json(
    {
      ideas: ideas.map((idea) => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        status: idea.status,
        customFields: idea.customFields,
        createdAt: idea.createdAt,
        attachment: idea.attachment,
        evaluationComments: idea.evaluationComments,
      })),
    },
    { status: 200 },
  );
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
  const rawCustomFields = String(formData.get("customFields") ?? "{}").trim();

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

  let customFields: Record<string, unknown> | null = null;
  if (rawCustomFields.length > 0) {
    try {
      const parsed = JSON.parse(rawCustomFields) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        customFields = parsed as Record<string, unknown>;
      } else {
        customFields = null;
      }
    } catch {
      return NextResponse.json(
        {
          error: "Dynamic fields are invalid.",
          fieldErrors: {
            customFields: "Dynamic fields payload must be valid JSON.",
          },
        },
        { status: 400 },
      );
    }
  }

  const fieldErrors = validateCategoryCustomFields(category, customFields);
  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      {
        error: "Dynamic fields are invalid.",
        fieldErrors,
      },
      { status: 400 },
    );
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
      customFields: customFields ? (customFields as Prisma.InputJsonValue) : undefined,
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
