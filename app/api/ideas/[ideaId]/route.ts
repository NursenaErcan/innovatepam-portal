import { NextRequest, NextResponse } from 'next/server';
import { STAGE_LABELS } from '@/lib/review-stages';
import { requireRoleFromRequest, requireDraftOwnerFromRequest } from '@/lib/auth';
import { IdeaCategory, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { canMutateDraft } from '@/lib/validation';
import { unlink } from 'node:fs/promises';

export async function GET(request: NextRequest, context: { params: Promise<{ ideaId: string }> }) {
  const { ideaId } = await context.params;
  const auth = await requireRoleFromRequest(request, "submitter");
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    include: {
      submitter: { select: { id: true, email: true } },
      attachments: true,
      evaluationComments: true,
      stageComments: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  let submitterStageComments: Array<{
    id: string;
    stage: (typeof idea.stageComments)[number]["stage"];
    stageLabel: string;
    text: string;
    createdAt: Date;
    ideaId: string;
  }> = [];
  let reviewStage = idea.reviewStage;
  let reviewStageLabel = reviewStage ? STAGE_LABELS[reviewStage] : null;

  if (auth.user.role === 'submitter' && auth.user.id === idea.submitterId) {
    submitterStageComments = idea.stageComments.map(({ id, stage, text, createdAt, ideaId }) => ({
      id,
      stage,
      stageLabel: STAGE_LABELS[stage],
      text,
      createdAt,
      ideaId,
    }));
  } else {
    submitterStageComments = idea.stageComments.map(({ id, stage, text, createdAt, ideaId }) => ({
      id,
      stage,
      stageLabel: STAGE_LABELS[stage],
      text,
      createdAt,
      ideaId,
    }));
  }

  // For drafts, hide reviewStage and stageComments
  if (idea.status === 'draft') {
    reviewStage = null;
    reviewStageLabel = null;
    submitterStageComments = [];
  }

  return NextResponse.json({
    id: idea.id,
    title: idea.title,
    description: idea.description,
    category: idea.category,
    status: idea.status,
    reviewStage,
    reviewStageLabel,
    stageComments: submitterStageComments,
    customFields: idea.customFields,
    createdAt: idea.createdAt,
    submitter: idea.submitter,
    attachments: idea.attachments,
    evaluationComments: idea.evaluationComments,
    stage: idea.reviewStage,
  });
}

type DraftUpdatePayload = {
  title?: string;
  description?: string;
  category?: string;
  customFields?: Record<string, unknown>;
};

function parseDraftUpdateBody(raw: unknown): DraftUpdatePayload | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const body = raw as Record<string, unknown>;
  const payload: DraftUpdatePayload = {};

  if (typeof body.title === 'string') {
    payload.title = body.title.trim();
  }

  if (typeof body.description === 'string') {
    payload.description = body.description.trim();
  }

  if (typeof body.category === 'string') {
    payload.category = body.category.trim();
  }

  if (body.customFields && typeof body.customFields === 'object' && !Array.isArray(body.customFields)) {
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
    if (ownerCheck.reason === 'unauthorized' || ownerCheck.reason === 'forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  if (!canMutateDraft(ownerCheck.idea.status)) {
    return NextResponse.json({ error: 'Idea is no longer editable.' }, { status: 409 });
  }

  const payload = parseDraftUpdateBody(await request.json().catch(() => null));
  if (!payload) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const nextCategory = payload.category ?? ownerCheck.idea.category;
  const nextCustomFields = payload.customFields ?? (ownerCheck.idea.customFields as Record<string, unknown> | null);

  if (!Object.values(IdeaCategory).includes(nextCategory as IdeaCategory)) {
    return NextResponse.json({ error: 'Invalid idea category.' }, { status: 400 });
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
    if (ownerCheck.reason === 'unauthorized' || ownerCheck.reason === 'forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  if (!canMutateDraft(ownerCheck.idea.status)) {
    return NextResponse.json({ error: 'Idea is no longer deletable.' }, { status: 409 });
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
