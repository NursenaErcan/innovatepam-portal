import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidReviewStage } from '@/lib/review-stages';
import { requireRoleFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest, context: { params: Promise<{ ideaId: string }> }) {
  // Authenticate admin
  const auth = await requireRoleFromRequest(req, 'admin');
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { ideaId } = await context.params;
  const { text, stage } = await req.json();

  if (!text || typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
  }
  if (!isValidReviewStage(stage)) {
    return NextResponse.json({ error: 'Invalid stage value' }, { status: 400 });
  }

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }
  if (idea.status === 'draft') {
    return NextResponse.json({ error: 'Cannot add stage comment to draft idea' }, { status: 409 });
  }

  const adminId = auth.user.id;

  const comment = await prisma.stageComment.create({
    data: {
      ideaId,
      adminId,
      stage,
      text,
    },
  });

  return NextResponse.json({ success: true, comment });
}
