# InnovatePAM Portal

A Next.js-based innovation management system that enables organizations to collect, evaluate, and track innovation ideas through a multi-stage review pipeline with admin scoring and submitter feedback.

## Features

### Core Innovation Management
- **Multi-Stage Review Pipeline**: Ideas progress through Initial Screening → Technical Review → Business Impact Review → Final Decision
- **Blind Review Support**: Protect reviewer objectivity during early stages by hiding submitter information
- **Draft Management**: Submitters can save and revise ideas before submission
- **Attachment Support**: Submit supporting documents, images, and media with ideas
- **Stage Comments**: Reviewers provide feedback at each review stage

### Phase 7: Multi-Dimensional Scoring System (NEW)
- **3-Dimension Evaluation**: Innovation, Feasibility, Business Impact (1-5 scale)
- **Multi-Reviewer Aggregation**: Automatically average scores from multiple reviewers
- **Admin Scoring Interface**: Quick score input during review stages
- **Submitter Feedback**: View aggregated scores after Final Decision (accepted/rejected status)
- **Score Persistence**: Scores retained permanently after decision and cannot be modified
- **Draft Protection**: Automatic validation prevents scoring of draft ideas

### User Roles
- **Admin**: Score ideas, provide stage feedback, make accept/reject decisions
- **Submitter**: Create and track ideas, view final scores after decision

## Technology Stack

- **Framework**: [Next.js 16.2.6](https://nextjs.org) with TypeScript
- **Database**: [Prisma ORM](https://prisma.io) with SQLite
- **Frontend**: React with Tailwind CSS
- **Authentication**: Custom session-based with HTTP-only cookies
- **State**: React hooks (useState, useEffect, useCallback)

## Documentation

### User Guides
- [Admin Scoring Guide](./docs/SCORING-ADMIN.md) - How to score ideas at each review stage
- [Submitter Scoring Guide](./docs/SCORING-SUBMITTER.md) - How to view and interpret score feedback
- [Review Process Overview](./docs/PRD.md) - Complete product requirements and workflows

### Technical Documentation
- [Phase 7 Scoring System Specification](./specs/007-scoring-system/spec.md) - Feature requirements and acceptance criteria
- [Scoring System Architecture](./specs/007-scoring-system/research.md) - Technical decisions and constraints
- [Data Model](./specs/007-scoring-system/data-model.md) - Database schema and entity relationships
- [API Contracts](./specs/007-scoring-system/contracts/api.md) - REST API endpoint specifications
- [Implementation Plan](./specs/007-scoring-system/plan.md) - Tech stack and file structure

### Architecture Decision Records
- [ADR-001: Tech Stack](./docs/ADR-001-tech-stack.md) - Why Next.js + Prisma + SQLite
- [ADR-002: Authentication](./docs/ADR-002-authentication.md) - Custom session-based auth approach
- [ADR-003: File Upload Strategy](./docs/ADR-003-file-upload-strategy.md) - Local file storage design

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
