import { NextRequest, NextResponse } from 'next/server';
import { webhookCallback } from 'grammy';
import { bot } from '@/bot';
import { botConfig } from '@/bot/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handleUpdate = webhookCallback(bot, 'std/http');

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'telegram-bot-webhook',
  });
}

export async function POST(request: NextRequest) {
  if (botConfig.telegramWebhookSecret) {
    const incomingSecret = request.headers.get('x-telegram-bot-api-secret-token');
    if (incomingSecret !== botConfig.telegramWebhookSecret) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  return handleUpdate(request);
}
