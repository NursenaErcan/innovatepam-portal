# Getting Started: Blind Review Implementation

**Feature**: Phase 6 Blind Review  
**Date**: 2026-05-14  
**Audience**: Developer implementing blind review functionality

---

## Feature Overview

Blind review hides submitter identity (name and email) from the admin review interface during active review stages (Initial Screening, Technical Review, Business Impact Review). Submitter identity becomes visible at Final Decision and after resolution.

**Scope**: Admin-facing components only. Submitter dashboard unaffected.

---

## Implementation Checklist

### Phase 1a: Component-Level Rendering (AdminIdeasPanel)

**File**: `app/components/admin-ideas-panel.tsx`

**Task**: Compute `showSubmitter` based on idea's current review stage and pass to IdeaCard.

**Changes**:

```typescript
// Define blind stages constant
const BLIND_STAGES: ReviewStage[] = [
  'initial_screening',
  'technical_review',
  'business_impact_review'
]

// In render loop for each idea:
const isBlindStage = BLIND_STAGES.includes(idea.reviewStage)
const showSubmitter = !isBlindStage

// Pass to IdeaCard:
<IdeaCard
  idea={idea}
  showSubmitter={showSubmitter}
  showCustomFields={true}
  // ... other props
/>
```

**Testing**: 
- [ ] Verify that ideas at Technical Review hide submitter identity in admin panel
- [ ] Verify that ideas at Final Decision show submitter identity
- [ ] Verify that advancing an idea from Technical Review → Business Impact Review keeps identity hidden
- [ ] Verify that advancing to Final Decision exposes identity

---

### Phase 1b: Component-Level Rendering (IdeaCard)

**File**: `app/components/idea-card.tsx`

**Task**: Conditionally render submitter field based on `showSubmitter` prop.

**Changes**:

```typescript
// Add/update prop type
type Props = {
  // ... existing props
  showSubmitter?: boolean  // NEW: Controls submitter identity rendering
}

// In component body, find the submitter rendering section:
{showSubmitter && submitter && (
  <div className="submitter-info">
    <p className="text-sm">
      <strong>Submitter:</strong> {submitter.name} ({submitter.email})
    </p>
  </div>
)}

// Or, if submitter info is in header, use conditional className:
<div className={submitter && !showSubmitter ? 'hidden' : ''}>
  {/* submitter info */}
</div>
```

**Testing**:
- [ ] Render with `showSubmitter=false` and verify submitter email/name not visible
- [ ] Render with `showSubmitter=true` and verify submitter email/name visible
- [ ] Test on mobile viewport to ensure conditional hiding doesn't break layout

---

### Phase 2: API Response Filtering (GET /api/admin/ideas)

**File**: `app/api/admin/ideas/route.ts`

**Task**: Filter submitter from JSON response when idea is at a blind stage.

**Changes**:

```typescript
const BLIND_STAGES = [
  'initial_screening',
  'technical_review',
  'business_impact_review'
]

export async function GET(request: Request) {
  // ... existing auth and validation

  const ideas = await prisma.idea.findMany({
    where: { status: 'submitted' }, // Admin queue
    include: {
      submitter: true,
      attachments: { orderBy: { displayOrder: 'asc' } },
      stageComments: { orderBy: { createdAt: 'asc' } }
    }
  })

  // Map and filter submitter based on reviewStage
  const responseIdeas = ideas.map(idea => {
    const isBlindStage = BLIND_STAGES.includes(idea.reviewStage)
    return {
      ...idea,
      submitter: isBlindStage ? null : idea.submitter
    }
  })

  return Response.json({ ideas: responseIdeas })
}
```

**Testing**:
- [ ] Fetch admin ideas list via API
- [ ] Verify submitter is null for ideas at Technical Review
- [ ] Verify submitter is populated for ideas at Final Decision
- [ ] Verify all other fields (title, attachments, stageComments) are present in both cases

---

### Phase 3: API Response Filtering (GET /api/ideas/{ideaId})

**File**: `app/api/ideas/[ideaId]/route.ts`

**Task**: Filter submitter from JSON response for admin requests at blind stages.

**Changes**:

```typescript
const BLIND_STAGES = [
  'initial_screening',
  'technical_review',
  'business_impact_review'
]

export async function GET(request: Request, { params }: { params: { ideaId: string } }) {
  // ... existing auth

  const idea = await prisma.idea.findUnique({
    where: { id: params.ideaId },
    include: { submitter: true, stageComments: true, attachments: true }
  })

  // Determine if requesting user is admin
  const isAdmin = user.isAdmin

  // Apply blind-stage filtering for admins
  if (isAdmin && BLIND_STAGES.includes(idea.reviewStage)) {
    idea.submitter = null
  }

  // Submitter can only access own ideas; submitter always sees their own identity
  if (!isAdmin && idea.submitterId !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  return Response.json(idea)
}
```

**Testing**:
- [ ] Admin fetches idea at Technical Review; verify submitter is null in response
- [ ] Admin fetches idea at Final Decision; verify submitter is populated
- [ ] Submitter fetches their own idea; verify submitter identity is always included (not filtered)

---

### Phase 4: Manual Testing on UI

**Scenario 1**: Admin reviews idea at Technical Review stage
```
1. Log in as admin
2. Navigate to admin review queue
3. Find idea at "Technical Review" stage
4. Open the idea card
5. Verify: No submitter name or email visible
6. Verify: Title, description, custom fields, attachments, stage comments all visible
7. Verify: Stage controls (Previous/Next) are functional
```

**Scenario 2**: Advance idea to Final Decision
```
1. Advance idea from Technical Review → Business Impact Review → Final Decision
2. Verify: After advancing to Final Decision, submitter identity appears in card
3. Verify: Card refresh reflects updated stage and identity visibility
```

**Scenario 3**: Submitter dashboard unaffected
```
1. Log in as submitter who submitted the idea under review
2. Navigate to submitter dashboard
3. Find your idea (same idea under review by admin at Technical Review stage)
4. Open your idea
5. Verify: Your submitter identity is fully visible (blind review does not affect submitter view)
6. Verify: Stage comments from admins are visible
```

---

## Files Modified

| File | Change | Scope |
|------|--------|-------|
| `app/components/admin-ideas-panel.tsx` | Compute showSubmitter from reviewStage | Rendering logic |
| `app/components/idea-card.tsx` | Conditional submitter section rendering | Rendering logic |
| `app/api/admin/ideas/route.ts` | Filter submitter from API response (blind stages) | API contract |
| `app/api/ideas/[ideaId]/route.ts` | Filter submitter for admin requests at blind stages | API contract |

**No new files created. No schema migrations required.**

---

## Key Constants

```typescript
// Define once in lib/review-stages.ts or duplicate where needed
const BLIND_STAGES: ReviewStage[] = [
  'initial_screening',
  'technical_review',
  'business_impact_review'
]

// Or use existing enum if available
import { REVIEW_STAGES } from '@/lib/review-stages'
const BLIND_STAGES = [
  REVIEW_STAGES.INITIAL_SCREENING,
  REVIEW_STAGES.TECHNICAL_REVIEW,
  REVIEW_STAGES.BUSINESS_IMPACT_REVIEW
]
```

---

## Testing Checklist

- [ ] Component: IdeaCard renders without submitter when `showSubmitter=false`
- [ ] Component: IdeaCard renders with submitter when `showSubmitter=true`
- [ ] Component: AdminIdeasPanel computes correct showSubmitter value for each stage
- [ ] API: GET /api/admin/ideas returns `submitter: null` for blind-stage ideas
- [ ] API: GET /api/admin/ideas returns full submitter for non-blind-stage ideas
- [ ] API: GET /api/ideas/{ideaId} filters submitter for admin at blind stages
- [ ] API: GET /api/ideas/{ideaId} does NOT filter submitter for submitter's own ideas
- [ ] UI: Advance from blind stage → blind stage keeps identity hidden
- [ ] UI: Advance from blind stage → Final Decision exposes identity
- [ ] UI: Retreat from Final Decision → blind stage hides identity again
- [ ] UI: Submitter dashboard shows full identity (unaffected by blind review)
- [ ] Build: `npm run build` passes (no TypeScript errors)
- [ ] Lint: `npm run lint` passes

---

## Rollback Plan

If blind review introduces a regression:

1. Revert changes to `admin-ideas-panel.tsx` and `idea-card.tsx` (remove showSubmitter logic)
2. Revert changes to API routes (remove submitter filtering)
3. All test data remains valid; no migration rollback needed

---

## Performance Notes

- **No new queries**: Submitter is already loaded with idea; no N+1 issues
- **Rendering**: Conditional logic is microsecond-scale; no measurable impact
- **Network**: Response size reduced slightly when submitter is null; negligible (~100 bytes per idea)

---

## Security Notes

- **Defense-in-depth**: Both API filtering + UI rendering logic hide identity
- **No new permissions needed**: Admin role unchanged
- **Audit trail**: reviewStage is visible in database; blind-stage membership is discoverable
- **Secrets**: No sensitive data stored in frontend; submitter masking is presentation-only
