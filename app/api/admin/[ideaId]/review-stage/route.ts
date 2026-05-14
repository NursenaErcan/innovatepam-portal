import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getNextStage, getPreviousStage } from '@/lib/review-stages';
import { requireRoleFromRequest } from '@/lib/auth';

export async function PATCH(req: NextRequest, context: { params: Promise<{ ideaId: string }> }) {
  // Authenticate admin
  const auth = await requireRoleFromRequest(req, 'admin');
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { ideaId } = await context.params;
  const { direction } = await req.json();

  if (direction !== 'forward' && direction !== 'backward') {
    return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
  }

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  if (idea.status === 'accepted' || idea.status === 'rejected' || idea.status === 'draft') {
    return NextResponse.json({ error: 'Stage transitions are not permitted on accepted or rejected or draft ideas' }, { status: 409 });
  }

  if (!idea.reviewStage) {
    return NextResponse.json({ error: 'Idea is not in the review pipeline' }, { status: 409 });
  }

  let newStage = null;
  if (direction === 'forward') {
    newStage = getNextStage(idea.reviewStage);
    if (!newStage) {
      return NextResponse.json({ error: 'Cannot advance beyond final_decision' }, { status: 400 });
    }
  } else {
    newStage = getPreviousStage(idea.reviewStage);
    if (!newStage) {
      return NextResponse.json({ error: 'Cannot retreat before initial_screening' }, { status: 400 });
    }
  }

  const updated = await prisma.idea.update({
    where: { id: ideaId },
    data: { reviewStage: newStage },
  });

  return NextResponse.json({ success: true, idea: { id: updated.id, reviewStage: updated.reviewStage, status: updated.status } });
}
