import { bot } from './index';

async function startLocalBot() {
  console.log('🤖 Bot đang chạy ở chế độ Long Polling (Local)...');
  
  // Xóa webhook cũ nếu có để tránh xung đột
  await bot.api.deleteWebhook();
  
  bot.start({
    onStart: (botInfo) => {
      console.log(`✅ Bot đã sẵn sàng: @${botInfo.username}`);
    },
  });
}

startLocalBot().catch(console.error);
