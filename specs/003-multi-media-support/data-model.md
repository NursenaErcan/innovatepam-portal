# Data Model: Phase 3 Multi-Media Support

## Entities

### Idea (extended)
- Existing core fields remain:
- `id`, `title`, `description`, `category`, `customFields`, `status`, `submitterId`, timestamps
- Attachment relationship changes from optional single to one-to-many:
- `attachments: Attachment[]`

Relationships
- Idea belongs to one submitter.
- Idea has many attachments.
- Idea has many evaluation comments.

Validation Rules
- Idea may be submitted with zero attachments.
- Attachment count must be `0..maxAttachmentsPerIdea` (configurable, default 10).
- For any included attachment, all existing per-file type and size rules apply.
- Final submit is atomic for idea plus attachments.

### Attachment
- `id: string` (UUID)
- `ideaId: string` (FK -> Idea)
- `fileName: string`
- `storagePath: string` (non-public server storage path reference)
- `mimeType: string`
- `size: number`
- `displayOrder: number` (submission order for FR-007)
- `createdAt: DateTime`

Derived Concepts
- `isImagePreviewEligible = mimeType in {image/png, image/jpg, image/jpeg}`
- `downloadAuthorized(user, idea) = user.role === admin || user.id === idea.submitterId`

Validation Rules
- `mimeType` must be one of allowed file types.
- `size` must be <= configured max upload size (existing rule, currently 10MB).
- `displayOrder` must be unique per idea and contiguous from `0..n-1` at persistence time.

### AttachmentPreview (view model)
- `attachmentId: string`
- `fileName: string`
- `previewUrl: string | null` (non-null for image types)
- `downloadUrl: string`
- `mimeType: string`
- `size: number`

Usage
- Admin idea details render thumbnails when `previewUrl` is present.
- Non-image files render as standard downloadable rows.

## State and Lifecycle Notes

### Submission lifecycle (attachments)
1. User selects files in client state.
2. User optionally removes files before submit.
3. On final submit, server validates all files.
4. If any file fails validation or persistence, whole submission fails (no idea or attachments persisted).
5. On success, attachments persist in original submission order.

### Access lifecycle
- Submitter owner and admins can download attachment files.
- Non-owner submitters and unauthenticated users are denied.

## Backward Compatibility Notes
- Existing records with a single attachment remain valid and are exposed as one-item attachment arrays in API/UI view models.
- Migration must preserve existing attachment rows and remove one-to-one cardinality constraints safely.
- Existing ideas without attachments remain valid and readable.
