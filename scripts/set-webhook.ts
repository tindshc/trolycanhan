import { bot } from '../src/lib/bot';

const webhookUrl = process.argv[2];

if (!webhookUrl) {
  console.error('LỖI: Vui lòng cung cấp URL Vercel của bạn. \nVí dụ: npx tsx scripts/set-webhook.ts https://your-app.vercel.app');
  process.exit(1);
}

const fullUrl = `${webhookUrl.replace(/\/$/, '')}/api/bot`;

async function setWebhook() {
  console.log(`Đang thiết lập Webhook tại: ${fullUrl}...`);
  try {
    await bot.api.setWebhook(fullUrl);
    console.log('✅ THÀNH CÔNG! Webhook đã được thiết lập.');
    console.log('Giờ đây bot sẽ tự động nhận tin nhắn qua Vercel.');
  } catch (err) {
    console.error('❌ THẤT BẠI khi thiết lập Webhook:', err);
  }
}

setWebhook();
