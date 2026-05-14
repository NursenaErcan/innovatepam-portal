import { NextRequest, NextResponse } from "next/server";
import { requireRoleFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateStatusTransition } from "@/lib/validation";

type RouteContext = {
  params: Promise<{ ideaId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireRoleFromRequest(request, "admin");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { ideaId } = await context.params;
  const body = await request.json().catch(() => null);
  const status = String(body?.status ?? "").trim();

  const existingIdea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!existingIdea) {
    return NextResponse.json({ error: "Idea not found." }, { status: 404 });
  }

  const error = validateStatusTransition(existingIdea.status, status);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const isFinalDecisionStatus = status === "accepted" || status === "rejected";
  if (isFinalDecisionStatus) {
    if (existingIdea.status !== "submitted") {
      return NextResponse.json({ error: "Final decision can only be made from submitted status." }, { status: 409 });
    }

    if (existingIdea.reviewStage !== "final_decision") {
      return NextResponse.json({ error: "Final decision is allowed only at final_decision stage." }, { status: 409 });
    }
  }

  const updatedIdea = await prisma.idea.update({
    where: { id: ideaId },
    data: {
      status: status as typeof existingIdea.status,
    },
  });

  return NextResponse.json(
    {
      success: true,
      idea: {
        id: updatedIdea.id,
        status: updatedIdea.status,
      },
    },
    { status: 200 },
  );
}
