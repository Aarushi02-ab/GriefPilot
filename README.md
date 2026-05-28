# GriefPilot

GriefPilot is a Next.js 14 app for helping families organize practical after-loss tasks.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Then open http://localhost:3000.

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_OUTPUT_TOKENS=900
OPENAI_MOCK_RESPONSES=false
SUPABASE_SECRET_KEY=your_supabase_secret_key_for_server_routes
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=GriefPilot <onboarding@resend.dev>
```

Set `OPENAI_MOCK_RESPONSES=true` to test the local API routes without using
OpenAI credits.

## Routes

- `/` - landing page explaining GriefPilot
- `/onboarding` - family intake form
- `/dashboard` - saved digital account dashboard grouped by category
- `/api/discover-accounts` - POST endpoint for likely digital account discovery
- `/api/draft-letter` - POST endpoint for digital estate letter drafting
- `/api/send-letter` - POST endpoint for sending drafted letters with Resend
- `/api/update-account-status` - POST endpoint for status tracker updates

After onboarding, GriefPilot discovers likely digital accounts, saves them to
Supabase, and shows them on the dashboard as category-grouped cards. Each saved
account card can draft a letter in a modal, send it with Resend, and track
status from `Not started` to `Resolved`.

Example API request:

```bash
curl -X POST http://localhost:3000/api/discover-accounts \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.doe@gmail.com"}'
```

Example letter request:

```bash
curl -X POST http://localhost:3000/api/draft-letter \
  -H "Content-Type: application/json" \
  -d '{
    "platform_name": "LinkedIn",
    "action_type": "memorialize",
    "deceased_name": "Jane Doe",
    "date_of_death": "2026-05-01",
    "family_member_name": "Alex Doe"
  }'
```

## Supabase

The project expects these public tables:

- `estates`: `id`, `name`, `email`, `date_of_death`, `created_at`
- `digital_accounts`: `id`, `estate_id`, `platform_name`, `account_type`, `status`, `action_taken`
