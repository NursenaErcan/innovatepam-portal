import crypto from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { IdeaCategory, Prisma } from "@prisma/client";
import { normalizeAttachmentsForApi } from "@/lib/attachments";
import { requireRoleFromRequest } from "@/lib/auth";
import { resolveUploadDirectory } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { aggregateScores, canViewScoreSummaryForSubmitter } from "@/lib/scoring-aggregation";
import { validateCategoryCustomFields, validateIdeaInput } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const auth = await requireRoleFromRequest(request, "submitter");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const ideas = await prisma.idea.findMany({
    where: { submitterId: auth.user.id },
    include: {
      attachments: {
        orderBy: {
          displayOrder: "asc",
        },
      },
      evaluationComments: {
        orderBy: { createdAt: "desc" },
      },
      scores: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    {
      ideas: ideas.map((idea) => {
        const canShowScores = canViewScoreSummaryForSubmitter(idea.status, idea.reviewStage);

        return {
          id: idea.id,
          title: idea.title,
          description: idea.description,
          category: idea.category,
          status: idea.status,
          reviewStage: idea.reviewStage,
          customFields: idea.customFields,
          createdAt: idea.createdAt,
          attachments: normalizeAttachmentsForApi(idea.attachments),
          evaluationComments: idea.evaluationComments,
          scoreSummary: canShowScores ? aggregateScores(idea.scores) : null,
        };
      }),
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
  const submissionMode = String(formData.get("submissionMode") ?? "final").trim();
  const rawCustomFields = String(formData.get("customFields") ?? "{}").trim();

  const files = formData
    .getAll("attachment")
    .filter((value): value is File => value instanceof File && value.size > 0);

  const validationError = validateIdeaInput({
    title,
    description,
    category,
    attachmentCount: files.length,
    attachments: files.map((file) => ({
      mimeType: file.type,
      size: file.size,
    })),
  });

  if (validationError) {
    return NextResponse.json(validationError, { status: 400 });
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

  const persistedFiles: Array<{
    absolutePath: string;
    fileName: string;
    storagePath: string;
    mimeType: string;
    size: number;
    displayOrder: number;
  }> = [];

  try {
    for (const [displayOrder, file] of files.entries()) {
      const extension = path.extname(file.name) || "";
      const uniqueName = `${crypto.randomUUID()}${extension}`;
      const absolutePath = path.join(uploadDir, uniqueName);
      const storagePath = `/uploads/${uniqueName}`;

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await writeFile(absolutePath, fileBuffer);

      persistedFiles.push({
        absolutePath,
        fileName: file.name,
        storagePath,
        mimeType: file.type,
        size: file.size,
        displayOrder,
      });
    }

    const idea = await prisma.idea.create({
      data: {
        title,
        description,
        category: category as IdeaCategory,
        status: submissionMode === "draft" ? "draft" : "submitted",
        reviewStage: submissionMode === "draft" ? null : "initial_screening",
        customFields: customFields ? (customFields as Prisma.InputJsonValue) : undefined,
        submitterId: auth.user.id,
        attachments: {
          create: persistedFiles.map((file) => ({
            fileName: file.fileName,
            storagePath: file.storagePath,
            mimeType: file.mimeType,
            size: file.size,
            displayOrder: file.displayOrder,
          })),
        },
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
  } catch {
    await Promise.all(
      persistedFiles.map(async (file) => {
        try {
          await unlink(file.absolutePath);
        } catch {
          // Best-effort cleanup for partial writes.
        }
      }),
    );

    return NextResponse.json(
      {
        error: "Failed to save idea attachments.",
      },
      { status: 500 },
    );
  }
}

