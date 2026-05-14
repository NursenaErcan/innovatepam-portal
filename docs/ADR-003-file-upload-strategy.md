# ADR-003: File Upload Strategy

- Status: Accepted
- Date: 2026-05-14
- Context: InnovatEPAM Portal MVP requires one attachment per idea in a local-first environment.

## Decision
The MVP stores uploaded files on the local filesystem under public/uploads and stores attachment metadata in SQLite via Prisma.

Attachment metadata includes:
- fileName
- storagePath
- mimeType
- size
- association to idea record

## Why local public/uploads storage was selected
Local storage under public/uploads was selected because the MVP is explicitly local-first and optimized for fast setup and demonstration.

Reasons:
- Zero external infrastructure required.
- Simple operational model for local development.
- Fast implementation with low integration complexity.
- Direct compatibility with the existing Next.js static file serving model.

## Why cloud storage was avoided
Cloud storage providers were intentionally avoided in the MVP phase.

Reasons:
- External credentials, buckets, SDK setup, and environment configuration add significant setup overhead.
- Cloud integration is unnecessary for current local validation goals.
- It would increase delivery scope and complexity before core workflow validation is complete.

## Upload validation strategy
Validation is enforced server-side in the idea submission flow before persistence completes.

Strategy:
- Require exactly one uploaded file per idea.
- Validate required idea fields (title, description, category).
- Validate attachment MIME type against an allowlist.
- Validate attachment size against maximum threshold.
- Reject invalid submissions with explicit validation errors.

The server does not finalize an idea when upload validation fails.

## File restrictions
The implemented MVP restrictions are:
- Attachment count: exactly one file per idea.
- Maximum size: 10MB.
- Allowed file types:
- PDF
- PNG
- JPG
- JPEG
- DOCX
- Storage location: public/uploads.
- Access mode (Phase 1): static public URL access.

## MVP tradeoffs
### Pros
- Fast delivery and easy local reproducibility.
- Minimal moving parts and no third-party storage dependency.
- Clear and auditable validation rules aligned to product requirements.

### Cons
- Public static access is not role-protected.
- No object storage durability guarantees, lifecycle tooling, or CDN behavior.
- Local filesystem coupling is not ideal for distributed or production-grade deployments.

## Consequences
### Positive consequences
- The MVP can be run and validated quickly by any developer with minimal setup.
- Upload behavior remains transparent and easy to debug.
- Attachment metadata and idea records remain consistently linked in the database.

### Negative consequences
- Security and access-control posture for attachments is intentionally limited in this phase.
- Migration to production-ready file storage will require architectural changes.

## Follow-up direction
Planned post-MVP improvements:
- Replace static public attachment access with protected download endpoints.
- Enforce role/ownership checks on file access.
- Add malware scanning hooks and stricter content validation.
- Define attachment lifecycle policies (retention, deletion, replacement).
- Evaluate cloud object storage integration for production environments.
