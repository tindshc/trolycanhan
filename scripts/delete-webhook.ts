import { Bot } from 'grammy';
import { botConfig } from '../src/bot/config';

async function main() {
  const bot = new Bot(botConfig.telegramBotToken);
  await bot.api.deleteWebhook({ drop_pending_updates: false });

  const info = await bot.api.getWebhookInfo();
  console.log(JSON.stringify(info, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
