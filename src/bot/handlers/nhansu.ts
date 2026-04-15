import { Composer, Keyboard, InlineKeyboard } from 'grammy';
import { MyContext } from '../index';
import { PersonnelService } from '../services/nhansu';

export const nhansuHandler = new Composer<MyContext>();

const NHANSU_KEYBOARD = new Keyboard()
  .text('➕ Thêm nhân sự').text('🔍 Tìm & Xóa').row()
  .text('📊 Thống kê').text('⬅️ Quay lại')
  .resized();

const STATS_KEYBOARD = new InlineKeyboard()
  .text('👫 Theo Giới tính', 'stats:gender')
  .text('🎓 Theo Trình độ', 'stats:education');

// Entry point for Personnel module
nhansuHandler.hears('📓 Sổ nhân sự', async (ctx) => {
  await ctx.reply('📂 **QUẢN LÝ NHÂN SỰ**\nBạn muốn thực hiện thao tác nào?', {
    parse_mode: 'Markdown',
    reply_markup: NHANSU_KEYBOARD
  });
});

// Back to Main Menu
nhansuHandler.hears('⬅️ Quay lại', async (ctx) => {
  await ctx.reply('🔙 Quay lại Menu chính:', {
    reply_markup: new Keyboard()
      .text('📓 Sổ nhân sự').row()
      .text('💼 Công việc').text('👤 Cá nhân').row()
      .text('⚙️ Cài đặt').text('❓ Hỗ trợ')
      .resized()
  });
});

// Trigger Add Personnel Conversation
nhansuHandler.hears('➕ Thêm nhân sự', async (ctx) => {
  await ctx.conversation.enter('addNhansu');
});

// Statistics Menu
nhansuHandler.hears('📊 Thống kê', async (ctx) => {
  await ctx.reply('📊 **THỐNG KÊ NHÂN SỰ**\nChọn tiêu chí thống kê:', {
    reply_markup: STATS_KEYBOARD
  });
});

// Handle Gender Stats
nhansuHandler.callbackQuery('stats:gender', async (ctx) => {
  const stats = await PersonnelService.getStatsByGender();
  let msg = '📊 **THỐNG KÊ THEO GIỚI TÍNH**\n\n';
  for (const [gender, count] of Object.entries(stats)) {
    msg += `🔹 **${gender}**: ${count} người\n`;
  }
  await ctx.editMessageText(msg, { parse_mode: 'Markdown' });
});

// Handle Education Stats
nhansuHandler.callbackQuery('stats:education', async (ctx) => {
  const stats = await PersonnelService.getStatsByEducation();
  let msg = '📊 **THỐNG KÊ THEO TRÌNH ĐỘ**\n\n';
  for (const [level, count] of Object.entries(stats)) {
    msg += `🔹 **${level}**: ${count} người\n`;
  }
  await ctx.editMessageText(msg, { parse_mode: 'Markdown' });
});

// Delete flow (Search first)
nhansuHandler.hears('🔍 Tìm & Xóa', async (ctx) => {
  await ctx.reply('🔍 Nhập tên nhân sự bạn muốn tìm để xóa:');
  ctx.session.step = 'waiting_for_delete_search';
});

// Handle Search results and Delete action
nhansuHandler.on('message:text', async (ctx, next) => {
  if (ctx.session.step !== 'waiting_for_delete_search') return next();

  const name = ctx.message.text;
  const { data: results } = await PersonnelService.findByName(name);

  if (!results || results.length === 0) {
    return ctx.reply(`❌ Không tìm thấy nhân sự nào tên "${name}"`);
  }

  const kb = new InlineKeyboard();
  results.forEach(p => {
    kb.text(`🗑️ Xóa ${p.full_name}`, `del:${p.id}`).row();
  });
  
  await ctx.reply(`🔍 Kết quả tìm kiếm cho "${name}":`, { reply_markup: kb });
  ctx.session.step = 'idle';
});

// Handle Delete callback
nhansuHandler.callbackQuery(/^del:(\d+)$/, async (ctx) => {
  const id = parseInt(ctx.match![1]);
  const { error } = await PersonnelService.delete(id);
  
  if (error) {
    await ctx.answerCallbackQuery(`❌ Lỗi: ${error.message}`);
  } else {
    await ctx.answerCallbackQuery('✅ Đã xóa nhân sự thành công!');
    await ctx.editMessageText('✅ Nhân sự đã được xóa khỏi hệ thống.');
  }
});
