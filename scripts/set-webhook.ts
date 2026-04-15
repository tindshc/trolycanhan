import { Bot } from 'grammy';
import { botConfig } from '../src/bot/config';

async function main() {
  if (!botConfig.appUrl) {
    throw new Error('Missing APP_URL. Example: https://your-project.vercel.app');
  }

  const webhookUrl = new URL('/api/bot', botConfig.appUrl).toString();
  const bot = new Bot(botConfig.telegramBotToken);
  const options = {
    allowed_updates: ['message', 'callback_query'] as const,
    drop_pending_updates: false,
    ...(botConfig.telegramWebhookSecret
      ? { secret_token: botConfig.telegramWebhookSecret }
      : {}),
  };

  await bot.api.setWebhook(webhookUrl, options);

  const info = await bot.api.getWebhookInfo();
  console.log(JSON.stringify(info, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
