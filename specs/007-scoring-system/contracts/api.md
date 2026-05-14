# API Contracts: Phase 7 Scoring System

**Date**: May 14, 2026  
**Feature**: Phase 7 Scoring System

## POST /api/admin/[ideaId]/score

**Purpose**: Create or update a score for an idea dimension

**Request**:
```json
{
  "dimension": "INNOVATION" | "FEASIBILITY" | "BUSINESS_IMPACT",
  "value": 1-5 (integer)
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "score": {
    "id": 42,
    "ideaId": 5,
    "dimension": "INNOVATION",
    "value": 4,
    "reviewedBy": "admin@example.com",
    "createdAt": "2026-05-14T14:30:00Z",
    "updatedAt": "2026-05-14T14:30:00Z"
  }
}
```

**Response (Bad Request - 400)**:
```json
{
  "error": "Score must be integer 1-5" | "Invalid dimension"
}
```

**Response (Conflict - 409)**:
```json
{
  "error": "Cannot score draft ideas"
}
```

**Response (Not Found - 404)**:
```json
{
  "error": "Idea not found"
}
```

**Response (Unauthorized - 403)**:
```json
{
  "error": "Unauthorized"
}
```

---

## GET /api/admin/[ideaId]/score

**Purpose**: Retrieve all scores for an idea

**Response (Success - 200)**:
```json
{
  "scores": [
    {
      "id": 40,
      "ideaId": 5,
      "dimension": "INNOVATION",
      "value": 4,
      "reviewer": {
        "id": "user-1",
        "email": "alice@example.com"
      },
      "createdAt": "2026-05-13T10:00:00Z",
      "updatedAt": "2026-05-13T10:00:00Z"
    },
    {
      "id": 41,
      "ideaId": 5,
      "dimension": "INNOVATION",
      "value": 5,
      "reviewer": {
        "id": "user-2",
        "email": "bob@example.com"
      },
      "createdAt": "2026-05-14T09:00:00Z",
      "updatedAt": "2026-05-14T09:00:00Z"
    }
  ]
}
```

---

## GET /api/ideas/[ideaId]/score-summary (Submitter)

**Purpose**: Retrieve aggregated score summary (only post-decision)

**Response (Success - 200, idea accepted/rejected)**:
```json
{
  "innovation": 4.5,
  "feasibility": 4.0,
  "businessImpact": 4.2
}
```

**Response (Forbidden - 403, idea not decided)**:
```json
{
  "error": "Score summary only visible after Final Decision"
}
```

**Response (Not Found - 404)**:
```json
{
  "error": "Idea not found"
}
```

---

## React Component Contracts

### ScoreInput

**Props**:
```typescript
interface ScoreInputProps {
  ideaId: number;
  dimension: "INNOVATION" | "FEASIBILITY" | "BUSINESS_IMPACT";
  currentValue?: number;
  onSave?: (value: number) => Promise<void>;
  disabled?: boolean;
}
```

**Behavior**:
- Renders labeled number input (1-5)
- Shows Save button (disabled if value empty or invalid)
- Calls POST /api/admin/[ideaId]/score on save
- Calls onSave callback after successful save
- Displays error message on validation or API failure

---

### ScoreSummary

**Props**:
```typescript
interface ScoreSummaryProps {
  scores: {
    innovation: number | null;
    feasibility: number | null;
    businessImpact: number | null;
  };
}
```

**Behavior**:
- Renders three-column layout (Innovation, Feasibility, Business Impact)
- Displays average score for each dimension
- Shows "—" if no scores available for dimension
- Mobile-responsive (stacks on small viewports)

---

## Data Serialization Contracts

### IdeaScore Type

```typescript
import { ScoringDimension } from "@prisma/client";

type IdeaScore = {
  id: number;
  ideaId: number;
  dimension: ScoringDimension; // INNOVATION | FEASIBILITY | BUSINESS_IMPACT
  value: number;               // 1-5
  reviewedBy: string;
  createdAt: Date;
  updatedAt: Date;
};
```

### AggregateScore Type

```typescript
type AggregateScore = {
  innovation: number | null;
  feasibility: number | null;
  businessImpact: number | null;
};
```
