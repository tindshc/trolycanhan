import { Composer, Keyboard } from 'grammy';
import { MyContext } from '../index';

export const startHandler = new Composer<MyContext>();

const MAIN_KEYBOARD = new Keyboard()
  .text('📓 Sổ nhân sự').row()
  .text('💼 Công việc').text('👤 Cá nhân').row()
  .text('⚙️ Cài đặt').text('❓ Hỗ trợ')
  .resized();

startHandler.command('start', async (ctx) => {
  await ctx.reply(
    `👋 Chào mừng bạn đến với **Trợ lý Cá nhân**!\n\n` +
    `Tôi là bot được xây dựng trên nền tảng **grammY** và vận hành bởi **Vercel**.\n\n` +
    `Hãy chọn một mục dưới đây để bắt đầu.`,
    {
      parse_mode: 'Markdown',
      reply_markup: MAIN_KEYBOARD
    }
  );
});
