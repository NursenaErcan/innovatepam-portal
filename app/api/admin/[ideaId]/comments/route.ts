import { NextRequest, NextResponse } from "next/server";
import { requireRoleFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ ideaId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireRoleFromRequest(request, "admin");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { ideaId } = await context.params;
  const body = await request.json().catch(() => null);
  const commentText = String(body?.commentText ?? "").trim();

  if (!commentText) {
    return NextResponse.json({ error: "Comment text is required." }, { status: 400 });
  }

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    return NextResponse.json({ error: "Idea not found." }, { status: 404 });
  }

  const comment = await prisma.evaluationComment.create({
    data: {
      ideaId,
      adminId: auth.user.id,
      text: commentText,
    },
  });

  return NextResponse.json(
    {
      success: true,
      comment: {
        id: comment.id,
        commentText: comment.text,
        createdAt: comment.createdAt,
      },
    },
    { status: 201 },
  );
}
