# Data Model: Smart Submission Forms (Phase 2)

## Entities

### Idea (extended)
- Existing core fields remain unchanged:
- `id`, `title`, `description`, `category`, `status`, `submitterId`, timestamps
- Existing attachment and comment relationships remain unchanged
- New field:
- `customFields: Json | null` (stored as nullable JSON object)

Relationships
- Idea continues to belong to one submitter and optional attachment.
- Idea continues to have many evaluation comments.

Validation Rules
- Core Phase 1 validation rules remain unchanged.
- `customFields` is category-dependent and validated by selected category.
- For categories with required dynamic fields, `customFields` must include all required keys with valid values.
- For categories without custom fields (e.g., `Other`), `customFields` may be null or empty object.

## Category Field Set Definitions

### Technical Innovation
Required `customFields` keys:
- `architectureImpact: string`
- `technologyStack: string`
- `implementationComplexity: "low" | "medium" | "high"`

Validation
- All fields required and non-empty.
- `implementationComplexity` must match enum values exactly.

### Process Improvement
Required `customFields` keys:
- `currentProcess: string`
- `proposedImprovement: string`
- `estimatedTimeSavingsHours: number`

Validation
- String fields required and non-empty.
- `estimatedTimeSavingsHours` must be a positive integer.

### Client Solution
Required `customFields` keys:
- `clientProblem: string`
- `businessImpact: string`
- `targetIndustry: string`

Validation
- All fields required and non-empty.

## View Model: Admin Idea Details
- Includes core idea fields and `customFields` rendered with category-aware labels.
- Raw key names should not be primary UI labels.

## Backward Compatibility Notes
- Existing ideas without `customFields` remain valid and reviewable.
- Existing submitter/admin workflows continue without requiring migration of old records.
