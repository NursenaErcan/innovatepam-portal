# Quick Start Guide: Phase 7 Scoring System

**Date**: May 14, 2026  
**Audience**: Developers implementing Phase 7  
**Based on**: [plan.md](./plan.md), [data-model.md](./data-model.md), [research.md](./research.md)

## Overview

This guide walks you through implementing the Phase 7 Scoring System step-by-step. The feature adds multi-dimensional scoring (Innovation, Feasibility, Business Impact) to the admin review pipeline, with submitters seeing aggregated scores only after ideas are accepted/rejected.

---

## Development Setup

### Prerequisites

- Node.js 18+ with npm/yarn
- Existing InnovatEPAM Portal codebase (Phases 1-6 complete)
- Git on feature branch `007-scoring-system`

### Installation

No new npm dependencies required. Uses existing: Next.js, React, Prisma, TypeScript, Tailwind CSS.

```bash
npm install  # (already done; no new packages)
```

---

## Implementation Steps

### Step 1: Extend Prisma Schema

**File**: `prisma/schema.prisma`

Add the new `IdeaScore` model and enum:

```prisma
enum ScoringDimension {
  INNOVATION
  FEASIBILITY
  BUSINESS_IMPACT
}

model IdeaScore {
  id        Int     @id @default(autoincrement())
  ideaId    Int
  idea      Idea    @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  
  dimension ScoringDimension
  value     Int               // 1-5
  
  reviewedBy String
  reviewer   User   @relation("scoresByReviewer", fields: [reviewedBy], references: [id], onDelete: Restrict)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([ideaId, dimension, reviewedBy])
  @@index([ideaId])
  @@index([ideaId, dimension])
  @@index([reviewedBy])
}
```

Update the `Idea` model to add scores relation:

```prisma
model Idea {
  // ... existing fields ...
  scores IdeaScore[]
}
```

Update the `User` model to add scoresByReviewer relation:

```prisma
model User {
  // ... existing fields ...
  scoresByReviewer IdeaScore[] @relation("scoresByReviewer")
}
```

### Step 2: Create Prisma Migration

```bash
npx prisma migrate dev --name add_scoring
```

This creates:
- Migration SQL file in `prisma/migrations/[timestamp]_add_scoring/migration.sql`
- Updates Prisma client automatically

**Verify**:
```bash
npx prisma db push  # Applies migration to local SQLite
```

### Step 3: Create Scoring Utilities

**File**: `lib/scoring.ts`

Create helper functions for score validation and aggregation:

```typescript
import { ScoringDimension } from "@prisma/client";

export const SCORING_DIMENSIONS = ["INNOVATION", "FEASIBILITY", "BUSINESS_IMPACT"] as const;

export function validateScore(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}

export interface AggregateScore {
  innovation: number | null;
  feasibility: number | null;
  businessImpact: number | null;
}

export function aggregateScores(scores: Array<{ dimension: ScoringDimension; value: number }>): AggregateScore {
  const byDimension: Record<ScoringDimension, number[]> = {
    INNOVATION: [],
    FEASIBILITY: [],
    BUSINESS_IMPACT: [],
  };

  for (const score of scores) {
    byDimension[score.dimension].push(score.value);
  }

  return {
    innovation: byDimension.INNOVATION.length > 0 
      ? byDimension.INNOVATION.reduce((a, b) => a + b, 0) / byDimension.INNOVATION.length 
      : null,
    feasibility: byDimension.FEASIBILITY.length > 0
      ? byDimension.FEASIBILITY.reduce((a, b) => a + b, 0) / byDimension.FEASIBILITY.length
      : null,
    businessImpact: byDimension.BUSINESS_IMPACT.length > 0
      ? byDimension.BUSINESS_IMPACT.reduce((a, b) => a + b, 0) / byDimension.BUSINESS_IMPACT.length
      : null,
  };
}
```

### Step 4: Create API Routes for Scoring

**File**: `app/api/admin/[ideaId]/score/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoleFromRequest } from "@/lib/auth";
import { validateScore } from "@/lib/scoring";
import { ScoringDimension } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { ideaId: string } }
) {
  const user = await requireRoleFromRequest("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const ideaId = parseInt(params.ideaId);
  const scores = await prisma.ideaScore.findMany({
    where: { ideaId },
    include: { reviewer: { select: { id: true, email: true } } },
  });

  return NextResponse.json({ scores });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { ideaId: string } }
) {
  const user = await requireRoleFromRequest("admin");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const ideaId = parseInt(params.ideaId);
  const { dimension, value } = await request.json();

  // Validate
  if (!Object.values(ScoringDimension).includes(dimension)) {
    return NextResponse.json({ error: "Invalid dimension" }, { status: 400 });
  }
  if (!validateScore(value)) {
    return NextResponse.json({ error: "Score must be integer 1-5" }, { status: 400 });
  }

  // Check idea exists and is not draft
  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  if (idea.status === "draft") {
    return NextResponse.json({ error: "Cannot score draft ideas" }, { status: 409 });
  }

  // Upsert score (update if exists, create if not)
  const score = await prisma.ideaScore.upsert({
    where: {
      ideaId_dimension_reviewedBy: {
        ideaId,
        dimension,
        reviewedBy: user.id,
      },
    },
    update: { value },
    create: { ideaId, dimension, value, reviewedBy: user.id },
  });

  return NextResponse.json({ success: true, score });
}
```

### Step 5: Create Score Input Component

**File**: `app/components/score-input.tsx`

```typescript
"use client";

import { useState } from "react";
import { ScoringDimension } from "@prisma/client";

const DIMENSION_LABELS: Record<ScoringDimension, string> = {
  INNOVATION: "Innovation",
  FEASIBILITY: "Feasibility",
  BUSINESS_IMPACT: "Business Impact",
};

interface ScoreInputProps {
  ideaId: number;
  dimension: ScoringDimension;
  currentValue?: number;
  onSave?: (value: number) => Promise<void>;
  disabled?: boolean;
}

export function ScoreInput({ ideaId, dimension, currentValue, onSave, disabled }: ScoreInputProps) {
  const [value, setValue] = useState<number | "">(currentValue || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSave = async () => {
    if (value === "") return; // Optional field

    if (typeof value !== "number" || value < 1 || value > 5) {
      setError("Score must be between 1 and 5");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/${ideaId}/score`, {
        method: "POST",
        body: JSON.stringify({ dimension, value }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save score");
      }

      if (onSave) await onSave(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving score");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={`score-${dimension}`} className="block text-sm font-medium">
        {DIMENSION_LABELS[dimension]}
      </label>
      <div className="flex gap-2">
        <input
          id={`score-${dimension}`}
          type="number"
          min="1"
          max="5"
          value={value}
          onChange={(e) => setValue(e.target.value ? parseInt(e.target.value) : "")}
          disabled={disabled || saving}
          className="border rounded px-2 py-1 w-20"
          aria-label={`Score for ${DIMENSION_LABELS[dimension]}`}
        />
        <button
          onClick={handleSave}
          disabled={disabled || saving || value === ""}
          className="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
```

### Step 6: Create Score Summary Component

**File**: `app/components/score-summary.tsx`

```typescript
"use client";

import { AggregateScore } from "@/lib/scoring";

interface ScoreSummaryProps {
  scores: AggregateScore;
}

export function ScoreSummary({ scores }: ScoreSummaryProps) {
  if (!scores.innovation && !scores.feasibility && !scores.businessImpact) {
    return <p className="text-gray-500">No scores available yet.</p>;
  }

  return (
    <div className="border rounded p-4 bg-gray-50">
      <h3 className="font-semibold mb-3">Evaluation Scores</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600">Innovation</p>
          <p className="text-xl font-bold">{scores.innovation?.toFixed(1) || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Feasibility</p>
          <p className="text-xl font-bold">{scores.feasibility?.toFixed(1) || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Business Impact</p>
          <p className="text-xl font-bold">{scores.businessImpact?.toFixed(1) || "—"}</p>
        </div>
      </div>
    </div>
  );
}
```

### Step 7: Integrate into Admin Review Panel

**File**: `app/components/admin-ideas-panel.tsx`

Import and use `ScoreInput` alongside existing stage comment form:

```typescript
import { ScoreInput } from "./score-input";
import { ScoringDimension } from "@prisma/client";

// Inside render logic for idea in review:
{idea.reviewStage && (
  <div className="space-y-4">
    {/* Existing stage comment form */}
    <StageCommentForm ... />
    
    {/* New scoring section */}
    {idea.reviewStage !== "final_decision" && (
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">Score This Idea</h3>
        <div className="space-y-3">
          <ScoreInput ideaId={idea.id} dimension="INNOVATION" />
          <ScoreInput ideaId={idea.id} dimension="FEASIBILITY" />
          <ScoreInput ideaId={idea.id} dimension="BUSINESS_IMPACT" />
        </div>
      </div>
    )}
  </div>
)}
```

### Step 8: Display Score Summary in Submitter Dashboard

**File**: `app/components/idea-card.tsx` (existing, extend)

```typescript
import { ScoreSummary } from "./score-summary";
import { aggregateScores } from "@/lib/scoring";

// Inside IdeaCard render:
{idea.status === "accepted" || idea.status === "rejected" ? (
  // Submitter can see scores post-decision
  <ScoreSummary scores={aggregateScores(idea.scores || [])} />
) : null}
```

---

## Testing Checklist

### Unit Tests

- [ ] `validateScore()` rejects <1 and >5
- [ ] `validateScore()` rejects non-integers
- [ ] `aggregateScores()` correctly averages scores by dimension
- [ ] `aggregateScores()` returns null for missing dimensions

### API Tests

- [ ] POST /api/admin/[ideaId]/score creates new score
- [ ] POST /api/admin/[ideaId]/score rejects draft ideas (409)
- [ ] POST /api/admin/[ideaId]/score validates value 1-5 (400)
- [ ] GET /api/admin/[ideaId]/score returns all scores
- [ ] Multiple admins can score same idea and dimension (upsert)

### Integration Tests

- [ ] Admin inputs score at Technical Review → saved
- [ ] Admin returns to idea, score pre-populated → editable
- [ ] Admin updates score → new value persists
- [ ] Submitter sees score summary only after accepted/rejected
- [ ] Submitter cannot see scores during review
- [ ] Draft ideas cannot be scored

### Manual Testing (QA)

- [ ] Open admin panel, add scores to 3 ideas across 3 dimensions
- [ ] Verify scores visible in admin panel throughout pipeline
- [ ] Accept one idea, verify submitter sees score summary
- [ ] Reject one idea, verify submitter sees score summary
- [ ] Test on mobile viewport, verify responsive layout
- [ ] Test keyboard navigation: Tab through score inputs, arrow keys in number field

---

## Troubleshooting

**Issue**: Prisma migration fails  
→ Clear .next/ cache: `rm -rf .next && npx prisma migrate dev --name add_scoring`

**Issue**: Type errors on IdeaScore  
→ Regenerate Prisma client: `npx prisma generate`

**Issue**: Scores not saving  
→ Check middleware returns correct user.id in POST /api/admin/[ideaId]/score  
→ Verify idea.status !== "draft" in validation

---

## Next Steps

1. Complete all implementation steps above
2. Run test checklist
3. Update PROJECT_SUMMARY.md (Phase 7 complete)
4. Submit PR with scoring feature

**Estimated Time**: 4-6 hours for experienced developer; 8-10 hours with testing
