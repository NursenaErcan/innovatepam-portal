# Data Model: Blind Review

**Feature**: Phase 6 Blind Review  
**Date**: 2026-05-14  
**Context**: Blind review affects how existing Idea and User entities are rendered, but introduces no new schema entities.

---

## Entity: Idea

**Existing Schema** (from Phase 5):

```prisma
model Idea {
  id              String    @id @default(cuid())
  title           String
  description     String
  category        String
  status          IdeaStatus            @default(submitted)
  reviewStage     ReviewStage           @default(initial_screening)
  customFields    Json?
  submitterId     String
  submitter       User      @relation(fields: [submitterId], references: [id])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  attachments     Attachment[]
  evaluationComments EvaluationComment[]
  stageComments   StageComment[]
}

enum ReviewStage {
  initial_screening
  technical_review
  business_impact_review
  final_decision
}

enum IdeaStatus {
  draft
  submitted
  accepted
  rejected
}
```

### How Blind Review Affects Idea

**New Derived State** (computed at render time):

- **isBlindStage**: Computed from `reviewStage ∈ {initial_screening, technical_review, business_impact_review}`
- **showSubmitterIdentity**: Derived as `!isBlindStage`

**Rendering Rule**:

- When `showSubmitterIdentity = false` (blind stages): Omit or mask submitter name and email in admin UI
- When `showSubmitterIdentity = true` (Final Decision, Accepted, Rejected): Display submitter identity
- Submitter dashboard always shows full identity (showSubmitter not applicable to own ideas)

**No Schema Changes Required**:

- `reviewStage` enum already exists and covers all blind+non-blind cases
- No new columns needed
- No migration required

---

## Entity: User (Submitter)

**Existing Schema** (from Phase 1):

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String
  name      String?
  isAdmin   Boolean    @default(false)
  ideas     Idea[]
  createdAt DateTime   @default(now())
}
```

### How Blind Review Affects User

**Identity Fields Affected**:

- `User.email`: Conditionally rendered in admin panel based on `Idea.reviewStage`
- `User.name`: Conditionally rendered in admin panel based on `Idea.reviewStage`

**No Schema Changes Required**:

- Both fields already exist
- Access control is a rendering concern, not a data concern

---

## Rendering Contracts

### Admin Ideas Panel

**Component**: `AdminIdeasPanel`

**Input**:
```typescript
idea: {
  id: string
  title: string
  reviewStage: ReviewStage
  submitter?: User  // Conditionally included
}
```

**Logic**:
```typescript
const isBlindStage = ['initial_screening', 'technical_review', 'business_impact_review'].includes(idea.reviewStage)
const showSubmitter = !isBlindStage

<IdeaCard 
  idea={idea}
  showSubmitter={showSubmitter}
  showCustomFields={true}
/>
```

**Output**:
- If `showSubmitter=true`: IdeaCard renders submitter email and name
- If `showSubmitter=false`: IdeaCard omits submitter email and name (Tailwind `hidden` class)

### IdeaCard Component

**Component**: `IdeaCard`

**Props**:
```typescript
showSubmitter?: boolean  // Controls submitter identity rendering
// existing props unchanged
```

**Conditional Sections**:

```typescript
// Only render if showSubmitter is true or undefined
{showSubmitter && submitter && (
  <div className="submitter-info">
    <p>Submitter: {submitter.name} ({submitter.email})</p>
  </div>
)}
```

**Unchanged Sections**:
- Title, description, category, custom fields
- Attachments
- Stage comments (StageCommentList showAdmin prop unchanged)
- Status badge
- Review stage controls

---

## Data Flow

### Admin Viewing Idea (Blind Stage)

```
1. Admin opens AdminIdeasPanel
2. Component fetches ideas: GET /api/admin/ideas
3. For each idea at Initial Screening/Technical Review/Business Impact Review:
   - Calculate isBlindStage = true
   - Set showSubmitter = false
4. Render IdeaCard with showSubmitter=false
5. User.email and User.name fields are hidden (not rendered in DOM)
```

### Admin Viewing Idea (Final Decision)

```
1. Admin opens AdminIdeasPanel
2. Component fetches ideas: GET /api/admin/ideas
3. For idea at Final Decision:
   - Calculate isBlindStage = false
   - Set showSubmitter = true
4. Render IdeaCard with showSubmitter=true
5. User.email and User.name fields are rendered normally
```

### Submitter Viewing Their Own Ideas

```
1. Submitter logs in and opens SubmitterDashboard
2. Component fetches ideas: GET /api/ideas (submitter endpoint)
3. Render IdeaCard without showSubmitter logic (always show full data)
4. Submitter sees all their idea data normally
```

---

## Validation & Constraints

✅ **No new entities**: Blind review uses existing Idea and User schema  
✅ **No new columns**: reviewStage enum suffices; no blind_until or similar needed  
✅ **No new migrations**: No Prisma schema changes required  
✅ **Backward-compatible**: Phase 1–5 data model unchanged  
✅ **Auditable**: reviewStage is visible in database; blind-stage membership is derivable  

---

## Design Implications

### Performance

- No extra database queries
- Conditional rendering is CPU-bound, negligible impact
- No caching concerns (rendering happens per request)

### Accessibility

- Hiding submitter identity does not remove semantic meaning from DOM
- Keyboard navigation unaffected
- Screen reader compatibility preserved (conditional rendering, not aria-hidden)

### Security

- Blind review is client-side rendering; server should also filter API responses for defense-in-depth
- No sensitive data stored in localStorage or cookies
- Submitter identity is a fact of the idea (cannot be revoked); hiding is presentation-only
