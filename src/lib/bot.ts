import { Bot, Context, session, SessionFlavor, Keyboard, InlineKeyboard } from 'grammy';
import { supabase } from './supabase';
import { getSolarDate, getLunarDate } from './lunar';
import { rankAuspiciousDays, TASK_LIST, TaskType } from './horoscope';
import { generatePrayerOutdoor } from './vancung';

// Define session interface
interface SessionData {
  step: 'idle' 
    | 'waiting_for_name' | 'waiting_for_year' | 'waiting_for_education' | 'waiting_for_specialty'
    | 'waiting_for_contact_search' 
    | 'waiting_for_edit_contact_search'
    | 'selecting_contact_to_edit'
    | 'waiting_for_edit_value'
    | 'waiting_for_new_contact_data'
    | 'waiting_for_genealogy_search'
    | 'waiting_for_edit_giapha_search'
    | 'selecting_relative_to_edit'
    | 'waiting_for_giapha_edit_value'
    | 'thuchi_main'
    | 'selecting_goal_for_input'
    | 'selecting_goal_for_report'
    | 'waiting_for_thuchi_type'
    | 'waiting_for_thuchi_amount'
    | 'waiting_for_thuchi_continue'
    | 'waiting_for_thuchi_goal_name'
    | 'waiting_for_meeting_type_name'
    | 'waiting_for_meeting_date'
    | 'waiting_for_meeting_title'
    | 'waiting_for_meeting_content'
    | 'waiting_for_meeting_search'
    | 'waiting_for_meeting_search_local'
    | 'waiting_for_reminder_input'
    | 'waiting_for_reminder_search'
    | 'waiting_for_horoscope_range'
    | 'reading_book_section'
    | 'waiting_for_vancung_type'
    | 'waiting_for_vancung_date'
    | 'waiting_for_vancung_location'
    | 'waiting_for_expense_year' | 'waiting_for_new_project_code' | 'waiting_for_new_project_name'
    | 'waiting_for_new_activity_code' | 'waiting_for_new_activity_name'
    | 'waiting_for_new_expense_data' | 'waiting_for_expense_spent'
    | 'waiting_for_doc_date' | 'waiting_for_doc_service' | 'waiting_for_doc_desc'
    | 'waiting_for_doc_deadline' | 'waiting_for_doc_address' | 'waiting_for_doc_phone';
  context: 'nhansu' | 'danhba' | 'giapha' | 'thuchi' | 'meetings' | 'books' | 'reminders' | 'horoscope' | 'projects' | 'work_menu' | 'personal_menu' | 'documents' | 'idle';
  
  selectedGoalId?: number;
  selectedGoalName?: string;
  thuchiType?: 'thu' | 'chi';

  selectedMeetingTypeId?: number;
  selectedMeetingTypeName?: string;
  selectedMeetingDate?: string;
  selectedMeetingId?: number;

  selectedBookId?: number;
  selectedBookTitle?: string;

  selectedTaskType?: string;

  selectedContactId?: number;
  selectedRelativeId?: number;
  selectedField?: string;

  selectedVancungType?: string;
  selectedExpenseYear?: number;
  selectedProjectCode?: string;
  selectedActivityCode?: string;
  selectedExpenseId?: number;
  tempProjectCode?: string;
  tempActivityCode?: string;
  tempDocData?: {
    type: string;
    date?: string;
    service?: string;
    description?: string;
    deadline?: string;
    address?: string;
    phone?: string;
  };
}

type MyContext = Context & SessionFlavor<SessionData>;

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is not defined');
}

export const bot = new Bot<MyContext>(token || '');

// Initialize session with default value
bot.use(session({ initial: (): SessionData => ({ step: 'idle', context: 'idle' }) }));

// --- Keyboards ---
const MAIN_KEYBOARD = new Keyboard()
  .text('💼 Công việc').text('👤 Cá nhân').row()
  .text('❓ Trợ giúp')
  .resized();

const CONG_VIEC_KEYBOARD = new Keyboard()
  .text('🔍 Tìm nhân sự').text('📖 Danh bạ').row()
  .text('📝 Biên bản họp').text('📊 Kinh phí dự án').row()
  .text('📋 Mẫu văn bản').text('💡 Nhắc việc').row()
  .text('⬅️ Quay lại').row()
  .resized();

const CA_NHAN_KEYBOARD = new Keyboard()
  .text('🌳 Gia phả').text('💰 Thu chi').row()
  .text('📋 Lí lịch cá nhân').text('📚 Đọc sách').row()
  .text('📅 Xem ngày tốt').text('📜 Văn cúng').row()
  .text('⬅️ Quay lại')
  .resized();

const MAU_VAN_BAN_KEYBOARD = new Keyboard()
  .text('✉️ Thư mời chào giá').row()
  .text('⬅️ Quay lại')
  .resized();

const SEARCH_KEYBOARD = new Keyboard()
  .text('👤 Tìm theo tên').text('📅 Lọc năm sinh').row()
  .text('🎓 Lọc trình độ').text('💊 Lọc chuyên môn').row()
  .text('⬅️ Quay lại')
  .resized();

const DANHBA_KEYBOARD = new Keyboard()
  .text('🔍 Tìm liên lạc').text('➕ Thêm mới').row()
  .text('✏️ Sửa thông tin').text('⬅️ Quay lại').row()
  .resized();

const GIAPHA_KEYBOARD = new Keyboard()
  .text('🔍 Tìm thành viên').text('✏️ Sửa thông tin').row()
  .text('⬅️ Quay lại')
  .resized();

// Thu Chi Keyboards
const THUCHI_MAIN_KEYBOARD = new Keyboard()
  .text('➕ Nhập Thu Chi mục').row()
  .text('⚙️ Quản lý Đề mục').text('⬅️ Quay lại')
  .resized();

const THUCHI_GOAL_MGMT_KEYBOARD = new Keyboard()
  .text('➕ Tạo mục mới').text('⬅️ Quay lại')
  .resized();

const THUCHI_GOAL_DASHBOARD = new Keyboard()
  .text('📥 Thu tiền').text('📤 Chi tiền').row()
  .text('📊 Theo dõi').text('🔙 Chọn mục khác').row()
  .text('⬅️ Quay lại')
  .resized();

const THUCHI_REPORT_KEYBOARD = new Keyboard()
  .text('📒 Tổng quan').row()
  .text('📥 Danh sách Thu').text('📤 Danh sách Chi').row()
  .text('⬅️ Quay lại')
  .resized();

const THUCHI_TYPE_KEYBOARD = new Keyboard()
  .text('📥 Thu tiền').text('📤 Chi tiền').row()
  .text('⬅️ Quay lại')
  .resized();

const THUCHI_INPUT_LOOP_KEYBOARD = new Keyboard()
  .text('🔄 Đổi Thu/Chi').text('📊 Theo dõi').row()
  .text('⬅️ Quay lại')
  .resized();

// Meeting Keyboards
const MEETING_MAIN_KEYBOARD = new Keyboard()
  .text('📂 Chọn Loại hình').text('➕ Loại hình mới').row()
  .text('🔍 Tìm nội dung').text('⬅️ Quay lại')
  .resized();

const MEETING_DASHBOARD_KEYBOARD = new Keyboard()
  .text('📅 Chọn Tháng/Năm').text('➕ Thêm Tháng mới').row()
  .text('🔍 Tìm trong loại này').text('⬅️ Quay lại')
  .resized();

const MEETING_DATE_DASHBOARD_KEYBOARD = new Keyboard()
  .text('📋 Danh sách buổi họp').text('➕ Thêm buổi họp mới').row()
  .text('⬅️ Quay lại')
  .resized();

// Resume Keyboards
const RESUME_MAIN_KEYBOARD = new Keyboard()
  .text('🎓 Đào tạo & Bồi dưỡng').row()
  .text('🏆 Khen thưởng & Kỷ luật').row()
  .text('👨‍👩‍👧‍👦 Gia đình & Quan hệ').row()
  .text('⬅️ Quay lại')
  .resized();

const PROJECT_MAIN_KEYBOARD = new Keyboard()
  .text('➕ Thêm Dự án').text('⬅️ Quay lại')
  .resized();

const PROJECT_DETAIL_KEYBOARD = new Keyboard()
  .text('➕ Thêm Hoạt động').text('⬅️ Quay lại')
  .resized();

const ACTIVITY_DETAIL_KEYBOARD = new Keyboard()
  .text('➕ Thêm Dự toán').text('⬅️ Quay lại')
  .resized();

// Reminder Keyboards
const REMINDER_MAIN_KEYBOARD = new Keyboard()
  .text('📅 Hôm nay').text('🗓️ Tuần này').row()
  .text('🌙 Tháng này').text('➕ Thêm nhắc hẹn').row()
  .text('🔍 Tìm lịch').text('⬅️ Quay lại')
  .resized();

const HOROSCOPE_KEYBOARD = new InlineKeyboard()
  .text('🏗️ Làm/Sửa nhà', 'h_task:house').row()
  .text('🚪 Nhập trạch', 'h_task:moving').row()
  .text('🧧 Khai trương', 'h_task:opening').row()
  .text('💍 Đám cưới/Hỏi', 'h_task:wedding').row()
  .text('📝 Hợp đồng/Giao dịch', 'h_task:contract').row()
  .text('🏮 Cúng bái/Tế tự', 'h_task:worship').row();

// Văn cúng Keyboards
const VANCUNG_TYPE_KEYBOARD = new Keyboard()
  .text('🍱 Kỵ cơm').text('🍎 Cúng ông Táo').row()
  .text('🎇 Giao thừa').text('🎉 Tất niên').row()
  .text('👋 Tiễn ông bà').text('🍼 Đầy tháng').row()
  .text('🏛️ Nhà thờ').text('⬅️ Quay lại').row()
  .resized();

const VANCUNG_LOC_KEYBOARD = new Keyboard()
  .text('🏡 Ngoài sân').text('🏠 Trong nhà').row()
  .text('⬅️ Quay lại')
  .resized();

// Help text
const HELP_TEXT = `
🤖 **Trợ lý Tín Nguyễn sẵn sàng hỗ trợ!**

Hãy chọn tính năng từ menu bên dưới. Tôi sẽ giúp bạn quản lý Nhân sự, Danh bạ, Gia phả, Thu chi và Biên bản họp.
`;

// --- Helpers: Formatting ---
function formatVND(val: number) {
  return val.toLocaleString('vi-VN') + 'đ';
}

function formatPerson(p: any) {
  return `✅ **${p.full_name}**
📅 Ngày sinh: ${p.date_of_birth || 'Chưa rõ'}
🏢 Đơn vị: ${p.department || 'Chưa rõ'}
🎓 Trình độ: ${p.education_level || 'Chưa rõ'}
🧪 Chuyên ngành: ${p.specialization || 'Chưa rõ'}
📌 Chức danh: ${p.professional_title || 'Chưa rõ'}
🆔 Mã CDNN: \`${p.professional_code || 'N/A'}\`
`;
}

function formatContact(c: any) {
  return `👤 **${c.full_name}**
💼 Chức vụ: ${c.position || 'Chưa rõ'}
☎️ ĐT bàn: ${c.landline || 'Chưa rõ'}
📱 Di động: ${c.mobile || 'Chưa rõ'}
📅 Năm sinh: ${c.birth_year || 'Chưa rõ'}
`;
}

async function formatRelative(r: any) {
  let text = `🌳 **${r.full_name}** (Thế hệ ${r.generation})
📅 Sinh: ${r.birth_day || 'Không nhớ'}
🪦 Mất: ${r.death_day || '—'}
👩‍❤️‍👨 Bạn đời: ${r.spouse_name || '—'}
👫 Giới tính: ${r.gender || '—'}
`;
  const { data: children } = await supabase.from('giapha').select('full_name').eq('parent_id', r.id).order('order_index');
  if (children && children.length > 0) {
    text += `\n🌿 **Con cái:**\n` + children.map(c => `  └─ ${c.full_name}`).join('\n');
  }
  if (r.parent_id) {
    const { data: parent } = await supabase.from('giapha').select('full_name').eq('id', r.parent_id).single();
    if (parent) text += `\n\n👴 **Cha:** ${parent.full_name}`;
  }
  return text;
}

function generateInvitationToQuote(data: any) {
  return `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập – Tự do – Hạnh phúc

Hòa Cường, ngày ${data.date}

**THƯ MỜI**
**V/v mời chào giá cung cấp ${data.service}**

Kính gửi: Các đơn vị cung cấp dịch vụ ${data.service}.

Hiện nay, Trạm Y tế Phường Hòa Cường có nhu cầu lựa chọn đơn vị cung cấp ${data.description} phục vụ hoạt động tại đơn vị.
Để có cơ sở mua sắm, Trạm Y tế Phường Hòa Cường kính mời các đơn vị quan tâm, có đầy đủ tư cách pháp nhân, đủ điều kiện theo quy định của pháp luật tham gia chào giá với nội dung như sau:

Đơn vị cung cấp Bảng báo giá theo mẫu tại Phụ lục đính kèm. Người ký báo giá phải là người đại diện theo pháp luật hoặc người được ủy quyền (kèm giấy ủy quyền).
Báo giá phải được bỏ vào phong bì, niêm phong kín ở miệng bao bằng dấu của đơn vị tham gia báo giá để bảo mật và tạo sự khách quan trong việc mời báo giá, bên ngoài phong bì phải ghi rõ nội dung là CHÀO GIÁ THEO THƯ MỜI SỐ ………/TM-TYT để tiện theo dõi.
Thời gian nộp: Hạn cuối lúc ${data.deadline}.
Các báo giá nhận được sau thời điểm trên sẽ không được xem xét.

Nơi nhận: Khoa Dân số - Trạm Y tế Phường Hòa Cường.
Địa chỉ: ${data.address}.
Số điện thoại liên hệ: ${data.phone} (vào giờ hành chính).

Rất mong sự hồi đáp của Quý đơn vị.
Xin chân thành cảm ơn.`;
}

// --- Logic Handlers ---
async function executeGiaphaSearch(ctx: MyContext, value: string) {
  const { data, error } = await supabase.from('giapha').select('*').ilike('full_name', `%${value}%`).limit(5);
  if (error) return ctx.reply('❌ Lỗi: ' + error.message);
  if (!data || data.length === 0) return ctx.reply(`¯\\_(ツ)_/¯ Không tìm thấy khớp với "${value}".`);
  for (const relative of data) {
    const formatted = await formatRelative(relative);
    await ctx.reply(formatted, { parse_mode: 'Markdown' });
  }
}

async function executeSearch(ctx: MyContext, column: string, value: string, title: string) {
  let query = supabase.from('nhansu').select('*');
  if (column === 'date_of_birth') {
    const v = value.trim();
    if (/^\d{4}$/.test(v)) query = query.gte('date_of_birth', `${v}-01-01`).lte('date_of_birth', `${v}-12-31`);
    else if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
        const [d, m, y] = v.split('/');
        query = query.eq('date_of_birth', `${y}-${m}-${d}`);
    } else query = query.eq('date_of_birth', value);
  } else query = query.ilike(column, `%${value}%`);

  const { data, error } = await query.limit(10);
  if (error) return ctx.reply('❌ Lỗi tra cứu: ' + error.message);
  if (!data || data.length === 0) return ctx.reply(`¯\\_(ツ)_/¯ Không tìm thấy khớp với "${value}".`);

  let response = `📊 **Kết quả ${title} cho "${value}":**\n\n` + data.map(p => formatPerson(p)).join('\n---\n\n');
  if (data.length === 10) response += `\n*Lưu ý: Chỉ hiển thị 10 kết quả đầu tiên.*`;
  
  ctx.session.step = 'idle'; // Reset step after search
  return ctx.reply(response, { parse_mode: 'Markdown', reply_markup: SEARCH_KEYBOARD });
}

// --- Main Bot Listener ---
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text;

  // Basic Navigation
  if (text === '/start') {
    ctx.session.step = 'idle'; ctx.session.context = 'idle';
    return ctx.reply(`Chào mừng bạn! 🤖\n${HELP_TEXT}`, { parse_mode: 'Markdown', reply_markup: MAIN_KEYBOARD });
  }

  if (text === '🔍 Tìm nhân sự') {
    ctx.session.step = 'idle'; ctx.session.context = 'nhansu';
    return ctx.reply('📂 **Tìm kiếm nhân sự** tiêu chí nào?', { parse_mode: 'Markdown', reply_markup: SEARCH_KEYBOARD });
  }

  if (text === '📖 Danh bạ') {
    ctx.session.step = 'idle'; ctx.session.context = 'danhba';
    return ctx.reply('📖 **Danh bạ phối hợp** thao tác nào?', { parse_mode: 'Markdown', reply_markup: DANHBA_KEYBOARD });
  }

  if (text === '🌳 Gia phả') {
    ctx.session.step = 'idle'; ctx.session.context = 'giapha';
    return ctx.reply('🌳 **Gia phả dòng họ** hành động nào?', { parse_mode: 'Markdown', reply_markup: GIAPHA_KEYBOARD });
  }

  if (text === '💼 Công việc') {
    ctx.session.context = 'work_menu';
    return ctx.reply('💼 **DANH MỤC CÔNG VIỆC**\nChọn tính năng bạn cần:', { reply_markup: CONG_VIEC_KEYBOARD });
  }

  if (text === '👤 Cá nhân') {
    ctx.session.context = 'personal_menu';
    return ctx.reply('👤 **DANH MỤC CÁ NHÂN**\nChọn tính năng bạn cần:', { reply_markup: CA_NHAN_KEYBOARD });
  }

  // --- Nhân sự Handlers ---
  if (text === '🔍 Tìm nhân sự' && (ctx.session.context === 'work_menu' || ctx.session.context === 'nhansu')) {
    ctx.session.context = 'nhansu';
    return ctx.reply('🔍 **TÌM KIẾM NHÂN SỰ**\nBạn muốn tìm kiếm theo tiêu chí nào?', { reply_markup: SEARCH_KEYBOARD });
  }

  if (text === '👤 Tìm theo tên' && ctx.session.context === 'nhansu') {
    ctx.session.step = 'waiting_for_name';
    return ctx.reply('🔍 Nhập **Họ và tên** nhân sự cần tìm:', { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
  }

  if (text === '📅 Lọc năm sinh' && ctx.session.context === 'nhansu') {
    ctx.session.step = 'waiting_for_year';
    return ctx.reply('🔍 Nhập **Năm sinh** cần lọc (ví dụ: 1985):', { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
  }

  if (text === '🎓 Lọc trình độ' && ctx.session.context === 'nhansu') {
    ctx.session.step = 'waiting_for_education';
    return ctx.reply('🔍 Nhập **Trình độ đào tạo** cần tìm (ví dụ: Đại học):', { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
  }

  if (text === '💊 Lọc chuyên môn' && ctx.session.context === 'nhansu') {
    ctx.session.step = 'waiting_for_specialty';
    return ctx.reply('🔍 Nhập **Chuyên môn/Chuyên ngành** cần tìm:', { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
  }

  // --- Danh bạ Handlers ---
  if (text === '📖 Danh bạ' && (ctx.session.context === 'work_menu' || ctx.session.context === 'danhba')) {
    ctx.session.context = 'danhba';
    return ctx.reply('📖 **DANH BẠ LIÊN LẠC**\nChọn thao tác:', { reply_markup: DANHBA_KEYBOARD });
  }

  if (text === '🔍 Tìm liên lạc' && ctx.session.context === 'danhba') {
    ctx.session.step = 'waiting_for_contact_search';
    return ctx.reply('🔍 Nhập **tên** hoặc **chức vụ** liên lạc cần tìm:', { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
  }

  if (text === '➕ Thêm mới' && ctx.session.context === 'danhba') {
    ctx.session.step = 'waiting_for_new_contact_data';
    return ctx.reply('📝 **NHẬP LIÊN LẠC MỚI**\nHãy nhập theo định dạng:\n`Họ tên, Chức vụ, Di động, ĐT bàn, Năm sinh`\n\n✅ Ví dụ: `Nguyễn Văn A, Trưởng phòng, 0905123456, 02363123456, 1980`', { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
  }

  if (text === '✏️ Sửa thông tin' && ctx.session.context === 'danhba') {
    ctx.session.step = 'waiting_for_edit_contact_search';
    return ctx.reply('🔍 Nhập tên liên lạc bạn muốn **Sửa thông tin**:');
  }

  // --- Gia phả Handlers ---
  if (text === '🌳 Gia phả' && (ctx.session.context === 'personal_menu' || ctx.session.context === 'giapha')) {
    ctx.session.context = 'giapha';
    return ctx.reply('🌳 **QUẢN LÝ GIA PHẢ**\nChọn thao tác:', { reply_markup: GIAPHA_KEYBOARD });
  }

  if (text === '🔍 Tìm thành viên' && ctx.session.context === 'giapha') {
    ctx.session.step = 'waiting_for_genealogy_search';
    return ctx.reply('🔍 Nhập tên thành viên gia tộc cần tìm:', { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
  }

  if (text === '✏️ Sửa thông tin' && ctx.session.context === 'giapha') {
    ctx.session.step = 'waiting_for_edit_giapha_search';
    return ctx.reply('🔍 Nhập tên thành viên bạn muốn **Cập nhật thông tin**:');
  }

  if (text === '💰 Thu chi' && (ctx.session.context === 'personal_menu' || ctx.session.context === 'thuchi')) {
    ctx.session.step = 'thuchi_main'; ctx.session.context = 'thuchi';
    return ctx.reply('💰 **QUẢN LÝ THU CHI**\nChọn thao tác bạn muốn thực hiện:', { parse_mode: 'Markdown', reply_markup: THUCHI_MAIN_KEYBOARD });
  }

  if (text === '📝 Biên bản họp' && (ctx.session.context === 'work_menu' || ctx.session.context === 'meetings')) {
    ctx.session.step = 'idle';
    ctx.session.context = 'meetings';
    return ctx.reply('📝 **BIÊN BẢN HỌP**\nChọn loại hình hoặc tạo mới:', {
      parse_mode: 'Markdown', reply_markup: MEETING_MAIN_KEYBOARD
    });
  }

  if (text === '📋 Lí lịch cá nhân' && (ctx.session.context === 'personal_menu' || ctx.session.context === 'idle')) {
    ctx.session.step = 'idle';
    ctx.session.context = 'idle'; // Generic context for viewing
    return ctx.reply('📋 **LÍ LỊCH CÁ NHÂN**\nChọn thông tin cần xem:', {
      parse_mode: 'Markdown', reply_markup: RESUME_MAIN_KEYBOARD
    });
  }

  if (text === '📚 Đọc sách' && (ctx.session.context === 'personal_menu' || ctx.session.context === 'books')) {
    ctx.session.step = 'idle';
    ctx.session.context = 'books';
    const { data: books } = await supabase.from('books').select('*').order('title');
    if (!books || books.length === 0) return ctx.reply('Thư viện đang trống. Hãy nhập sách từ tệp Markdown.');
    
    const keyboard = new InlineKeyboard();
    books.forEach(b => keyboard.text(b.title, `sel_book:${b.id}`).row());
    return ctx.reply('📚 **THƯ VIỆN SÁCH**\nChọn sách bạn muốn đọc:', { reply_markup: keyboard });
  }

  if (text === '💡 Nhắc việc' && (ctx.session.context === 'work_menu' || ctx.session.context === 'reminders')) {
    ctx.session.step = 'idle';
    ctx.session.context = 'reminders';
    return ctx.reply('💡 **TRỢ LÝ NHẮC VIỆC**\nTôi có thể giúp gì cho lịch trình của bạn hôm nay?', { reply_markup: REMINDER_MAIN_KEYBOARD });
  }

  if (text === '📅 Xem ngày tốt' && (ctx.session.context === 'personal_menu' || ctx.session.context === 'horoscope')) {
    ctx.session.step = 'idle';
    ctx.session.context = 'horoscope';
    return ctx.reply('📅 **XEM NGÀY LÀNH THÁNG TỐT**\nChọn loại công việc bạn muốn xem ngày:', { reply_markup: HOROSCOPE_KEYBOARD });
  }

  if (text === '📜 Văn cúng' && (ctx.session.context === 'personal_menu' || ctx.session.context === 'idle')) {
    ctx.session.step = 'waiting_for_vancung_type';
    ctx.session.context = 'idle';
    return ctx.reply('📜 **TRỢ LÝ VĂN CÚNG TÂM LINH**\nChọn loại nghi lễ bạn thực hiện:', { reply_markup: VANCUNG_TYPE_KEYBOARD });
  }

  if (text === '📊 Kinh phí dự án' && (ctx.session.context === 'work_menu' || ctx.session.context === 'projects')) {
    ctx.session.step = 'waiting_for_expense_year';
    ctx.session.context = 'projects';
    return ctx.reply('📊 **QUẢN LÝ KINH PHÍ DỰ ÁN**\nVui lòng nhập năm ngân sách bạn muốn tra cứu (ví dụ: 2025):', {
        reply_markup: new Keyboard().text('2025').text('2026').row().text('⬅️ Quay lại').resized()
    });
  }

  if (text === '➕ Thêm Dự án' && ctx.session.context === 'projects') {
    ctx.session.step = 'waiting_for_new_project_code';
    return ctx.reply('🆕 **THÊM DỰ ÁN MỚI**\nNhập **Mã dự án** (ví dụ: DUAN1):', { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
  }

  if (text === '➕ Thêm Hoạt động' && ctx.session.context === 'projects' && ctx.session.selectedProjectCode) {
    ctx.session.step = 'waiting_for_new_activity_code';
    return ctx.reply(`🆕 **DỰ ÁN ${ctx.session.selectedProjectCode}**\nNhập **Mã hoạt động** mới (ví dụ: HD1):`, { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
  }

  if (text === '📋 Mẫu văn bản' && (ctx.session.context === 'work_menu' || ctx.session.context === 'documents')) {
    ctx.session.step = 'idle';
    ctx.session.context = 'documents';
    return ctx.reply('📋 **DANH MỤC MẪU VĂN BẢN**\nChọn mẫu bạn cần soạn thảo:', { reply_markup: MAU_VAN_BAN_KEYBOARD });
  }

  if (text === '✉️ Thư mời chào giá' && ctx.session.context === 'documents') {
    ctx.session.step = 'waiting_for_doc_date';
    ctx.session.tempDocData = { type: 'thu_moi_chao_gia' };
    const today = new Date();
    const dateStr = `${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
    return ctx.reply('✉️ **THƯ MỜI CHÀO GIÁ**\n\nBước 1: Nhập **Ngày soạn** thư mời (Ví dụ: 12 tháng 12 năm 2025):', { 
      reply_markup: new Keyboard().text(dateStr).row().text('⬅️ Quay lại').resized() 
    });
  }

  if (text === '➕ Thêm Dự toán' && ctx.session.context === 'projects' && ctx.session.selectedActivityCode) {
    ctx.session.step = 'waiting_for_new_expense_data';
    return ctx.reply('🆕 **THÊM DỰ TOÁN CHI TIẾT**\nNhập theo định dạng:\n`Mã Task, Số lượng, Đơn giá`\n\n✅ Ví dụ: `BCV, 13, 500`\n_(Mã Task có thể là BCV, NU, ...)_', { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
  }

  if (text === '🔍 Tìm nội dung' && ctx.session.context === 'meetings') {
    ctx.session.step = 'waiting_for_meeting_search';
    return ctx.reply('🔍 Nhập từ khóa bạn muốn tìm (Tìm trong tất cả loại hình & tiêu đề):');
  }

  if (text === '🔍 Tìm trong loại này' && ctx.session.context === 'meetings') {
    ctx.session.step = 'waiting_for_meeting_search_local';
    return ctx.reply(`🔍 Nhập từ khóa tìm kiếm TRONG **${ctx.session.selectedMeetingTypeName}**:`);
  }

  if (text === '⬅️ Quay lại') {
    // Hierarchical Navigation Logic
    const workGroup = ['nhansu', 'danhba', 'meetings', 'projects', 'reminders', 'documents'];
    const personalGroup = ['giapha', 'thuchi', 'books', 'horoscope'];

    if (ctx.session.context === 'thuchi' && ctx.session.selectedGoalId) {
        if (ctx.session.step === 'thuchi_main' || ctx.session.step === 'selecting_goal_for_input' || ctx.session.step === 'idle') {
             ctx.session.selectedGoalId = undefined; ctx.session.selectedGoalName = undefined; ctx.session.step = 'thuchi_main';
             return ctx.reply('💰 **QUẢN LÝ THU CHI**\nChọn thao tác bạn muốn thực hiện:', { reply_markup: THUCHI_MAIN_KEYBOARD });
        }
        ctx.session.step = 'idle';
        return ctx.reply(`📂 **${ctx.session.selectedGoalName}**\nBạn muốn làm gì với đề mục này?`, { reply_markup: THUCHI_GOAL_DASHBOARD });
    }
    if (ctx.session.context === 'meetings') {
      if (ctx.session.selectedMeetingId) { ctx.session.selectedMeetingId = undefined; ctx.session.step = 'idle'; return ctx.reply(`📅 **Tháng ${ctx.session.selectedMeetingDate}**:\nChọn thao tác:`, { reply_markup: MEETING_DATE_DASHBOARD_KEYBOARD }); }
      if (ctx.session.selectedMeetingDate) { ctx.session.selectedMeetingDate = undefined; ctx.session.step = 'idle'; return ctx.reply(`📂 **${ctx.session.selectedMeetingTypeName}**:\nChọn thời gian:`, { reply_markup: MEETING_DASHBOARD_KEYBOARD }); }
      if (ctx.session.selectedMeetingTypeId) { ctx.session.selectedMeetingTypeId = undefined; ctx.session.selectedMeetingTypeName = undefined; ctx.session.step = 'idle'; return ctx.reply('📝 **BIÊN BẢN HỌP**\nChọn loại hình:', { reply_markup: MEETING_MAIN_KEYBOARD }); }
    }
    if (ctx.session.context === 'books' && ctx.session.selectedBookId) {
       if (ctx.session.step === 'reading_book_section') {
           ctx.session.step = 'idle';
           const { data: sections } = await supabase.from('book_sections').select('id, title').eq('book_id', ctx.session.selectedBookId).order('order_index');
           const keyboard = new InlineKeyboard();
           sections?.forEach(s => keyboard.text(s.title, `sel_bsec:${s.id}`).row());
           return ctx.reply(`📖 **${ctx.session.selectedBookTitle}**\n\nChọn chương/mục để đọc tiếp:`, { reply_markup: keyboard });
       }
       ctx.session.selectedBookId = undefined; ctx.session.selectedBookTitle = undefined; ctx.session.step = 'idle';
       const { data: books } = await supabase.from('books').select('*').order('title');
       const keyboard = new InlineKeyboard();
       books?.forEach(b => keyboard.text(b.title, `sel_book:${b.id}`).row());
       return ctx.reply('📚 **THƯ VIỆN SÁCH**\nChọn sách bạn muốn đọc:', { reply_markup: keyboard });
    }

    // Level 2 -> Level 1
    if (ctx.session.context === 'projects') {
       if (ctx.session.selectedExpenseId) { ctx.session.selectedExpenseId = undefined; ctx.session.step = 'idle'; return ctx.reply(`📂 **Hoạt động ${ctx.session.selectedActivityCode}**`, { reply_markup: ACTIVITY_DETAIL_KEYBOARD }); }
       if (ctx.session.selectedActivityCode) { ctx.session.selectedActivityCode = undefined; ctx.session.step = 'idle'; return ctx.reply(`📂 **Dự án ${ctx.session.selectedProjectCode}**`, { reply_markup: PROJECT_DETAIL_KEYBOARD }); }
       if (ctx.session.selectedProjectCode) { ctx.session.selectedProjectCode = undefined; ctx.session.step = 'idle'; return ctx.reply(`📊 **KINH PHÍ NĂM ${ctx.session.selectedExpenseYear}**`, { reply_markup: PROJECT_MAIN_KEYBOARD }); }
    }
    if (workGroup.includes(ctx.session.context)) {
      ctx.session.context = 'work_menu'; ctx.session.step = 'idle';
      if (ctx.session.tempDocData) delete ctx.session.tempDocData;
      return ctx.reply('💼 **DANH MỤC CÔNG VIỆC**', { reply_markup: CONG_VIEC_KEYBOARD });
    }
    if (personalGroup.includes(ctx.session.context)) {
      ctx.session.context = 'personal_menu'; ctx.session.step = 'idle';
      return ctx.reply('👤 **DANH MỤC CÁ NHÂN**', { reply_markup: CA_NHAN_KEYBOARD });
    }

    // Level 1 -> Root
    ctx.session.step = 'idle'; ctx.session.context = 'idle';
    return ctx.reply('🏠 **MENU CHÍNH**', { reply_markup: MAIN_KEYBOARD });
  }

  // --- Meetings Flow ---
  if (text === '📂 Chọn Loại hình' && ctx.session.context === 'meetings') {
    const { data: types } = await supabase.from('meeting_types').select('*').order('name');
    if (!types || types.length === 0) return ctx.reply('Chưa có loại hình nào. Hãy chọn **➕ Loại hình mới**.');
    const keyboard = new InlineKeyboard();
    types.forEach(t => keyboard.text(t.name, `sel_mtype:${t.id}:${t.name}`).row());
    return ctx.reply('Chọn **Loại hình họp**:', { reply_markup: keyboard });
  }

  if (text === '➕ Loại hình mới' && ctx.session.context === 'meetings') {
    ctx.session.step = 'waiting_for_meeting_type_name';
    return ctx.reply('Gõ tên Loại hình họp mới (ví dụ: Họp cơ quan...):', { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
  }

  if (text === '📅 Chọn Tháng/Năm' && ctx.session.context === 'meetings') {
    const { data: months } = await supabase.from('meetings').select('date_str').eq('type_id', ctx.session.selectedMeetingTypeId).order('year', { ascending: false }).order('month', { ascending: false });
    const uniqueMonths = Array.from(new Set(months?.map(m => m.date_str) || []));
    if (uniqueMonths.length === 0) return ctx.reply('Chưa có dữ liệu theo tháng. Hãy chọn **➕ Thêm Tháng mới**.');
    const keyboard = new InlineKeyboard();
    uniqueMonths.forEach(m => keyboard.text(m, `sel_mdate:${m}`).row());
    return ctx.reply('Chọn **Tháng/Năm**:', { reply_markup: keyboard });
  }

  if (text === '➕ Thêm Tháng mới' && ctx.session.context === 'meetings') {
    ctx.session.step = 'waiting_for_meeting_date';
    return ctx.reply('Nhập Tháng/Năm (định dạng MM/YYYY, ví dụ: 04/2026):', { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
  }

  if (text === '📋 Danh sách buổi họp' && ctx.session.context === 'meetings') {
    const { data: meetings } = await supabase.from('meetings').select('*').eq('type_id', ctx.session.selectedMeetingTypeId).eq('date_str', ctx.session.selectedMeetingDate).order('created_at', { ascending: true });
    if (!meetings || meetings.length === 0) return ctx.reply('Chưa có buổi họp nào trong tháng này.');
    const keyboard = new InlineKeyboard();
    meetings.forEach(m => keyboard.text(m.title, `sel_mid:${m.id}`).row());
    return ctx.reply(`📋 Các buổi họp trong tháng **${ctx.session.selectedMeetingDate}**:`, { reply_markup: keyboard });
  }

  if (text === '➕ Thêm buổi họp mới' && ctx.session.context === 'meetings') {
    ctx.session.step = 'waiting_for_meeting_title';
    return ctx.reply('Nhập Tiêu đề cuộc họp (ví dụ: Kết nạp đảng viên mới...):', { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
  }

  // --- Thu Chi Flow ---
  if (text === '➕ Nhập Thu Chi mục' && ctx.session.context === 'thuchi') {
    const { data: goals } = await supabase.from('thuchi_goals').select('*').order('name');
    if (!goals || goals.length === 0) return ctx.reply('Chưa có Đề mục nào. Hãy vào **⚙️ Quản lý Đề mục** để tạo mới.');
    ctx.session.step = 'selecting_goal_for_input';
    const keyboard = new InlineKeyboard();
    goals.forEach(g => keyboard.text(g.name, `sel_goal_any:${g.id}:${g.name}`).row());
    return ctx.reply('Chọn Đề mục (Quỹ) để bắt đầu nhập liệu:', { reply_markup: keyboard });
  }

  if (text === '⚙️ Quản lý Đề mục' && ctx.session.context === 'thuchi') {
    return ctx.reply('⚙️ **QUẢN LÝ ĐỀ MỤC**\nTại đây bạn có thể thêm các quỹ mới:', { reply_markup: THUCHI_GOAL_MGMT_KEYBOARD });
  }

  if (text === '📊 Theo dõi' && ctx.session.context === 'thuchi') {
    if (!ctx.session.selectedGoalId) return ctx.reply('Bạn chưa chọn Đề mục.');
    return ctx.reply(`📊 **BÁO CÁO: ${ctx.session.selectedGoalName}**\nChọn thông tin cần xem:`, { reply_markup: THUCHI_REPORT_KEYBOARD });
  }

  if (text === '➕ Tạo mục mới' && ctx.session.context === 'thuchi') {
    ctx.session.step = 'waiting_for_thuchi_goal_name';
    return ctx.reply('Gõ tên Đề mục mới:', { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
  }

  if (text === '🔙 Chọn mục khác' && ctx.session.context === 'thuchi') {
      const { data: goals } = await supabase.from('thuchi_goals').select('*').order('name');
      const keyboard = new InlineKeyboard();
      goals?.forEach(g => keyboard.text(g.name, `sel_goal_any:${g.id}:${g.name}`).row());
      return ctx.reply('Chọn Đề mục khác:', { reply_markup: keyboard });
  }

  if (text === '📒 Tổng quan' && ctx.session.context === 'thuchi') {
    const goalId = ctx.session.selectedGoalId;
    if (!goalId) return ctx.reply('Vui lòng chọn đề mục trước.');
    const { data } = await supabase.from('thuchi').select('type, amount').eq('goal_id', goalId);
    const totalThu = data?.filter(i => i.type === 'thu').reduce((sum, i) => sum + Number(i.amount), 0) || 0;
    const totalChi = data?.filter(i => i.type === 'chi').reduce((sum, i) => sum + Number(i.amount), 0) || 0;
    const balance = totalThu - totalChi;
    return ctx.reply(`📊 **BÁO CÁO: ${ctx.session.selectedGoalName}**\n\n📥 Tổng Thu: \`${formatVND(totalThu)}\`\n📤 Tổng Chi: \`${formatVND(totalChi)}\`\n------------------\n💰 **Số dư: ${formatVND(balance)}**`, { parse_mode: 'Markdown', reply_markup: THUCHI_REPORT_KEYBOARD });
  }

  if (text === '📥 Danh sách Thu' && ctx.session.context === 'thuchi') {
    const goalId = ctx.session.selectedGoalId;
    const { data } = await supabase.from('thuchi').select('*').eq('type', 'thu').eq('goal_id', goalId).order('entry_order', { ascending: true });
    if (!data || data.length === 0) return ctx.reply('Chưa có khoản thu.');
    const list = data.map(i => `🔹 #${i.entry_order}: ${formatVND(Number(i.amount))} - ${i.description || ''}`).join('\n');
    return ctx.reply(`📥 **THU - ${ctx.session.selectedGoalName}:**\n\n${list}`, { reply_markup: THUCHI_REPORT_KEYBOARD });
  }

  if (text === '📤 Danh sách Chi' && ctx.session.context === 'thuchi') {
    const goalId = ctx.session.selectedGoalId;
    const { data } = await supabase.from('thuchi').select('*').eq('type', 'chi').eq('goal_id', goalId).order('entry_order', { ascending: true });
    if (!data || data.length === 0) return ctx.reply('Chưa có khoản chi.');
    const list = data.map(i => `🔸 #${i.entry_order}: ${formatVND(Number(i.amount))} - ${i.description || ''}`).join('\n');
    return ctx.reply(`📤 **CHI - ${ctx.session.selectedGoalName}:**\n\n${list}`, { reply_markup: THUCHI_REPORT_KEYBOARD });
  }

  if (text === '📥 Thu tiền' && (ctx.session.step === 'waiting_for_thuchi_type' || ctx.session.context === 'thuchi')) {
    const goalId = ctx.session.selectedGoalId; if (!goalId) return ctx.reply('Chưa chọn đề mục.');
    ctx.session.thuchiType = 'thu'; const { count } = await supabase.from('thuchi').select('*', { count: 'exact', head: true }).eq('type', 'thu').eq('goal_id', goalId);
    ctx.session.step = 'waiting_for_thuchi_amount'; return ctx.reply(`💰 **${ctx.session.selectedGoalName}**\nNhập khoản **THU** mục số ${ (count || 0) + 1 }:\n_(Số tiền, Nội dung)_`, { parse_mode: 'Markdown', reply_markup: THUCHI_INPUT_LOOP_KEYBOARD });
  }

  if (text === '📤 Chi tiền' && (ctx.session.step === 'waiting_for_thuchi_type' || ctx.session.context === 'thuchi')) {
    const goalId = ctx.session.selectedGoalId; if (!goalId) return ctx.reply('Chưa chọn đề mục.');
    ctx.session.thuchiType = 'chi'; const { count } = await supabase.from('thuchi').select('*', { count: 'exact', head: true }).eq('type', 'chi').eq('goal_id', goalId);
    ctx.session.step = 'waiting_for_thuchi_amount'; return ctx.reply(`💸 **${ctx.session.selectedGoalName}**\nNhập khoản **CHI** mục số ${ (count || 0) + 1 }:\n_(Số tiền, Nội dung)_`, { parse_mode: 'Markdown', reply_markup: THUCHI_INPUT_LOOP_KEYBOARD });
  }

  if (text === '🔄 Đổi Thu/Chi' && ctx.session.step === 'waiting_for_thuchi_amount') {
    ctx.session.step = 'waiting_for_thuchi_type'; return ctx.reply(`Đang ở: **${ctx.session.selectedGoalName}**\nBạn muốn sang nhập gì?`, { reply_markup: THUCHI_TYPE_KEYBOARD });
  }

  // --- Resume Flow ---
  if (text === '🎓 Đào tạo & Bồi dưỡng') {
    const { data: training } = await supabase.from('resume_training').select('*').order('id');
    const { data: education } = await supabase.from('resume_education').select('*').order('id');
    
    let resp = `🎓 **A. ĐÀO TẠO**\n\n` + (training?.map(t => `🔹 **${t.school}** (${t.period})\n- Chuyên ngành: ${t.specialty}\n- Hệ: ${t.mode}\n- Văn bằng: ${t.degree}`).join('\n\n') || '_Chưa có dữ liệu_');
    resp += `\n\n🧪 **B. BỒI DƯỠNG**\n\n` + (education?.map(e => `🔸 **${e.center}** (${e.period})\n- Nội dung: ${e.content}\n- Hệ: ${e.mode}\n- Chứng chỉ: ${e.certificate}`).join('\n\n') || '_Chưa có dữ liệu_');
    return ctx.reply(resp, { parse_mode: 'Markdown' });
  }

  if (text === '🏆 Khen thưởng & Kỷ luật') {
    const { data: rewards } = await supabase.from('resume_rewards').select('*').order('id');
    const { data: discipline } = await supabase.from('resume_discipline').select('*').order('id');
    
    let resp = `🏆 **A. KHEN THƯỞNG**\n\n` + (rewards?.map(r => `✅ **${r.date_str}**: ${r.content}\n- Cấp: ${r.authority}`).join('\n\n') || '_Chưa có dữ liệu_');
    resp += `\n\n⚠️ **B. KỶ LUẬT**\n\n` + (discipline?.map(d => `❌ **${d.date_str}**: ${d.reason}\n- Hình thức: ${d.form}\n- Cấp: ${d.authority}`).join('\n\n') || '_Chưa có dữ liệu_');
    return ctx.reply(resp, { parse_mode: 'Markdown' });
  }

  if (text === '👨‍👩‍👧‍👦 Gia đình & Quan hệ') {
    const { data: family } = await supabase.from('resume_family').select('*').order('id');
    if (!family || family.length === 0) return ctx.reply('Chưa có dữ liệu gia đình.');
    
    const groups = ['Bản thân/Vợ/Con', 'Nội/Ngoại', 'Cô/Dì/Chú/Bác', 'Bên vợ'];
    let resp = `👨‍👩‍👧‍👦 **QUAN HỆ GIA ĐÌNH**\n\n`;
    
    for (const group of groups) {
      const members = family.filter(f => f.group_type === group);
      if (members.length > 0) {
        resp += `📍 **${group}:**\n` + members.map(m => `👤 ${m.relationship}: **${m.full_name}** (${m.birth_year || '?'})\n- Nghề: ${m.occupation || '-'}\n- Chi tiết: ${m.details || '-'}`).join('\n\n') + '\n\n';
      }
    }
    return ctx.reply(resp, { parse_mode: 'Markdown' });
  }

  // --- Reminder Flow ---
  if (ctx.session.context === 'reminders') {
    if (text === '➕ Thêm nhắc hẹn') {
      ctx.session.step = 'waiting_for_reminder_input';
      return ctx.reply('📝 **HƯỚNG DẪN THÊM LỊCH**\nNhập theo định dạng:\n`Giờ, Ngày/Tháng/Năm, Nội dung`\n\n💡 **Mẹo**: Để nhập **Lịch Âm**, hãy thêm chữ `âm` vào sau ngày.\n\n✅ Ví dụ Dương lịch: `16h30, 11/04/2026, Tiệc nhà mới`\n✅ Ví dụ Âm lịch: `10h, 10/03/2026 âm, Giỗ nhà thờ`', { parse_mode: 'Markdown', reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
    }

    if (text === '🔍 Tìm lịch') {
      ctx.session.step = 'waiting_for_reminder_search';
      return ctx.reply('🔍 Nhập từ khóa bạn muốn tìm (ví dụ: nhà mới):');
    }

    if (['📅 Hôm nay', '🗓️ Tuần này', '🌙 Tháng này'].includes(text)) {
      const now = new Date();
      let start = new Date(now.setHours(0, 0, 0, 0));
      let end = new Date(now.setHours(23, 59, 59, 999));
      let title = 'Hôm nay';

      if (text === '🗓️ Tuần này') {
        title = 'Tuần này';
        const day = now.getDay() || 7; 
        start = new Date(now.setDate(now.getDate() - day + 1));
        start.setHours(0,0,0,0);
        end = new Date(now.setDate(start.getDate() + 6));
        end.setHours(23,59,59,999);
      } else if (text === '🌙 Tháng này') {
        title = 'Tháng này';
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      const { data: list } = await supabase.from('reminders')
        .select('*')
        .gte('event_time', start.toISOString())
        .lte('event_time', end.toISOString())
        .order('event_time');

      if (!list || list.length === 0) return ctx.reply(`📭 Lịch trình **${title}** đang trống.`);

      const resp = list.map(item => {
        const eventTime = new Date(item.event_time);
        
        // Normalize dates to midnight for accurate calendar day difference
        const now = new Date();
        const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const d2 = new Date(eventTime.getFullYear(), eventTime.getMonth(), eventTime.getDate());
        const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));

        let relative = '';
        if (diff === 0) relative = '(Hôm nay)';
        else if (diff === 1) relative = '(Ngày mai)';
        else if (diff > 1) relative = `(${diff} ngày nữa)`;
        else if (diff < 0) relative = `(Đã qua ${Math.abs(diff)} ngày)`;

        const timeStr = `${eventTime.getHours().toString().padStart(2, '0')}h${eventTime.getMinutes().toString().padStart(2, '0')}, ${eventTime.getDate()}/${eventTime.getMonth() + 1}`;
        return `⏰ **${timeStr}**: ${item.title} ${relative}`;
      }).join('\n');

      return ctx.reply(`🗓️ **LỊCH HẸN ${title.toUpperCase()}:**\n\n${resp}`, { parse_mode: 'Markdown' });
    }
  }

  // --- State Specific Processing ---
  const step = ctx.session.step;
  if (step !== 'idle') {
    if (step === 'waiting_for_meeting_type_name') {
      const { data, error } = await supabase.from('meeting_types').insert({ name: text }).select().single();
      if (error) return ctx.reply('❌ Lỗi: ' + error.message);
      ctx.session.selectedMeetingTypeId = data.id; ctx.session.selectedMeetingTypeName = data.name; ctx.session.step = 'idle';
      return ctx.reply(`✅ Đã tạo Loại hình **${data.name}**!`, { reply_markup: MEETING_DASHBOARD_KEYBOARD });
    }

    if (step === 'waiting_for_doc_date') {
      ctx.session.tempDocData!.date = text;
      ctx.session.step = 'waiting_for_doc_service';
      return ctx.reply('Bước 2: Nhập **Tên dịch vụ** cần mời chào giá:\nví dụ: `dịch vụ tuyên truyền (xe cổ động, pano, cờ nheo, cờ phướn)`', { 
        reply_markup: new Keyboard().text('dịch vụ tuyên truyền (xe cổ động, pano, cờ nheo, cờ phướn)').row().text('⬅️ Quay lại').resized() 
      });
    }

    if (step === 'waiting_for_doc_service') {
      ctx.session.tempDocData!.service = text;
      ctx.session.step = 'waiting_for_doc_desc';
      return ctx.reply('Bước 3: Nhập **Mô tả ngắn gọn** về nhu cầu:\nví dụ: `phục vụ hoạt động tại đơn vị`', { 
        reply_markup: new Keyboard().text('phục vụ hoạt động tại đơn vị').row().text('⬅️ Quay lại').resized() 
      });
    }

    if (step === 'waiting_for_doc_desc') {
      ctx.session.tempDocData!.description = text;
      ctx.session.step = 'waiting_for_doc_deadline';
      return ctx.reply('Bước 4: Nhập **Thời gian nộp báo giá**:\nví dụ: `16 giờ 00 ngày 17 tháng 12 năm 2025`', { 
        reply_markup: new Keyboard().text('16 giờ 00 ngày 17 tháng 12 năm 2025').row().text('⬅️ Quay lại').resized() 
      });
    }

    if (step === 'waiting_for_doc_deadline') {
      ctx.session.tempDocData!.deadline = text;
      ctx.session.step = 'waiting_for_doc_address';
      return ctx.reply('Bước 5: Nhập **Địa chỉ Trạm** (mặc định Hòa Cường):', { 
        reply_markup: new Keyboard().text('Trạm Y tế Phường Hòa Cường').row().text('⬅️ Quay lại').resized() 
      });
    }

    if (step === 'waiting_for_doc_address') {
      ctx.session.tempDocData!.address = text;
      ctx.session.step = 'waiting_for_doc_phone';
      return ctx.reply('Bước 6: Nhập **Số điện thoại liên hệ**:', { 
        reply_markup: new Keyboard().text('0236.3868949').row().text('⬅️ Quay lại').resized() 
      });
    }

    if (step === 'waiting_for_doc_phone') {
      ctx.session.tempDocData!.phone = text;
      const doc = generateInvitationToQuote(ctx.session.tempDocData!);
      
      // Save to Supabase
      const { error } = await supabase.from('document_records').insert({
        doc_type: 'invitation_to_quote',
        fields: ctx.session.tempDocData,
        content: doc,
        chat_id: ctx.chat!.id.toString()
      });

      ctx.session.step = 'idle';
      if (error) await ctx.reply('⚠️ Lưu vào database bị lỗi nhưng đây là văn bản của bạn:');
      else await ctx.reply('✅ Đã soạn xong và lưu vào hệ thống:');

      return await ctx.reply(doc, { reply_markup: MAU_VAN_BAN_KEYBOARD });
    }

    if (step === 'waiting_for_meeting_date') {
      const match = text.match(/^(\d{2})\/(\d{4})$/);
      if (!match) return ctx.reply('❌ Nhập sai định dạng. Ví dụ: 04/2026');
      ctx.session.selectedMeetingDate = text; ctx.session.step = 'idle';
      return ctx.reply(`📅 Đã chọn Tháng/Năm: **${text}**`, { reply_markup: MEETING_DATE_DASHBOARD_KEYBOARD });
    }

    if (step === 'waiting_for_meeting_title') {
      const [m, y] = ctx.session.selectedMeetingDate!.split('/');
      const { data, error } = await supabase.from('meetings').insert({ type_id: ctx.session.selectedMeetingTypeId, month: parseInt(m), year: parseInt(y), date_str: ctx.session.selectedMeetingDate, title: text }).select().single();
      if (error) return ctx.reply('❌ Lỗi: ' + error.message);
      ctx.session.selectedMeetingId = data.id; ctx.session.step = 'waiting_for_meeting_content';
      return ctx.reply(`📝 Bắt đầu nhập nội dung cho: **${text}**\n_(Ghi xong hãy gửi tin nhắn)_`, { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
    }

    if (step === 'waiting_for_meeting_content') {
      const { data: existing } = await supabase.from('meetings').select('content').eq('id', ctx.session.selectedMeetingId).single();
      const newContent = (existing?.content ? existing.content + '\n' : '') + text;
      const { error } = await supabase.from('meetings').update({ content: newContent }).eq('id', ctx.session.selectedMeetingId);
      if (error) return ctx.reply('❌ Lỗi: ' + error.message);
      ctx.session.step = 'idle';
      return ctx.reply('✅ Đã lưu thêm nội dung vào biên bản họp!', { reply_markup: MEETING_DATE_DASHBOARD_KEYBOARD });
    }

    if (step === 'waiting_for_meeting_search' || step === 'waiting_for_meeting_search_local') {
      let queryBuilder = supabase.from('meetings').select('*, meeting_types(name)').or(`title.ilike.%${text}%,content.ilike.%${text}%`);
      if (step === 'waiting_for_meeting_search_local') queryBuilder = queryBuilder.eq('type_id', ctx.session.selectedMeetingTypeId);
      
      const { data, error } = await queryBuilder.limit(10);
      if (error) return ctx.reply('❌ Lỗi: ' + error.message);
      if (!data || data.length === 0) return ctx.reply(`¯\\_(ツ)_/¯ Không tìm thấy kết quả nào cho "${text}".`);
      
      const results = data.map(m => `📌 **${m.meeting_types.name}** (${m.date_str})\n🔹 ${m.title}\n[Xem chi tiết / Nhập tiếp](sel_mid:${m.id})`).join('\n---\n');
      ctx.session.step = 'idle';
      return ctx.reply(`🔍 **Kết quả tìm kiếm cho "${text}":**\n\n${results}`, { parse_mode: 'Markdown' });
    }

    if (step === 'waiting_for_thuchi_goal_name') {
      const { data, error } = await supabase.from('thuchi_goals').insert({ name: text }).select().single();
      if (error) return ctx.reply('❌ Lỗi: ' + error.message);
      ctx.session.selectedGoalId = data.id; ctx.session.selectedGoalName = data.name; ctx.session.step = 'waiting_for_thuchi_type';
      return ctx.reply(`✅ Đã tạo mục **${data.name}**!`, { reply_markup: THUCHI_TYPE_KEYBOARD });
    }

    if (step === 'waiting_for_thuchi_amount') {
      const parts = text.split(','); const amount = parseInt(parts[0].replace(/[\.,\sđ]/g, '')); const description = parts[1]?.trim() || '';
      if (isNaN(amount)) return ctx.reply('❌ Nhập sai. Gõ: Số tiền, Nội dung'); const type = ctx.session.thuchiType || 'thu';
      const { count } = await supabase.from('thuchi').select('*', { count: 'exact', head: true }).eq('type', type).eq('goal_id', ctx.session.selectedGoalId);
      const { error } = await supabase.from('thuchi').insert({ goal_id: ctx.session.selectedGoalId, type, amount, description: description, entry_order: (count || 0) + 1 });
      if (error) return ctx.reply('❌ Lỗi: ' + error.message);
      const nextOrder = (count || 0) + 2; ctx.session.step = 'waiting_for_thuchi_amount'; 
      return ctx.reply(`${nextOrder - 1}, ${amount.toLocaleString('vi-VN')}, ${description || 'N/A'}\nNhập tiếp mục số ${nextOrder} (${ctx.session.selectedGoalName}):`, { reply_markup: THUCHI_INPUT_LOOP_KEYBOARD });
    }

    if (step === 'waiting_for_reminder_input') {
      const parts = text.split(',');
      if (parts.length < 3) return ctx.reply('❌ Sai định dạng. Hãy gõ: `Giờ, Ngày, Nội dung`\nVí dụ: `16h30, 11/04/2026, Tiệc nhà mới`');
      
      const timePart = parts[0].trim().replace('h', ':');
      const datePartRaw = parts[1].trim().toLowerCase();
      const title = parts.slice(2).join(',').trim();

      const isLunar = datePartRaw.includes('âm') || datePartRaw.includes('al');
      const cleanDatePart = datePartRaw.replace(/âm|al|lịch/g, '').trim();

      const [d, m, y] = cleanDatePart.split('/');
      
      let eventTime: Date;
      let feedbackMsg = '';

      if (isLunar) {
        const solarDate = getSolarDate(parseInt(d), parseInt(m), parseInt(y));
        const solarStr = `${solarDate.getDate()}/${solarDate.getMonth() + 1}/${solarDate.getFullYear()}`;
        feedbackMsg = `🏮 **Âm lịch detected:** ${d}/${m}/${y} AL -> **${solarStr}** Dương lịch\n`;
        
        // Combine solar date with user time
        const timeBits = timePart.split(':');
        solarDate.setHours(parseInt(timeBits[0]));
        solarDate.setMinutes(parseInt(timeBits[1] || '0'));
        eventTime = solarDate;
      } else {
        const isoDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${timePart.padStart(5, '0')}:00`;
        eventTime = new Date(isoDate);
      }

      if (isNaN(eventTime.getTime())) return ctx.reply('❌ Ngày hoặc giờ không hợp lệ. Hãy kiểm tra lại.');

      const { error } = await supabase.from('reminders').insert({ event_time: eventTime.toISOString(), title });
      if (error) return ctx.reply('❌ Lỗi lưu lịch: ' + error.message);
      
      ctx.session.step = 'idle';
      return ctx.reply(`${feedbackMsg}✅ Đã thêm lịch hẹn!\n📌 **${title}**\n⏰ ${parts[0].trim()}, ${isLunar ? (eventTime.getDate() + '/' + (eventTime.getMonth()+1)) : parts[1].trim()}`, { reply_markup: REMINDER_MAIN_KEYBOARD });
    }

    if (step === 'waiting_for_reminder_search') {
      const { data, error } = await supabase.from('reminders').select('*').ilike('title', `%${text}%`).order('event_time');
      if (error) return ctx.reply('❌ Lỗi tìm kiếm: ' + error.message);
      if (!data || data.length === 0) return ctx.reply(`¯\\_(ツ)_/¯ Không tìm thấy lịch nào liên quan đến "${text}".`);

      const resp = data.map(item => {
        const time = new Date(item.event_time);
        const timeStr = `${time.getHours()}h${time.getMinutes().toString().padStart(2, '0')}, ${time.getDate()}/${time.getMonth() + 1}/${time.getFullYear()}`;
        return `⏰ **${timeStr}**: ${item.title}`;
      }).join('\n');
      ctx.session.step = 'idle';
      return ctx.reply(`🔍 **Kết quả tìm kiếm cho "${text}":**\n\n${resp}`, { parse_mode: 'Markdown' });
    }

    if (step === 'waiting_for_horoscope_range') {
      const parts = text.split('-');
      if (parts.length !== 2) return ctx.reply('❌ Nhập sai định dạng. Hãy gõ: `Ngày Bắt Đầu - Ngày Kết Thúc` (Ví dụ: `12/04/2026-12/05/2026`)');
      
      const [sd, sm, sy] = parts[0].trim().split('/');
      const [ed, em, ey] = parts[1].trim().split('/');
      
      const start = new Date(parseInt(sy), parseInt(sm) - 1, parseInt(sd));
      const end = new Date(parseInt(ey), parseInt(em) - 1, parseInt(ed));

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return ctx.reply('❌ Ngày không hợp lệ. Hãy kiểm tra lại.');
      if (end < start) return ctx.reply('❌ Ngày kết thúc phải sau ngày bắt đầu.');
      
      // Limit range to 60 days to avoid performance issues
      if ((end.getTime() - start.getTime()) / (1000*60*60*24) > 60) return ctx.reply('❌ Khoảng cách quá xa. Hãy chọn trong vòng 60 ngày.');

      const taskType = ctx.session.selectedTaskType as any;
      const topDays = rankAuspiciousDays(start, end, taskType as any);
      
      let resp = `🌟 **TOP 5 NGÀY TỐT NHẤT CHO ${TASK_LIST[taskType as TaskType].name.toUpperCase()}**\n`;
      resp += `📅 Giai đoạn: ${parts[0].trim()} - ${parts[1].trim()}\n\n`;
      
      topDays.forEach((item: any, idx: number) => {
        const dStr = `${item.date.getDate()}/${item.date.getMonth()+1}`;
        const star = item.score >= 50 ? '⭐⭐⭐⭐⭐' : (item.score >= 30 ? '⭐⭐⭐⭐' : (item.score >= 10 ? '⭐⭐⭐' : '⭐⭐'));
        resp += `${idx + 1}. **Ngày ${dStr}** (${item.lunar} AL) - ${star}\n`;
        resp += `    ✨ ${item.desc}, Trực: ${item.truc}, Sao: ${item.sao}\n`;
        if (item.status !== "Bình thường") resp += `    ⚠️ ${item.status}\n`;
        resp += `\n`;
      });

      ctx.session.step = 'idle';
      return ctx.reply(resp, { parse_mode: 'Markdown', reply_markup: MAIN_KEYBOARD });
    }

    if (step === 'waiting_for_name') { return executeSearch(ctx, 'full_name', text, 'Tìm theo tên'); }
    if (step === 'waiting_for_year') { return executeSearch(ctx, 'date_of_birth', text, 'Lọc năm sinh'); }
    if (step === 'waiting_for_education') { return executeSearch(ctx, 'education_level', text, 'Lọc trình độ'); }
    if (step === 'waiting_for_specialty') { return executeSearch(ctx, 'specialization', text, 'Lọc chuyên môn'); }

    if (step === 'waiting_for_genealogy_search') { return executeGiaphaSearch(ctx, text); }

    // --- Danh bạ Processing ---
    if (step === 'waiting_for_contact_search' || step === 'waiting_for_edit_contact_search') {
      const { data, error } = await supabase.from('danhba').select('*').or(`full_name.ilike.%${text}%,position.ilike.%${text}%`).limit(10);
      if (error) return ctx.reply('❌ Lỗi: ' + error.message);
      if (!data || data.length === 0) return ctx.reply(`¯\\_(ツ)_/¯ Không tìm thấy liên lạc nào khớp với "${text}".`);
      
      const isEdit = step === 'waiting_for_edit_contact_search';
      for (const contact of data) {
        const keyboard = isEdit ? new InlineKeyboard().text('✏️ Sửa người này', `edit_contact:${contact.id}`) : undefined;
        await ctx.reply(formatContact(contact), { parse_mode: 'Markdown', reply_markup: keyboard });
      }
      if (!isEdit) ctx.session.step = 'idle';
      return;
    }

    if (step === 'waiting_for_new_contact_data') {
      const p = text.split(',').map(s => s.trim());
      if (p.length < 1) return ctx.reply('❌ Vui lòng nhập ít nhất là Họ tên.');
      const { error } = await supabase.from('danhba').insert({
        full_name: p[0], position: p[1] || '', mobile: p[2] || '', landline: p[3] || '', birth_year: p[4] || ''
      });
      if (error) return ctx.reply('❌ Lỗi: ' + error.message);
      ctx.session.step = 'idle';
      return ctx.reply(`✅ Đã lưu liên lạc: **${p[0]}** vào danh bạ!`, { reply_markup: DANHBA_KEYBOARD });
    }

    // --- Gia phả Edit Search ---
    if (step === 'waiting_for_edit_giapha_search') {
      const { data, error } = await supabase.from('giapha').select('*').ilike('full_name', `%${text}%`).limit(5);
      if (error) return ctx.reply('❌ Lỗi: ' + error.message);
      if (!data || data.length === 0) return ctx.reply(`¯\\_(ツ)_/¯ Không tìm thấy khớp với "${text}".`);
      
      for (const relative of data) {
        const formatted = await formatRelative(relative);
        const keyboard = new InlineKeyboard().text('✏️ Cập nhật thông tin', `edit_giapha:${relative.id}`);
        await ctx.reply(formatted, { parse_mode: 'Markdown', reply_markup: keyboard });
      }
      return;
    }

    // --- Database Update Logic for Edits ---
    if (step === 'waiting_for_edit_value' && ctx.session.selectedContactId && ctx.session.selectedField) {
      const { error } = await supabase.from('danhba').update({ [ctx.session.selectedField]: text }).eq('id', ctx.session.selectedContactId);
      if (error) return ctx.reply('❌ Lỗi cập nhật: ' + error.message);
      ctx.session.step = 'idle';
      return ctx.reply(`✅ Đã cập nhật trường **${ctx.session.selectedField}**!`, { reply_markup: DANHBA_KEYBOARD });
    }

    if (step === 'waiting_for_giapha_edit_value' && ctx.session.selectedRelativeId && ctx.session.selectedField) {
      const { error } = await supabase.from('giapha').update({ [ctx.session.selectedField]: text }).eq('id', ctx.session.selectedRelativeId);
      if (error) return ctx.reply('❌ Lỗi cập nhật: ' + error.message);
      ctx.session.step = 'idle';
      return ctx.reply(`✅ Đã cập nhật **${ctx.session.selectedField}** thành công!`, { reply_markup: GIAPHA_KEYBOARD });
    }

    // --- Văn cúng Wizard Flow ---
    if (step === 'waiting_for_vancung_type') {
      if (text === '⬅️ Quay lại') { ctx.session.step = 'idle'; return ctx.reply('Đã hủy.', { reply_markup: MAIN_KEYBOARD }); }
      ctx.session.selectedVancungType = text;
      ctx.session.step = 'waiting_for_vancung_date';
      return ctx.reply(`👌 Bạn chọn: **${text}**\nNhập ngày thực hiện (Dương lịch, ví dụ: 11/04/2026):`, { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
    }

    if (step === 'waiting_for_vancung_date') {
      const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) return ctx.reply('❌ Định dạng ngày sai. Hãy nhập DD/MM/YYYY (ví dụ: 11/04/2026)');
      const [d, m, y] = match.slice(1).map(Number);
      const lunar = getLunarDate(d, m, y);
      ctx.session.selectedMeetingDate = text; // Reuse for solar date storage
      ctx.session.step = 'waiting_for_vancung_location';
      return ctx.reply(`📅 Ngày âm lịch: **${lunar.day}/${lunar.month}** năm **${lunar.year}**\nChọn nơi thực hiện lễ cúng:`, { reply_markup: VANCUNG_LOC_KEYBOARD });
    }

    if (step === 'waiting_for_vancung_location') {
      if (text === '🏡 Ngoài sân') {
          const solar = ctx.session.selectedMeetingDate!.split('/').map(Number);
          const lunar = getLunarDate(solar[0], solar[1], solar[2]);
          const result = await generatePrayerOutdoor(ctx.session.selectedVancungType!, lunar);
          ctx.session.step = 'idle';
          return ctx.reply(result, { parse_mode: 'Markdown', reply_markup: MAIN_KEYBOARD });
      }
      if (text === '🏠 Trong nhà') {
          return ctx.reply('Tính năng cúng **Trong nhà** đang được biên soạn nội dung. Hãy thử lại sau!');
      }
    }

    if (step === 'waiting_for_expense_year' && ctx.session.context === 'projects') {
      if (text === '⬅️ Quay lại') { ctx.session.step = 'idle'; return ctx.reply('Đã hủy.', { reply_markup: MAIN_KEYBOARD }); }
      const year = parseInt(text);
      if (isNaN(year)) return ctx.reply('❌ Năm không hợp lệ. Vui lòng nhập số năm (ví dụ: 2025).');
      
      ctx.session.selectedExpenseYear = year;
      
      const { data: summary, error } = await supabase
        .from('pe_expenses')
        .select('project_code, pe_projects(name), total')
        .eq('year', year);
        
      if (error) return ctx.reply('❌ Lỗi tra cứu: ' + error.message);
      if (!summary || summary.length === 0) {
          return ctx.reply(`📭 Không tìm thấy dữ liệu kinh phí cho năm **${year}**.\n\n_Vui lòng đảm bảo bạn đã chạy script nạp dữ liệu (import-project-expenses.ts) thành công trên hệ thống._`, { parse_mode: 'Markdown' });
      }
      
      const totals: Record<string, { name: string, total: number }> = {};
      summary.forEach((row: any) => {
        const code = row.project_code;
        const name = row.pe_projects?.name || code;
        if (!totals[code]) totals[code] = { name, total: 0 };
        totals[code].total += row.total;
      });
      
      let msg = `📊 **TỔNG HỢP KINH PHÍ NĂM ${year}**\n\n`;
      const keyboard = new InlineKeyboard();
      Object.entries(totals).forEach(([code, data]) => {
        msg += `🔹 **${code}**: ${data.total.toLocaleString('vi-VN')}k\n`;
        keyboard.text(`📂 Xem ${code}`, `exp_proj:${year}:${code}`).row();
      });
      msg += `\n_(Đơn vị: nghìn đồng)_\n\nChọn một dự án để xem chi tiết hoạt động:`;
      return ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: PROJECT_MAIN_KEYBOARD });
    }

    if (step === 'waiting_for_new_project_code') { ctx.session.tempProjectCode = text.trim(); ctx.session.step = 'waiting_for_new_project_name'; return ctx.reply('Nhập **Tên dự án**:'); }
    if (step === 'waiting_for_new_project_name') {
        const { error } = await supabase.from('pe_projects').insert({ code: ctx.session.tempProjectCode, name: text.trim() });
        if (error) return ctx.reply('❌ Lỗi: ' + error.message);
        ctx.session.step = 'idle'; return ctx.reply(`✅ Đã thêm dự án: **${text.trim()}**!`, { reply_markup: PROJECT_MAIN_KEYBOARD });
    }

    if (step === 'waiting_for_new_activity_code') { ctx.session.tempActivityCode = text.trim(); ctx.session.step = 'waiting_for_new_activity_name'; return ctx.reply('Nhập **Tên hoạt động**:'); }
    if (step === 'waiting_for_new_activity_name') {
        const { error } = await supabase.from('pe_activities').insert({ code: ctx.session.tempActivityCode, name: text.trim() });
        if (error) return ctx.reply('❌ Lỗi: ' + error.message);
        ctx.session.step = 'idle'; return ctx.reply(`✅ Đã thêm hoạt động: **${text.trim()}**!`, { reply_markup: PROJECT_DETAIL_KEYBOARD });
    }

    if (step === 'waiting_for_new_expense_data') {
        const parts = text.split(',').map(s => s.trim());
        if (parts.length < 3) return ctx.reply('❌ Nhập sai định dạng. Ví dụ: BCV, 13, 500');
        const [tCode, qty, price] = parts;
        const total = parseFloat(qty) * parseFloat(price);
        const { error } = await supabase.from('pe_expenses').insert({ 
            year: ctx.session.selectedExpenseYear, project_code: ctx.session.selectedProjectCode, activity_code: ctx.session.selectedActivityCode, 
            task_code: tCode, qty: parseFloat(qty), price: parseFloat(price), total, record_code: 'MANUAL'
        });
        if (error) return ctx.reply('❌ Lỗi: ' + error.message);
        ctx.session.step = 'idle'; return ctx.reply('✅ Đã thêm dự toán chi tiết!', { reply_markup: ACTIVITY_DETAIL_KEYBOARD });
    }

    if (step === 'waiting_for_expense_spent') {
        const spent = parseFloat(text.replace(/[\.,\sđ]/g, ''));
        if (isNaN(spent)) return ctx.reply('❌ Số tiền không hợp lệ.');
        const { error } = await supabase.from('pe_expenses').update({ spent }).eq('id', ctx.session.selectedExpenseId);
        if (error) return ctx.reply('❌ Lỗi cập cập: ' + error.message);
        ctx.session.step = 'idle'; return ctx.reply('✅ Đã cập nhật số tiền thực tế đã chi!', { reply_markup: ACTIVITY_DETAIL_KEYBOARD });
    }
  }

  // --- Quick Search Fallback (if no specific step) ---
  if (!text.startsWith('/') && step === 'idle') {
    if (ctx.session.context === 'nhansu' && text.length > 1) return executeSearch(ctx, 'full_name', text, 'tìm nhanh');
    if (ctx.session.context === 'danhba' && text.length > 1) {
       const { data } = await supabase.from('danhba').select('*').or(`full_name.ilike.%${text}%,position.ilike.%${text}%`).limit(10);
       if (data && data.length > 0) {
           for (const contact of data) await ctx.reply(formatContact(contact), { parse_mode: 'Markdown' });
           return;
       }
    }
    if (ctx.session.context === 'giapha' && text.length > 1) return executeGiaphaSearch(ctx, text);
    if (ctx.session.context === 'idle' && text.length > 2) return executeSearch(ctx, 'full_name', text, 'tìm nhanh');
  }
});

// --- Callback Query Handlers ---
bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data;
  if (data.startsWith('sel_goal_any:')) {
    const p = data.split(':'); ctx.session.selectedGoalId = parseInt(p[1]); ctx.session.selectedGoalName = p[2];
    ctx.session.step = 'idle'; await ctx.answerCallbackQuery(); await ctx.editMessageText(`✅ Đã chọn: **${p[2]}**`); 
    return ctx.reply(`📂 **${p[2]}**\nBạn muốn làm gì với đề mục này?`, { reply_markup: THUCHI_GOAL_DASHBOARD });
  }
  if (data.startsWith('sel_mtype:')) {
    const p = data.split(':'); ctx.session.selectedMeetingTypeId = parseInt(p[1]); ctx.session.selectedMeetingTypeName = p[2];
    await ctx.answerCallbackQuery(); await ctx.editMessageText(`📂 Loại hình: **${p[2]}**`);
    return ctx.reply(`📅 **${p[2]}**\nChọn thời gian họp:`, { reply_markup: MEETING_DASHBOARD_KEYBOARD });
  }

  if (data.startsWith('exp_proj:')) {
    const [, year, code] = data.split(':');
    const { data: details, error } = await supabase
      .from('pe_expenses')
      .select('activity_code, pe_activities(name), total')
      .eq('year', parseInt(year))
      .eq('project_code', code);
      
    if (error) return ctx.reply('❌ Lỗi chi tiết: ' + error.message);
    
    // Group by activity then task_types
    const { data: rawDetails } = await supabase
      .from('pe_expenses')
      .select('activity_code, pe_activities(name), task_code, pe_task_types(name), qty, price, total')
      .eq('year', parseInt(year))
      .eq('project_code', code)
      .order('activity_code');

    const activityGroups: Record<string, { name: string, items: any[] }> = {};
    rawDetails?.forEach((row: any) => {
      const aCode = row.activity_code;
      const aName = row.pe_activities?.name || aCode;
      if (!activityGroups[aCode]) activityGroups[aCode] = { name: aName, items: [] };
      activityGroups[aCode].items.push(row);
    });
    
    let msg = `📂 **CHI TIẾT DỰ ÁN ${code} - ${year}**\n\n`;
    Object.entries(activityGroups).forEach(([aCode, group]) => {
      msg += `📍 **${group.name}**\n`;
      group.items.forEach(item => {
        const tName = item.pe_task_types?.name || item.task_code;
        const spent = item.spent || 0;
        const rem = (item.total || 0) - spent;
        msg += `  ▫️ ${tName} ${item.qty} x ${item.price?.toLocaleString('vi-VN')} = **${item.total?.toLocaleString('vi-VN')}**\n`;
        msg += `     Spent: \`${spent.toLocaleString('vi-VN')}\` | Rem: **${rem.toLocaleString('vi-VN')}**\n`;
        msg += `     [Update Spent](upd_spent:${item.id})\n`;
      });
      const groupTotal = group.items.reduce((sum, i) => sum + (i.total || 0), 0);
      msg += `💰 **Cộng: ${groupTotal.toLocaleString('vi-VN')}**\n\n`;
    });
    msg += `_(Đơn vị: nghìn đồng)_`;
    
    ctx.session.selectedProjectCode = code;
    await ctx.answerCallbackQuery();
    return ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: PROJECT_DETAIL_KEYBOARD });
  }
  if (data.startsWith('sel_mdate:')) {
    const p = data.split(':'); ctx.session.selectedMeetingDate = p[1];
    await ctx.answerCallbackQuery(); await ctx.editMessageText(`📅 Tháng: **${p[1]}**`);
    return ctx.reply(`📝 **Tháng ${p[1]}**\nChọn thao tác:`, { reply_markup: MEETING_DATE_DASHBOARD_KEYBOARD });
  }
  if (data.startsWith('sel_mid:')) {
    const p = data.split(':'); const mid = parseInt(p[1]);
    const { data: meeting } = await supabase.from('meetings').select('*').eq('id', mid).single();
    if (!meeting) return ctx.answerCallbackQuery('Không tìm thấy bản ghi.');
    ctx.session.selectedMeetingId = mid; 
    ctx.session.step = 'waiting_for_meeting_content'; // THIẾU DÒNG NÀY NÊN CỦA BẠN KHÔNG LƯU ĐƯỢC
    await ctx.answerCallbackQuery();
    return ctx.reply(`📋 **${meeting.title}** (${meeting.date_str})\n\n${meeting.content || '_(Chưa có nội dung)_'}\n\n👉 **Nhập tiếp nội dung tại đây:**`, { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
  }

  // Book Selection
  if (data.startsWith('sel_book:')) {
    const bid = parseInt(data.split(':')[1]);
    const { data: book } = await supabase.from('books').select('*').eq('id', bid).single();
    if (!book) return ctx.answerCallbackQuery('Không tìm thấy sách.');
    ctx.session.selectedBookId = bid;
    ctx.session.selectedBookTitle = book.title;
    
    const { data: sections } = await supabase.from('book_sections').select('id, title').eq('book_id', bid).order('order_index');
    const keyboard = new InlineKeyboard();
    sections?.forEach(s => keyboard.text(s.title, `sel_bsec:${s.id}`).row());
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(`📖 **${book.title}**\n\nChọn chương/mục để đọc:`, { reply_markup: keyboard });
    return;
  }

  // Section Selection
  if (data.startsWith('sel_bsec:')) {
    const sid = parseInt(data.split(':')[1]);
    const { data: section } = await supabase.from('book_sections').select('*').eq('id', sid).single();
    if (!section) return ctx.answerCallbackQuery('Không tìm thấy nội dung.');
    
    ctx.session.step = 'reading_book_section'; // Đặt step để nút Quay lại biết đường về TOC
    await ctx.answerCallbackQuery();
    await ctx.reply(`📖 **${section.title}**\n\n${section.content}`, { reply_markup: new Keyboard().text('⬅️ Quay lại').resized() });
    return;
  }

  // Horoscope Task Selection
  if (data.startsWith('h_task:')) {
    const task = data.split(':')[1];
    ctx.session.selectedTaskType = task;
    ctx.session.step = 'waiting_for_horoscope_range';
    await ctx.answerCallbackQuery();
    return ctx.reply('📌 Bạn đã chọn loại việc này.\nHãy nhập khoảng thời gian bạn muốn xem:\n`(Ví dụ: 12/04/2026-12/05/2026)`');
  }

  // --- Contact Edit Callback ---
  if (data.startsWith('edit_contact:')) {
    const id = parseInt(data.split(':')[1]);
    ctx.session.selectedContactId = id;
    const keyboard = new InlineKeyboard()
      .text('👤 Họ tên', `cfield:full_name`).text('💼 Chức vụ', `cfield:position`).row()
      .text('📱 Di động', `cfield:mobile`).text('☎️ ĐT bàn', `cfield:landline`).row()
      .text('📅 Năm sinh', `cfield:birth_year`);
    await ctx.answerCallbackQuery();
    return ctx.reply('📝 **SỬA LIÊN LẠC**\nChọn trường bạn muốn thay đổi:', { reply_markup: keyboard });
  }

  if (data.startsWith('cfield:')) {
    const field = data.split(':')[1];
    ctx.session.selectedField = field;
    ctx.session.step = 'waiting_for_edit_value';
    await ctx.answerCallbackQuery();
    return ctx.reply(`👉 Nhập nội dung mới cho trường **${field}**:`);
  }

  // --- Gia phả Edit Callback ---
  if (data.startsWith('edit_giapha:')) {
    const id = parseInt(data.split(':')[1]);
    ctx.session.selectedRelativeId = id;
    const keyboard = new InlineKeyboard()
      .text('🌳 Họ tên', `gfield:full_name`).text('📅 Ngày sinh', `gfield:birth_day`).row()
      .text('🪦 Ngày mất', `gfield:death_day`).text('👩‍❤️‍👨 Bạn đời', `gfield:spouse_name`).row()
      .text('👫 Giới tính', `gfield:gender`);
    await ctx.answerCallbackQuery();
    return ctx.reply('📝 **CẬP NHẬT GIA PHẢ**\nChọn thông tin cần sửa:', { reply_markup: keyboard });
  }

  if (data.startsWith('gfield:')) {
    const field = data.split(':')[1];
    ctx.session.selectedField = field;
    ctx.session.step = 'waiting_for_giapha_edit_value';
    await ctx.answerCallbackQuery();
    return ctx.reply(`👉 Nhập giá trị mới cho **${field}**:`);
  }

  if (data.startsWith('upd_spent:')) {
      const id = parseInt(data.split(':')[1]);
      ctx.session.selectedExpenseId = id;
      ctx.session.step = 'waiting_for_expense_spent';
      await ctx.answerCallbackQuery();
      return ctx.reply('👉 Nhập **Số tiền thực tế đã chi** cho mục này (nghìn đồng):');
  }

  if (data.startsWith('sel_act:')) {
      const aCode = data.split(':')[1];
      ctx.session.selectedActivityCode = aCode;
      await ctx.answerCallbackQuery();
      return ctx.reply(`📂 **HOẠT ĐỘNG: ${aCode}**\nChọn thao tác:`, { reply_markup: ACTIVITY_DETAIL_KEYBOARD });
  }

  await ctx.answerCallbackQuery();
});

bot.command('help', (ctx) => ctx.reply(HELP_TEXT, { parse_mode: 'Markdown' }));
bot.catch((err) => console.error('Bot Error:', err));
