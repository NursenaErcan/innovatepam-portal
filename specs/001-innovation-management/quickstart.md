# Quickstart: InnovatEPAM Portal MVP

## Prerequisites

- Node.js 20+ installed
- npm installed
- Local terminal access to the repository

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the repository root with:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="replace-with-a-long-random-string"
UPLOAD_DIR="./public/uploads"
```

3. Create the Prisma schema and apply the migration:

```bash
npm run db:migrate -- --name init
```

4. Seed an admin account with the provided seed script:

```bash
npm run db:seed
```

The seed script should create one admin user:
- `email`: `admin@innovatepam.local`
- `password`: `Admin123!`
- `role`: `admin`

5. Create the upload directory:

```bash
mkdir public/uploads
```

## Running locally

```bash
npm run dev
```

Open the app at `http://localhost:3000`.

## Manual validation steps

- Register a new submitter account.
- Log in as the submitter and submit an idea with title, description, category, and one file attachment.
- View the submitter's own idea list.
- Log out and log in as the seeded admin account.
- View all submitted ideas and update one idea's status with an evaluation comment.

## Notes

- The app stores data in `dev.db` and attachment metadata in SQLite.
- Uploaded files are stored in `public/uploads` and referenced by path only; no protected upload route is required for Phase 1.
- No automated tests are required for this Phase 1 MVP.
