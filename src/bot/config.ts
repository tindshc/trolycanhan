function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const botConfig = {
  telegramBotToken: requiredEnv('TELEGRAM_BOT_TOKEN'),
  supabaseUrl: requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseServiceRoleKey: requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
  appUrl: process.env.APP_URL,
  telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
};
