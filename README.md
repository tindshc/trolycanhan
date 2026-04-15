# Tro Ly Ca Nhan Bot

Telegram bot built with `grammY`, deployed through `Vercel`, and backed by `Supabase`.

## Stack

- Next.js App Router for the webhook endpoint
- grammY for Telegram bot handlers and conversations
- Supabase for persistent bot sessions and personnel data
- TypeScript across the project

## Main Paths

- `src/app/api/bot/route.ts`: Telegram webhook endpoint for Vercel
- `src/bot/index.ts`: bot bootstrap, middleware, conversations, handlers
- `src/bot/handlers/*`: Telegram feature handlers
- `src/bot/conversations/*`: multi-step grammY conversations
- `src/bot/services/*`: Supabase-backed data access
- `scripts/set-webhook.ts`: register Telegram webhook to Vercel

## Environment Variables

Copy `.env.example` to `.env.local` and set:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Local Development

```bash
npm install
npm run dev
```

To run the bot locally with long polling:

```bash
npm run dev:bot
```

## Webhook Setup

After deploying to Vercel and setting the same env vars there:

```bash
npm run webhook:set
```

To remove the webhook:

```bash
npm run webhook:delete
```

## Supabase Setup

Run the SQL in `supabase/schema.sql` to create:

- `public.bot_sessions`
- `public.nhansu`
- `public.count_personnel_by_gender()`

## Current Features

- `/start` main menu
- Personnel menu
- Add personnel via multi-step conversation
- Search and delete personnel
- Personnel stats by gender and education level
