# VentureScope

VentureScope is an AI-powered deal flow management platform for venture capital investors. It streamlines the investment evaluation process by combining document analysis, automated assessments, and collaborative decision-making tools.

## Features

- **Company Pipeline Management** - Track investment opportunities through customizable stages with grid and Kanban views
- **AI-Powered Assessments** - Generate screening and full investment memos from uploaded documents using Claude
- **Deal Intake Forms** - Public submission links for founders to submit their companies directly
- **IC Voting** - Blind voting workflow for investment committee decisions with quorum tracking
- **Document Processing** - Upload and analyze pitch decks, financials, and other investment materials
- **Team Collaboration** - Multi-user organizations with role-based access control

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth v5
- **AI**: Claude API
- **UI**: shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form + Zod

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

Required environment variables:

- `DATABASE_URL` - Supabase connection string
- `NEXTAUTH_SECRET` - NextAuth session secret
- `ANTHROPIC_API_KEY` - Claude API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
