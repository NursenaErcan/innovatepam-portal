import { unlink } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { IdeaCategory, Prisma } from "@prisma/client";
import { requireDraftOwnerFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canMutateDraft } from "@/lib/validation";

type DraftUpdatePayload = {
  title?: string;
  description?: string;
  category?: string;
  customFields?: Record<string, unknown>;
};

function parseDraftUpdateBody(raw: unknown): DraftUpdatePayload | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  const body = raw as Record<string, unknown>;
  const payload: DraftUpdatePayload = {};

  if (typeof body.title === "string") {
    payload.title = body.title.trim();
  }

  if (typeof body.description === "string") {
    payload.description = body.description.trim();
  }

  if (typeof body.category === "string") {
    payload.category = body.category.trim();
  }

  if (body.customFields && typeof body.customFields === "object" && !Array.isArray(body.customFields)) {
    payload.customFields = body.customFields as Record<string, unknown>;
  }

  return payload;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ ideaId: string }> },
) {
  const { ideaId } = await context.params;
  const ownerCheck = await requireDraftOwnerFromRequest(request, ideaId);

  if (!ownerCheck.ok) {
    if (ownerCheck.reason === "unauthorized" || ownerCheck.reason === "forbidden") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  if (!canMutateDraft(ownerCheck.idea.status)) {
    return NextResponse.json({ error: "Idea is no longer editable." }, { status: 409 });
  }

  const payload = parseDraftUpdateBody(await request.json().catch(() => null));
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const nextCategory = payload.category ?? ownerCheck.idea.category;
  const nextCustomFields = payload.customFields ?? (ownerCheck.idea.customFields as Record<string, unknown> | null);

  if (!Object.values(IdeaCategory).includes(nextCategory as IdeaCategory)) {
    return NextResponse.json({ error: "Invalid idea category." }, { status: 400 });
  }

  const updated = await prisma.idea.update({
    where: { id: ownerCheck.idea.id },
    data: {
      title: payload.title ?? ownerCheck.idea.title,
      description: payload.description ?? ownerCheck.idea.description,
      category: nextCategory as IdeaCategory,
      customFields: nextCustomFields ? (nextCustomFields as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });

  return NextResponse.json(
    {
      success: true,
      idea: {
        id: updated.id,
        status: updated.status,
      },
    },
    { status: 200 },
  );
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ ideaId: string }> },
) {
  const { ideaId } = await context.params;
  const ownerCheck = await requireDraftOwnerFromRequest(request, ideaId);

  if (!ownerCheck.ok) {
    if (ownerCheck.reason === "unauthorized" || ownerCheck.reason === "forbidden") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  if (!canMutateDraft(ownerCheck.idea.status)) {
    return NextResponse.json({ error: "Idea is no longer deletable." }, { status: 409 });
  }

  const attachments = await prisma.attachment.findMany({
    where: { ideaId: ownerCheck.idea.id },
  });

  await prisma.idea.delete({
    where: { id: ownerCheck.idea.id },
  });

  await Promise.all(
    attachments.map(async (attachment) => {
      try {
        await unlink(`.${attachment.storagePath}`);
      } catch {
        // Best-effort file cleanup.
      }
    }),
  );

  return NextResponse.json({ success: true }, { status: 200 });
}
