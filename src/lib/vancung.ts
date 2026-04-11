import { LunarDateInfo } from './lunar';
import { supabase } from './supabase';

const CAN_NAMES = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI_NAMES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

const HAN_VIET_NUMS = ["", "Nhất", "Nhị", "Tam", "Tứ", "Ngũ", "Lục", "Thất", "Bát", "Cửu", "Thập"];

const HANH_KHIEN_MAP: Record<number, string> = {
  0: "Chu Vương Hành Khiển, Thiên Ôn hành binh chi thần. Lý Tào Phán Quân.",
  1: "Triệu Vương Hành Khiển, Tam thập lục thương hành binh chi thần. Khúc Tào Phán Quân.",
  2: "Ngụy Vương Hành Khiển, Mộc tinh hành binh chi thần. Tiêu Tào Phán Quân.",
  3: "Trịnh Vương Hành Khiển, Thạch tinh hành binh chi thần. Liễu Tào Phán Quan.",
  4: "Sở Vương Hành Khiển, Hỏa tinh hành binh chi thần. Biểu Tào Phán Quan.",
  5: "Ngô Vương Hành Khiển, Thiên hao hành binh chi thần, Hứa Tào Phán Quan.",
  6: "Tần Vương Hành Khiển, Thiên Mao hành binh chi thần. Ngọc Tào Phán Quân.",
  7: "Tống Vương Hành Khiển, Ngũ đạo hành binh chi thần. Lâm Tào Phán Quan.",
  8: "Tề Vương Hành Khiển, Ngũ miếu hành binh chi thần. Tống Tào Phán Quân.",
  9: "Lỗ Vương Hành Khiển, Ngũ nhạc hành binh chi thần. Cự Tào Phán Quan.", 
  10: "Việt Vương Hành Khiển, Thiên bá hành binh chi thần. Thành Táo Phán Quan.",
  11: "Lưu Vương Hành Khiển, Ngũ ôn hành binh chi thần. Nguyễn Tào Phán Quan."
};

function numToHanViet(n: number): string {
  if (n <= 10) return HAN_VIET_NUMS[n];
  if (n < 20) return "Thập " + HAN_VIET_NUMS[n - 10];
  if (n === 20) return "Nhị thập";
  if (n < 30) return "Nhị thập " + HAN_VIET_NUMS[n - 20];
  if (n === 30) return "Tam thập";
  return n.toString();
}

export function getYearCanChi(year: number) {
  const can = (year - 4) % 10;
  const chi = (year - 4) % 12;
  return `${CAN_NAMES[can]} ${CHI_NAMES[chi]}`;
}

export function toHanVietDate(lunar: LunarDateInfo): string {
  const yearStr = getYearCanChi(lunar.year);
  const monthStr = numToHanViet(lunar.month);
  const dayStr = numToHanViet(lunar.day);
  return `${yearStr} niên, ${monthStr} nguyệt ${dayStr} nhật`;
}

export const ADDRESS_DEFAULT = "Việt Nam quốc Đà Nẵng thành Cẩm Lệ phường, Phước Hòa khối Thuận An nam ấp Bầu Tràm thượng xứ, Cách Mạng Tháng Tám lộ, số 226";

export async function generatePrayerOutdoor(type: string, lunar: LunarDateInfo) {
  const hvDate = toHanVietDate(lunar);
  const chiIdx = (lunar.year - 4) % 12;
  const hanhKhien = HANH_KHIEN_MAP[chiIdx];
  const lunarFull = `${lunar.day}/${lunar.month}/${lunar.year} Âm lịch`;

  // Fetch specific lyrics from database
  const { data } = await supabase
    .from('vancung_templates')
    .select('lyrics')
    .eq('ceremony_type', type)
    .eq('location', 'outdoor')
    .single();

  const specificLyrics = data?.lyrics || "Phù hộ độ trì cho tín chủ cùng toàn gia (tộc): Bình an khương thái, vạn sự hanh thông. Cầu tài đắc tài, cầu lợi đắc lợi, cảm dĩ toại thông.";

  return `📜 **VĂN CÚNG NGOÀI SÂN - ${type.toUpperCase()}**

🇻🇳 **Cộng hòa Xã hội Chủ nghĩa Việt Nam**
📍 **Địa điểm**: ${ADDRESS_DEFAULT}

📅 **Thời gian**: Tế thứ ${hvDate}
(${lunarFull})

🌟 **CUNG THỈNH**:
- Hoàng thiên hậu thổ sơn xuyên thần kỳ vị tiền.
- **Thần năm**: ${hanhKhien}
- Đương cảnh thổ địa, phước đức chánh thần.
- Cao cát quản đạo đại vương tôn thần.
- Bổn xứ thành hoàng đại vương tôn thần.
- Ngũ phương tài thần. Thập phương tài thần.
- Bổn xứ chi vị âm dương chi thần.
- Bổn xứ chư vị du thần nhơn thần liệt vị.
- Các đấng thần linh: Thổ công, thổ phủ, long mạch, tiền chu tước, hậu huyền vũ. Tả thanh long, hữu bạch hổ.
- Tiêu diện đại sĩ Diêm khẩu Quỉ vương Hoà ôn chúa tướng. 
- Ngài cai quản tam thập lục loại, thất thập nhị nghiệp, âm hồn, cô hồn.
- Tiền hiền khai khẩn, hậu hiền khai canh, khai cư chi thần.
- Nội gia viên trạch, ngoại gia viên cư.

✨ **CẢM CÁO VU**:
Kính xin chư Tôn linh, Kính cáo Táo phủ thần quân, Ngũ tự gia thần. Kính mời Gia đường tiên linh Khảo, Tỷ, Bá, Thúc, Huynh, Đệ, Cô, Di Tỷ, Muội, Nội Ngoại chân linh, lai đáo đàng tiền chứng minh công đức thọ hưởng lễ vật.

✨ **CUNG DUY**:
${specificLyrics}

📅 **Hôm nay là ngày**: ${lunarFull}
Kính xin chư vị Tôn thần cho phép ông bà tổ tiên chúng con được nhập linh sàng để con cháu được phụng thờ, hương khói.

Lễ tuy bất túc, tâm kỉnh hữu dư.
**Cung hành chi lễ.**`;
}
