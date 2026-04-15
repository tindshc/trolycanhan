import { type Conversation } from '@grammyjs/conversations';
import { MyContext } from '../index';
import { Personnel, PersonnelService } from '../services/nhansu';
import { Keyboard } from 'grammy';

type MyConversation = Conversation<MyContext, MyContext>;

/**
 * Hội thoại nhập liệu nhân sự từng bước
 */
export async function addNhansuConversation(conversation: MyConversation, ctx: MyContext) {
  const data: Partial<Personnel> = {};

  await ctx.reply("📝 **Bắt đầu nhập nhân sự mới**\n\nHãy nhập **Họ và tên**: ", { parse_mode: 'Markdown' });
  data.full_name = await conversation.form.text();

  await ctx.reply("📅 Nhập **Ngày sinh** (Định dạng: YYYY-MM-DD, ví dụ: 1990-05-20):");
  data.date_of_birth = await conversation.form.text();

  await ctx.reply("🏢 Nhập **Đơn vị công tác**: ");
  data.department = await conversation.form.text();

  await ctx.reply("🎓 Nhập **Trình độ đào tạo** (ví dụ: Đại học, Sau đại học...): ");
  data.education_level = await conversation.form.text();

  await ctx.reply("🧪 Nhập **Chuyên ngành**: ");
  data.specialization = await conversation.form.text();

  const genderKeyboard = new Keyboard().text("Nam").text("Nữ").resized().oneTime();
  await ctx.reply("👫 Chọn **Giới tính**:", { reply_markup: genderKeyboard });
  data.gender = await conversation.form.text();

  await ctx.reply("⌛ Đang lưu dữ liệu...");
  const { data: result, error } = await PersonnelService.create(data as Personnel);

  if (error) {
    await ctx.reply(`❌ Lỗi khi lưu: ${error.message}`);
  } else {
    await ctx.reply(`✅ Đã thêm nhân sự: **${result.full_name}** thành công!`, { parse_mode: 'Markdown' });
  }
}
