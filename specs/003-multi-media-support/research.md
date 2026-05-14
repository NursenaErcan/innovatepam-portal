# Research: Phase 3 Multi-Media Support

## Decision 1: Convert attachment relation to one-to-many per idea

- Decision: Replace single-attachment idea linkage with a one-to-many `attachments` relation.
- Rationale: Multi-file submission requires independent metadata rows while preserving order and lifecycle per file.
- Alternatives considered:
- Store multiple files in one JSON field on Idea: rejected due to poor queryability and weak relational integrity.
- Keep single attachment and zip files client-side: rejected because it harms usability and validation clarity.

## Decision 2: Keep submit-time upload and server-side validation for all files

- Decision: Accept multiple files in one final submission request and validate every file server-side before persistence.
- Rationale: This aligns with clarified behavior (upload on final submit), prevents orphaned temporary files, and keeps authority on the backend.
- Alternatives considered:
- Immediate background upload on file select: rejected due to temp-file cleanup complexity and mismatch with clarified flow.
- Client-only validation: rejected due to bypass risk and inconsistent enforcement.

## Decision 3: Enforce atomic persistence for idea + attachments

- Decision: Treat final submit as atomic; if any file write or metadata persistence fails, do not persist idea or attachments.
- Rationale: Avoids partial submissions and keeps user/admin data consistent.
- Alternatives considered:
- Partial success model: rejected because it creates unclear state and retry complexity.
- Draft fallback model: rejected as out of current scope and unnecessary for MVP phase.

## Decision 4: Implement secure, role-aware attachment retrieval

- Decision: Serve attachment binaries through authenticated route handlers with role/ownership checks.
- Rationale: Clarified access policy requires only idea owner submitter or admin to download files; static public links cannot enforce this.
- Alternatives considered:
- Continue serving from public URLs: rejected because it cannot enforce authorization.
- Admin-only access: rejected because submitter owner access is a confirmed requirement.

## Decision 5: Thumbnail previews use original image files (no preprocessing pipeline)

- Decision: For image MIME types (`image/png`, `image/jpg`, `image/jpeg`), render simple thumbnails directly from protected file endpoints.
- Rationale: Meets "simple thumbnail" requirement without adding image-processing dependencies or background jobs.
- Alternatives considered:
- Generated thumbnail derivatives: rejected as unnecessary complexity for Phase 3.
- No preview support: rejected because thumbnail preview is a required feature.

## Decision 6: Preserve backward compatibility for older single-attachment ideas

- Decision: Migrate schema to support multiple attachments while keeping existing single attachments readable as one-item attachment lists.
- Rationale: FR-013 requires older ideas to remain reviewable without migration errors.
- Alternatives considered:
- Breaking migration that resets attachment data: rejected due to data loss risk.
- Dual schema with separate legacy/new models: rejected as avoidable complexity.
