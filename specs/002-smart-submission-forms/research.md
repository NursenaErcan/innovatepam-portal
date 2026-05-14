# Research: Smart Submission Forms (Phase 2)

## Decision 1: Persist category-specific fields in one structured `customFields` object

- Decision: Use a single structured `customFields` object associated with each idea submission.
- Rationale: This supports dynamic category evolution without schema churn for every new category field while remaining explicit and testable.
- Alternatives considered:
- Dedicated nullable columns per dynamic field: rejected due to schema bloat and migration overhead.
- Separate per-category detail tables: rejected as unnecessary complexity for current MVP scope.

## Decision 2: Keep category validation rules server-driven with category-specific rule mapping

- Decision: Validate dynamic fields using category-specific rule sets enforced server-side.
- Rationale: Server-side validation is authoritative, reduces bypass risk, and preserves consistency between UI and API behavior.
- Alternatives considered:
- Client-only validation: rejected due to bypass risk and inconsistent enforcement.
- Generic required-only validation: rejected because field format rules (integer/enums) are required.

## Decision 3: Render dynamic fields in admin review with category-aware labels

- Decision: Admin idea details include dynamic field values with human-readable labels by category.
- Rationale: Preserves review quality and avoids requiring admins to decode raw JSON keys.
- Alternatives considered:
- Hide dynamic fields from admin: rejected due to review context loss.
- Show raw JSON only: rejected because readability and usability are poor.

## Decision 4: Maintain backward compatibility through additive API/data changes

- Decision: Extend existing idea submission and retrieval payloads additively to include `customFields`.
- Rationale: Protects existing Phase 1 workflows and minimizes regression risk.
- Alternatives considered:
- Breaking payload changes: rejected due to avoidable risk to existing submitter/admin flows.

## Decision 5: Constrain dynamic field formats for testability

- Decision: `estimatedTimeSavingsHours` must be a positive integer; `implementationComplexity` must be enum `low|medium|high`.
- Rationale: Improves data consistency, simplifies validation, and enables future filtering/reporting.
- Alternatives considered:
- Free-text inputs: rejected due to inconsistent analytics quality.
- Overly broad enumerations: rejected to keep MVP UX simple.
