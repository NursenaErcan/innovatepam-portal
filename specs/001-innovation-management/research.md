# Research: InnovatEPAM Portal

## Decision

Choose a local Next.js App Router application with TypeScript, Tailwind CSS, and shadcn/ui to build the InnovatEPAM Portal MVP.

## Rationale

- The repository already uses Next.js App Router, which matches the requested architecture and minimizes new project setup.
- TypeScript strict mode supports the constitution requirement for clean, maintainable code.
- Tailwind CSS plus shadcn/ui provides a lightweight, component-driven UI foundation without introducing a large new framework.
- Prisma ORM with SQLite is the simplest local persistence stack that supports structured schema, migrations, and relational queries.
- bcrypt is the standard choice for hashing passwords securely in a local auth flow.
- A custom cookie/session-based authentication approach keeps the MVP aligned with the request while avoiding the complexity of NextAuth.
- Local file uploads are best implemented using Next.js route handlers and `formData()` with attachment metadata stored in SQLite.

## Alternatives Considered

- NextAuth or OAuth provider
  - Rejected: Too much integration overhead for a local MVP and not required by the spec.
- JWT-based authentication
  - Rejected: The user requested cookie/session-based authentication, and JWT would complicate session invalidation and local state.
- PostgreSQL or external DB
  - Rejected: SQLite is sufficient for local MVP storage and reduces operational complexity.
- Cloud file storage
  - Rejected: Local file uploads meet the MVP requirement and keep the implementation contained to the local environment.

## Implementation Notes

- Use a `prisma/schema.prisma` model for `User`, `Idea`, `Attachment`, `EvaluationComment`, and `Session`.
- Store files in `public/uploads` and persist only metadata in SQLite.
- Use `bcrypt` for hashing passwords and `crypto.randomUUID()` for session tokens.
- Implement server-side access control in route handlers, protecting submitter and admin endpoints separately.
- Seed or document admin provisioning separately from public registration.
- Manual testing is acceptable; automated tests are not required for Phase 1.
