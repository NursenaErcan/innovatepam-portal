import { NextRequest, NextResponse } from "next/server";
import { IdeaStatus } from "@prisma/client";
import { requireDraftOwnerFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  canMutateDraft,
  validateCategoryCustomFields,
  validateIdeaInput,
  validateStatusTransition,
} from "@/lib/validation";

export async function POST(
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
    return NextResponse.json({ error: "Idea is no longer submittable." }, { status: 409 });
  }

  const attachments = await prisma.attachment.findMany({
    where: { ideaId: ownerCheck.idea.id },
    orderBy: { displayOrder: "asc" },
  });
  const validationError = validateIdeaInput({
    title: ownerCheck.idea.title,
    description: ownerCheck.idea.description,
    category: ownerCheck.idea.category,
    attachmentCount: attachments.length,
    attachments: attachments.map((attachment) => ({
      mimeType: attachment.mimeType,
      size: attachment.size,
    })),
  });

  if (validationError) {
    return NextResponse.json(validationError, { status: 400 });
  }

  const fieldErrors = validateCategoryCustomFields(
    ownerCheck.idea.category,
    ownerCheck.idea.customFields,
  );
  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      {
        error: "Dynamic fields are invalid.",
        fieldErrors,
      },
      { status: 400 },
    );
  }

  const transitionError = validateStatusTransition(ownerCheck.idea.status, "submitted");
  if (transitionError) {
    return NextResponse.json({ error: transitionError }, { status: 409 });
  }

  const idea = await prisma.idea.update({
    where: { id: ownerCheck.idea.id },
    data: {
      status: IdeaStatus.submitted,
      reviewStage: "initial_screening",
    },
  });

  return NextResponse.json(
    {
      success: true,
      idea: {
        id: idea.id,
        status: idea.status,
      },
    },
    { status: 200 },
  );
}
