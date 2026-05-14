# Implementation Plan: Phase 7 Scoring System

**Branch**: `007-scoring-system` | **Date**: May 14, 2026 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-scoring-system/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Phase 7 adds a multi-dimensional scoring system to InnovatEPAM Portal's review pipeline. Admins score submitted ideas across three dimensions (Innovation, Feasibility, Business Impact) using 1-5 ratings at any review stage before Final Decision. Scores are persisted in a new relational IdeaScore model linked to Idea records. Submitters see aggregated score summaries only after ideas are accepted/rejected, providing transparent quantitative feedback on their submissions. Drafts cannot be scored. Scores persist permanently for audit purposes.

**Technical Approach**: 
- Extend Prisma schema with IdeaScore model (ideaId, dimension, value, reviewedBy)
- Add score input UI component in admin review panel (reused across stages)
- Implement score fetch/update API endpoints in /api/admin/[ideaId]/score*
- Add score summary computation and display component for submitter dashboard
- Validate scores 1-5, enforce draft prevention, aggregate for submitter view

## Technical Context

**Language/Version**: TypeScript with Next.js 16.2.6, strict compiler mode

**Primary Dependencies**: Next.js, React, Prisma, TypeScript, Tailwind CSS, shadcn/ui

**Storage**: SQLite via Prisma ORM with relational IdeaScore model

**Testing**: TypeScript strict checking, ESLint validation, manual validation in dev build

**Target Platform**: Next.js App Router web application (browser-based)

**Project Type**: Full-stack web application with server-side rendering and API routes

**Performance Goals**: <2s admin panel load, <100ms score save/fetch API response, <500ms submitter score summary render

**Constraints**: Browser compatibility (modern browsers), WCAG accessibility for score input fields, SQLite single-process lock awareness

**Scale/Scope**: Extends existing multi-stage review pipeline (4 stages); adds scoring to all submitted ideas (~50-100 ideas expected per quarter)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Assessment vs. Core Principles

**I. Clean Code** ✅ PASS
- Scoring logic will be extracted into reusable hooks/utilities (e.g., `useScoreUpdate`, `aggregateScores`)
- Score input component will have single responsibility: accept 1-5 rating input with validation
- No `any` typing; strict TypeScript throughout
- Comments will explain aggregation logic for submitter-visible scores

**II. Simple Responsive UI** ✅ PASS
- Score inputs appear inline in existing admin review panel (no new separate UI)
- Mobile-first: score input fields adapt to viewport size
- Visual feedback: clear error messages for invalid scores, success state on save
- Accessibility: labeled form inputs with ARIA attributes for screen readers

**III. Minimal Dependencies** ✅ PASS
- Zero new npm dependencies required
- Uses existing Prisma, React, TypeScript, Tailwind CSS
- Validation logic is simple (1-5 integer check) and uses built-in HTML5/JavaScript

**IV. Reusable React Components** ✅ PASS
- `ScoreInput` component (dimensions: Innovation, Feasibility, Business Impact) reused across all review stages
- Presentational component: receives props (dimension, value, onSave) and renders input + save button
- Business logic (aggregation, visibility) separated from presentation (score display card)
- Consistent prop interface across admin and submitter surfaces

**V. Persistence and Accessibility** ✅ PASS
- SQLite persistence via Prisma with new IdeaScore model and Idea relation
- Score input fields semantically correct: `<label>` + `<input type="number">` with validation
- Keyboard navigation: Tab through score inputs, Enter/Space to submit
- Form announces validation errors to screen readers via aria-live

**GATE RESULT**: ✅ **PASS** - All five principles satisfied. Proceed to Phase 0 Research.

## Project Structure

### Documentation (this feature)

```text
specs/007-scoring-system/
├── spec.md              # Feature specification
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data modeling
├── quickstart.md        # Phase 1 developer quick-start
├── contracts/           # Phase 1 interface contracts (if applicable)
└── checklists/
    └── requirements.md  # QA validation checklist
```

### Source Code (repository root)

```text
# Next.js web application structure
app/
├── api/
│   └── admin/
│       ├── [ideaId]/
│       │   └── score/
│       │       ├── route.ts          # GET/POST/PUT score endpoints
│       │       └── [dimension]/      # Dimension-specific scoring (optional)
│       └── ideas/
│           └── route.ts              # (existing, update to include scores)
├── admin/
│   └── ideas/
│       └── page.tsx                  # (existing, updated for score display)
├── submitter/
│   └── ideas/
│       └── page.tsx                  # (existing, updated for score summary)
└── components/
    ├── score-input.tsx               # NEW: Admin score entry component
    ├── score-summary.tsx             # NEW: Submitter score display card
    └── admin-ideas-panel.tsx          # (existing, integrate score component)

lib/
├── review-stages.ts                  # (existing)
├── scoring.ts                        # NEW: Score aggregation & validation utilities

prisma/
├── schema.prisma                     # (extended with IdeaScore model)
└── migrations/
    └── [timestamp]_add_scoring/      # NEW migration: IdeaScore table

tests/
├── lib/
│   └── scoring.test.ts               # Unit tests for aggregation logic
└── api/
    └── admin/[ideaId]/score.test.ts  # API endpoint tests
```

**Structure Decision**: Single project (Next.js App Router) with new scoring models, components, and API routes integrated into existing admin and submitter flows. No new directories created; scoring logic extends existing schema and UI panels.

---

## Phase 0: Research

*Resolve all unknowns from Technical Context before Phase 1*

### Research Questions

1. **Score Aggregation Strategy for Multiple Reviewers**
   - **Unknown**: How to aggregate scores when multiple admins score the same idea?
   - **Research**: Simple average (mean) of all scores per dimension. If Admin A rates Innovation=4 and Admin B rates Innovation=5, submitter sees (4+5)/2 = 4.5, rounded to nearest 0.5
   - **Decision**: Use simple average; rounding to 0.5 increments for clarity
   - **Rationale**: MVP simplicity; weighted scoring deferred to future phase

2. **Score Mutation Semantics: Per-Admin or Global?**
   - **Unknown**: Does each admin have separate scores, or do newer scores overwrite older ones?
   - **Research**: Track per-admin scores (ideaId + dimension + reviewedBy = unique). When submitter views, aggregate across all reviewers
   - **Decision**: Per-admin tracking; many-to-one relationship (IdeaScore → Idea, with reviewedBy foreign key)
   - **Rationale**: Audit trail and fair attribution; supports future features like "reviewer consensus"

3. **Score Visibility During Non-Final Stages**
   - **Unknown**: Can admin A see scores from admin B before Final Decision?
   - **Research**: Yes. Admin panel displays all scores for an idea, sorted by reviewer, so reviewers see peers' input
   - **Decision**: Full visibility to all admins throughout pipeline
   - **Rationale**: Enables collaborative review and discussion; scores only hidden from submitters

4. **Rejected Resubmission Scoring**
   - **Unknown**: If idea is rejected then resubmitted later, how are old scores handled?
   - **Research**: Old scores from first submission remain in database (linked to first submission record). Resubmitted idea starts with no scores (new record)
   - **Decision**: Maintain score history per submission; treat resubmission as new idea for scoring
   - **Rationale**: Audit trail; prevents stale scores from contaminating new evaluation

5. **Score Input Validation**
   - **Unknown**: Are scores required, or can admin leave them blank?
   - **Research**: Scores are optional. Admin can complete review without scoring. No forced validation on save
   - **Decision**: Input fields allow null/empty; validation only checks 1-5 if value is provided
   - **Rationale**: Flexibility for reviewers who prefer comment-only feedback; simplifies form interaction

6. **Next.js + Prisma Best Practices for Relational Scoring**
   - **Unknown**: How to structure IdeaScore model for optimal query patterns?
   - **Research**: IdeaScore model with fields: id, ideaId (FK), dimension (enum: Innovation/Feasibility/BusinessImpact), value (Int, 1-5), reviewedBy (FK to User), createdAt, updatedAt. Index on (ideaId, dimension, reviewedBy) for fast lookups
   - **Decision**: Single IdeaScore table with composite key for uniqueness
   - **Rationale**: Supports concurrent scoring by multiple reviewers; efficient aggregation queries

### Phase 0 Conclusion

All research items are resolved. No blocking unknowns remain. Proceed to Phase 1 Design.

---

## Phase 1: Design

### 1.1 Data Model

[Output: `data-model.md`]

**Entities and Relationships**:

- **IdeaScore** (NEW)
  - Fields: id (Int), ideaId (Int, FK), dimension (Enum: INNOVATION | FEASIBILITY | BUSINESS_IMPACT), value (Int, 1-5), reviewedBy (String, FK to User.id), createdAt (DateTime), updatedAt (DateTime)
  - Constraints: (ideaId, dimension, reviewedBy) must be unique to prevent duplicate scores per reviewer per dimension
  - Indexes: (ideaId), (ideaId, dimension), (reviewedBy) for efficient queries
  - Relations: Idea.scores (one-to-many), User.scoresByReviewer (one-to-many)

- **Idea** (EXTENDED)
  - New relation: scores (IdeaScore[])
  - New computed field (optional): aggregateScore (object with Innovation/Feasibility/BusinessImpact average)
  - Unchanged: existing fields (id, title, description, status, reviewStage, etc.)

**Validation Rules**:
- IdeaScore.value must be integer in range [1, 5]
- IdeaScore cannot be created for ideas with status = "draft"
- IdeaScore.reviewedBy must be a valid admin user

### 1.2 Interface Contracts

[Output: `contracts/`]

**API Endpoint Contracts**:

```
POST /api/admin/[ideaId]/score
  Request: { dimension: "INNOVATION" | "FEASIBILITY" | "BUSINESS_IMPACT", value: 1-5 }
  Response: { success: true, score: IdeaScore }
  Errors: 400 (invalid dimension/value), 404 (idea not found), 403 (not admin), 409 (draft idea)

GET /api/admin/[ideaId]/scores
  Response: { scores: IdeaScore[] }
  Errors: 404, 403

GET /api/ideas/[ideaId]/score-summary
  Request: (no body)
  Response: { innovation: 4.5, feasibility: 4.0, businessImpact: 4.2 } | { error: "scores not visible" }
  Errors: 404, 403 (if idea not decided)

PUT /api/admin/[ideaId]/score/[dimension]
  Request: { value: 1-5 }
  Response: { success: true, score: IdeaScore }
  Errors: (same as POST)
```

**Component Props**:

```typescript
// ScoreInput component
interface ScoreInputProps {
  ideaId: string;
  dimension: "INNOVATION" | "FEASIBILITY" | "BUSINESS_IMPACT";
  currentValue?: number;
  onSave: (value: number) => Promise<void>;
  disabled?: boolean;
}

// ScoreSummary component
interface ScoreSummaryProps {
  innovation: number;
  feasibility: number;
  businessImpact: number;
  showDetails?: boolean; // show per-reviewer breakdown
}
```

### 1.3 Quick Start

[Output: `quickstart.md`]

**For Developers**:

1. **Schema Update**: Add IdeaScore model to `prisma/schema.prisma`
2. **Migration**: Run `npx prisma migrate dev --name add_scoring`
3. **API Routes**: Create `app/api/admin/[ideaId]/score/route.ts` with GET/POST/PUT handlers
4. **Components**: Create `app/components/score-input.tsx` and `app/components/score-summary.tsx`
5. **Utility Functions**: Create `lib/scoring.ts` with `aggregateScores()` and `validateScore()` helpers
6. **Integration**: Update `app/components/admin-ideas-panel.tsx` to include ScoreInput component
7. **Submitter Display**: Update `app/submitter/ideas/page.tsx` and IdeaCard to show score summary for decided ideas
8. **Testing**: Unit test aggregation logic; API test for score create/update/retrieve

**For QA**:
- Verify admin can input 1-5 scores at each review stage
- Verify scores persist after stage transition
- Verify score validation (reject <1 or >5)
- Verify submitter sees score summary only after Final Decision
- Verify draft ideas cannot receive scores
- Verify Phase 1-6 functionality unaffected

### 1.4 Agent Context Update

Update `.github/copilot-instructions.md` to point to this plan:

```markdown
<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
`specs/007-scoring-system/plan.md`
<!-- SPECKIT END -->
```

---

## Conclusion

**Planning Complete**: Phase 0 research and Phase 1 design are finished. All technical decisions documented. Ready for task generation (`/speckit.tasks`) to create dependency-ordered implementation work.

**Next Step**: Run `/speckit.tasks` to generate `specs/007-scoring-system/tasks.md` with action items for implementation.
