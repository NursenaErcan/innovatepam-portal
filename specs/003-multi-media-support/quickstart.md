# Quickstart: Phase 3 Multi-Media Support

## Prerequisites
- Existing project dependencies installed.
- Local SQLite database configured.
- Seeded submitter and admin users available.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Apply migration and regenerate Prisma client:

```bash
npm run db:migrate -- --name multi-media-support
npm run db:generate
```

3. Start development server:

```bash
npm run dev
```

## Manual Validation Scenarios

### Submitter multi-file workflow
- Login as submitter.
- Open submitter idea form.
- Select multiple valid files (2-3 files) in one interaction.
- Remove one selected file before submit.
- Submit idea and verify only remaining files are saved.

### Submit with zero attachments
- Login as submitter.
- Complete valid idea fields and dynamic category fields.
- Submit without selecting any file.
- Verify submission succeeds.

### Validation and edge handling
- Try uploading one invalid type with valid files in same attempt; verify request is rejected with clear feedback.
- Try uploading one oversize file with valid files; verify request is rejected.
- Try exceeding attachment cap (default 10); verify clear limit error.
- Verify no partial persistence when any attachment fails (idea and attachments not created).

### Admin review and attachment access
- Login as admin.
- Open admin ideas list/detail for an idea with mixed files.
- Verify all attachments are listed in submission order.
- Verify image files show thumbnail previews.
- Verify PDF/DOCX files render without thumbnails and are downloadable.
- Verify downloads and previews are served through `/api/attachments/{attachmentId}`.

### Authorization checks
- As non-owner submitter, attempt to access another submitter's attachment URL; verify denied.
- As idea owner submitter, verify download is allowed.
- As admin, verify download is allowed.

### Regression checks
- Register/login/logout flows continue to work.
- Phase 2 dynamic custom-field validation still works.
- Admin status updates and evaluation comments still work.

## Endpoint Notes
- Attachment download and preview endpoint: `GET /api/attachments/{attachmentId}`
- Authorization rule: only admin or idea owner submitter can access attachment binaries.

## Validation Commands

```bash
npm run lint
npm run build
```

## Validation Results (2026-05-14)
- `npm run lint`: pass (1 non-blocking warning: `@next/next/no-img-element` in `app/components/idea-card.tsx`)
- `npm run build`: pass
- Manual regression checklist: pending interactive browser execution

## Expected Outcome
- Multi-file submission, removal-before-submit, secure download, and image thumbnail preview are functional.
- Existing Phase 1 and Phase 2 behavior remains intact.
