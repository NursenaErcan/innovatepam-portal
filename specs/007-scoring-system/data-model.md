# Data Model: Phase 7 Scoring System

**Date**: May 14, 2026  
**Feature**: Phase 7 Scoring System  
**Based on**: [spec.md](./spec.md) + [research.md](./research.md)

## Entity Definitions

### IdeaScore (NEW)

**Purpose**: Relational record linking Idea to quantitative scores across evaluation dimensions.

**Fields**:

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | Int | Primary Key, Auto-increment | Unique identifier |
| ideaId | Int | Foreign Key (Idea.id), Not Null, Indexed | Which idea is scored |
| dimension | Enum | INNOVATION \| FEASIBILITY \| BUSINESS_IMPACT | Scoring category |
| value | Int | 1-5, Not Null | Rating score |
| reviewedBy | String | Foreign Key (User.id), Not Null | Admin who scored |
| createdAt | DateTime | Not Null, Default (now) | Score creation timestamp |
| updatedAt | DateTime | Not Null, Updated on change | Score modification timestamp |

**Unique Constraint**: (ideaId, dimension, reviewedBy)  
*Rationale*: Prevents duplicate scores from same reviewer for same dimension on same idea

**Indexes**:
- Primary: (id)
- Foreign Keys: (ideaId), (reviewedBy)
- Composite Query: (ideaId, dimension) - for fetching all scores for an idea by dimension
- Lookup: (ideaId, dimension, reviewedBy) - enforces unique constraint, enables quick check "has this reviewer scored this dimension?"

**Relations**:
- Many-to-One with Idea: `idea: Idea @relation(...)`
- Many-to-One with User: `reviewer: User @relation("scoresByReviewer", ...)`

**Validation Rules**:
- value must be integer between 1 and 5 (inclusive)
- reviewedBy must be a user with admin role
- ideaId must reference a non-draft Idea (enforced at API layer)
- Cannot score idea with status = "draft"

---

### Idea (EXTENDED)

**Existing Fields**: Unchanged from Phase 5

**New Relations**:

| Relation | Type | Notes |
|----------|------|-------|
| scores | IdeaScore[] | One-to-many: all scores for this idea |

**New Computed Fields** (optional, for UI convenience):

```typescript
// Returns aggregated scores visible to submitters after decision
aggregateScores(): {
  innovation: number,      // Average of all INNOVATION scores, null if none
  feasibility: number,     // Average of all FEASIBILITY scores, null if none
  businessImpact: number   // Average of all BUSINESS_IMPACT scores, null if none
} | null
```

**Access Rules**:
- Admins can view all scores for any submitted idea
- Submitters can view aggregateScores() only if idea.status === "accepted" OR idea.status === "rejected"
- Drafts have no scores (status="draft" → scores[] is always empty)

---

### User (EXTENDED)

**New Relations**:

| Relation | Type | Notes |
|----------|------|-------|
| scoresByReviewer | IdeaScore[] | All scores entered by this user |

---

## Prisma Schema Representation

```prisma
model IdeaScore {
  id        Int     @id @default(autoincrement())
  ideaId    Int
  idea      Idea    @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  
  dimension ScoringDimension  // enum: INNOVATION, FEASIBILITY, BUSINESS_IMPACT
  value     Int               // 1-5 rating
  
  reviewedBy String
  reviewer   User   @relation("scoresByReviewer", fields: [reviewedBy], references: [id], onDelete: Restrict)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Unique: one score per reviewer per dimension per idea
  @@unique([ideaId, dimension, reviewedBy])
  
  // Indexes for efficient queries
  @@index([ideaId])
  @@index([ideaId, dimension])
  @@index([reviewedBy])
}

enum ScoringDimension {
  INNOVATION
  FEASIBILITY
  BUSINESS_IMPACT
}

// In Idea model, add:
model Idea {
  // ... existing fields ...
  scores IdeaScore[]
}

// In User model, add:
model User {
  // ... existing fields ...
  scoresByReviewer IdeaScore[] @relation("scoresByReviewer")
}
```

---

## Data Lifecycle

### Score Creation

1. Admin opens Idea in review panel (Technical Review or later stage)
2. Enters score for dimension (Innovation, Feasibility, or Business Impact)
3. Clicks Save or proceeds to next stage
4. System validates: reviewedBy matches authenticated admin, value 1-5, ideaId not draft
5. IdeaScore record created: { ideaId, dimension, value, reviewedBy, createdAt }

### Score Update

1. Admin returns to same Idea for review
2. Pre-populated score fields show existing values
3. Admin modifies value (e.g., 4 → 3)
4. Clicks Save
5. IdeaScore record updated: { value: 3, updatedAt: now() }
6. No new record created (unique constraint prevents duplicate)

### Score Visibility: Admin View

1. Admin opens Ideas list or individual Idea review panel
2. Admin panel displays all scores for Idea from all reviewers
3. Format: "Innovation: [4, 5, 4] (Avg 4.3) | Feasibility: [3, 4] (Avg 3.5) | ..."
4. Visible at all stages from Initial Screening to Final Decision

### Score Visibility: Submitter View

1. Submitter opens Idea in dashboard
2. If idea.status === "draft" or "submitted" or in any review stage: NO score summary visible
3. If idea.status === "accepted" or "rejected": Score summary visible showing:
   - Innovation: X.X (average of all INNOVATION scores)
   - Feasibility: X.X (average of all FEASIBILITY scores)
   - Business Impact: X.X (average of all BUSINESS_IMPACT scores)
4. Per-reviewer breakdown hidden (aggregate only)

### Score Lifecycle: Rejected Resubmission

1. Initial submission: Idea created with scores
2. Admin rejects Idea: Idea.status = "rejected"
3. Submitter resubmits: New Idea record created (Phase 1 behavior)
4. Old scores remain in database, linked to old Idea record
5. New Idea starts with empty scores[]
6. Submitter sees old scores for old Idea (if accepted/rejected), not for new submission

---

## Query Patterns

### Admin: Get All Scores for Idea

```prisma
const scores = await prisma.ideaScore.findMany({
  where: { ideaId: idea_id },
  include: { reviewer: true }
})
```

### Admin: Check if Already Scored by This Reviewer

```prisma
const existing = await prisma.ideaScore.findUnique({
  where: {
    ideaId_dimension_reviewedBy: {
      ideaId: idea_id,
      dimension: "INNOVATION",
      reviewedBy: user_id
    }
  }
})
```

### Submitter: Get Aggregated Scores (Post-Decision)

```prisma
const scores = await prisma.ideaScore.findMany({
  where: { ideaId: idea_id },
  select: { dimension: true, value: true }
})

// Compute in application layer:
const avgByDimension = {}
for (const dimension of ["INNOVATION", "FEASIBILITY", "BUSINESS_IMPACT"]) {
  const values = scores
    .filter(s => s.dimension === dimension)
    .map(s => s.value)
  avgByDimension[dimension] = values.length ? values.reduce((a,b) => a+b) / values.length : null
}
```

---

## Constraints and Validation

### Schema-Level Constraints

- ✅ Unique constraint on (ideaId, dimension, reviewedBy): Prevents duplicates
- ✅ Not null on value, dimension, reviewedBy: Enforces completeness
- ✅ Value range 1-5: Enforced at application layer (SQLite has no check constraint in older versions)

### Application-Level Validation

- ✅ value must be integer 1-5 (checked in API route before save)
- ✅ reviewedBy must be authenticated admin (checked in middleware)
- ✅ Cannot score draft ideas (checked in API route)
- ✅ Cannot score idea with status "draft" (checked in API route)

---

## Migration Path

**Migration Name**: `add_scoring`

**Steps**:
1. Create IdeaScore table with all fields, unique constraint, indexes
2. Create ScoringDimension enum
3. Add scores relation to Idea model
4. Add scoresByReviewer relation to User model
5. Generate Prisma client
6. (No data migration needed; existing ideas have no scores)

---

## Backward Compatibility

✅ Fully backward compatible with Phase 1-6:
- Existing Idea records unaffected (scores relation is optional/null)
- Existing User records unaffected (scoresByReviewer relation is optional/null)
- No breaking changes to API contracts
- Drafts remain unscored (existing behavior preserved)
- Phase 1-6 functionality continues without modification
