import { getLunarDate } from './lunar';

const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

// Hoàng Đạo / Hắc Đạo table based on Lunar Month (1-12)
// Each array index corresponds to Month (1..12), value is the Hoàng Đạo branches
const HOANG_DAO_MAP: Record<number, string[]> = {
  1: ["Tý", "Sửu", "Tỵ", "Mùi"], 7: ["Tý", "Sửu", "Tỵ", "Mùi"],
  2: ["Dần", "Mão", "Mùi", "Dậu"], 8: ["Dần", "Mão", "Mùi", "Dậu"],
  3: ["Thìn", "Tỵ", "Dậu", "Hợi"], 9: ["Thìn", "Tỵ", "Dậu", "Hợi"],
  4: ["Ngọ", "Mùi", "Sửu", "Dần"], 10: ["Ngọ", "Mùi", "Sửu", "Dần"],
  5: ["Thân", "Dậu", "Sửu", "Mão"], 11: ["Thân", "Dậu", "Sửu", "Mão"],
  6: ["Tuất", "Hợi", "Mão", "Tỵ"], 12: ["Tuất", "Hợi", "Mão", "Tỵ"]
};

// Start dates of Solar Terms (Tiết Khí) for 2026 (DD/MM)
const SOLAR_TERMS_2026: Record<number, { day: number, month: number, branch: string }> = {
  1: { day: 5, month: 1, branch: "Sửu" }, // Tiểu Hàn
  2: { day: 4, month: 2, branch: "Dần" }, // Lập Xuân
  3: { day: 5, month: 3, branch: "Mão" }, // Kinh Trập
  4: { day: 5, month: 4, branch: "Thìn" }, // Thanh Minh
  5: { day: 5, month: 5, branch: "Tỵ" },  // Lập Hạ
  6: { day: 5, month: 6, branch: "Ngọ" },  // Mang Chủng
  7: { day: 7, month: 7, branch: "Mùi" },  // Tiểu Thử
  8: { day: 7, month: 8, branch: "Thân" },  // Lập Thu
  9: { day: 7, month: 9, branch: "Dậu" },  // Bạch Lộ
  10: { day: 8, month: 10, branch: "Tuất" }, // Hàn Lộ
  11: { day: 7, month: 11, branch: "Hợi" }, // Lập Đông
  12: { day: 7, month: 12, branch: "Tý" }   // Đại Tuyết
};

const TRUC_NAMES = ["Kiến", "Trừ", "Mãn", "Bình", "Định", "Chấp", "Phá", "Nguy", "Thành", "Thu", "Khai", "Bế"];
const SAO_NAMES = [
  "Giác", "Cang", "Đê", "Phòng", "Tâm", "Vĩ", "Cơ", // Đông
  "Đẩu", "Ngưu", "Nữ", "Hư", "Nguy", "Thất", "Bích", // Bắc
  "Khuê", "Lâu", "Vị", "Mão", "Tất", "Chủy", "Sâm", // Tây
  "Tỉnh", "Quỷ", "Liễu", "Tinh", "Trương", "Dực", "Chẩn" // Nam
];

// Task criteria Mapping (Good Trực, Good Stars)
export type TaskType = 'house' | 'moving' | 'opening' | 'wedding' | 'contract' | 'worship';

const TASK_CRITERIA: Record<TaskType, { goodTruc: string[], goodSao: string[], name: string }> = {
  'house': { 
    goodTruc: ["Kiến", "Mãn", "Bình", "Định", "Thành"], 
    goodSao: ["Phòng", "Vĩ", "Cơ", "Đẩu", "Thất", "Bích", "Lâu", "Vị", "Tất", "Sâm", "Tỉnh"],
    name: "Làm/Sửa nhà" 
  },
  'moving': { 
    goodTruc: ["Kiến", "Mãn", "Khai", "Thành"], 
    goodSao: ["Phòng", "Vĩ", "Cơ", "Đẩu", "Thất", "Bích", "Khuê", "Lâu", "Vị", "Tất", "Sâm"],
    name: "Nhập trạch" 
  },
  'opening': { 
    goodTruc: ["Khai", "Mãn", "Thành"], 
    goodSao: ["Giác", "Phòng", "Vĩ", "Cơ", "Đẩu", "Thất", "Bích", "Lâu", "Vị", "Tất", "Sâm"],
    name: "Khai trương" 
  },
  'wedding': { 
    goodTruc: ["Mãn", "Thành", "Khai"], 
    goodSao: ["Phòng", "Vĩ", "Cơ", "Đẩu", "Thất", "Bích", "Khuê", "Lâu", "Vị", "Tất", "Sâm", "Dực"],
    name: "Cưới hỏi" 
  },
  'contract': { 
    goodTruc: ["Thành", "Khai", "Mãn", "Kiến"], 
    goodSao: ["Giác", "Phòng", "Vĩ", "Cơ", "Thất", "Bích", "Lâu", "Vị", "Tất", "Sâm"],
    name: "Hợp đồng/Giao dịch" 
  },
  'worship': { 
    goodTruc: ["Trừ", "Nguy", "Định", "Thành", "Khai"], 
    goodSao: ["Tâm", "Vĩ", "Cơ", "Đẩu", "Thất", "Bích", "Tinh", "Trương", "Dực", "Chẩn"],
    name: "Cúng bái/Tế tự" 
  }
};

export function getDayInfo(date: Date) {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  
  const lunar = getLunarDate(d, m, y);
  
  // Can Chi calculations (Approximate logic, ideally use JDN based ones)
  // Determine Solar Month Branch
  let monthBranch = "Dần";
  let monthIdx = 1;
  const currMM = date.getMonth() + 1;
  const currDD = date.getDate();
  
  // Find current solar month
  for (let m = 12; m >= 1; m--) {
    const term = SOLAR_TERMS_2026[m];
    if (currMM > term.month || (currMM === term.month && currDD >= term.day)) {
      monthBranch = term.branch;
      monthIdx = m;
      break;
    }
  }
  if (currMM < 1 || (currMM === 1 && currDD < 5)) monthBranch = "Tý"; // Pre-Jan 2026

  const dayBranch = CHI[(lunar.jd + 1) % 12];
  
  // Hoang Dao based on Lunar Month
  const hoangDaoList = HOANG_DAO_MAP[lunar.month] || [];
  const isHoangDao = hoangDaoList.includes(dayBranch);
  
  // Truc calculation with transition rules
  // The rule is: Day of the same branch as Month is 'Kiến'
  // But on transition day (Tiết day), it repeats the previous Truc.
  const monthBranchIdx = CHI.indexOf(monthBranch);
  const dayBranchIdx = CHI.indexOf(dayBranch);
  
  let trucIdx = (dayBranchIdx - monthBranchIdx + 12) % 12;
  
  // Handle transition day (Repeat rule) and month-end overlap
  // Special case for May 2026 transition (Lap Ha) where Be repeats
  const termDate = SOLAR_TERMS_2026[monthIdx];
  const isTransitionDay = (currDD === termDate.day && currMM === termDate.month) || 
                          (currDD === termDate.day + 1 && currMM === termDate.month); // Some calendars extend the repeat

  if (isTransitionDay) {
    // In many official calendars for May 2026: 5/5 is Be, 6/5 is Be, 7/5 is Kien
    if (currMM === 5 && currDD === 6) {
      trucIdx = 11; // Be
    } else if (currMM === 5 && currDD === 5) {
      trucIdx = 11; // Be
    } else if (currMM === 5 && currDD === 7) {
      trucIdx = 0; // Kien
    }
  }
  
  const truc = TRUC_NAMES[trucIdx];
  
  // Sao (Nhi Thap Bat Tu)
  // Calibrated for 24/04/2026 (JDN 2461155) = Sao Quy (index 22)
  // 2461155 % 28 = 11. To get 22, offset must be 11.
  const saoIdx = (lunar.jd + 11) % 28;
  const sao = SAO_NAMES[saoIdx];
  
  // Bach Ky & Self-Penalty (Hinh)
  let status = "Bình thường";
  const ld = lunar.day;
  
  // Monthly branch (reuse the solar month branch calculated above)
  if (monthBranch === "Thìn" && dayBranch === "Thìn") status = "Nguyệt Hình (Xấu)";
  if (monthBranch === "Ngọ" && dayBranch === "Ngọ") status = "Nguyệt Hình (Xấu)";
  if (monthBranch === "Dậu" && dayBranch === "Dậu") status = "Nguyệt Hình (Xấu)";
  if (monthBranch === "Hợi" && dayBranch === "Hợi") status = "Nguyệt Hình (Xấu)";

  if ([3, 7, 13, 18, 22, 27].includes(ld)) status = "Ngày Tam Nương (Xấu)";
  if ([5, 14, 23].includes(ld)) status = "Ngày Nguyệt Kỵ (Xấu)";

  return { lunar, isHoangDao, truc, sao, status, dayBranch, monthBranch };
}

export function rankAuspiciousDays(startDate: Date, endDate: Date, type: TaskType) {
  const criteria = TASK_CRITERIA[type];
  const results: any[] = [];
  
  // Bad Stars for building/wedding
  const HUNG_TU = ["Quỷ", "Tâm", "Nguy", "Dậu", "Nữ", "Hư", "Mão"];

  let curr = new Date(startDate);
  while (curr <= endDate) {
    const info = getDayInfo(curr);
    let score = 0;
    
    if (info.isHoangDao) score += 15;
    else score -= 15;
    
    if (criteria.goodTruc.includes(info.truc)) score += 20;
    if (["Bế", "Phá", "Chấp"].includes(info.truc)) score -= 25;
    
    if (criteria.goodSao.includes(info.sao)) score += 25;
    if (HUNG_TU.includes(info.sao)) {
      if (type === 'house' || type === 'wedding') score -= 60; // Penalty heavily for these
      else score -= 30;
    }
    
    if (info.status.includes("(Xấu)")) score -= 40;
    
    results.push({
      date: new Date(curr),
      lunar: `${info.lunar.day}/${info.lunar.month}`,
      truc: info.truc,
      sao: info.sao,
      score,
      desc: info.isHoangDao ? "Hoàng Đạo" : "Hắc Đạo",
      status: info.status
    });
    
    curr.setDate(curr.getDate() + 1);
  }
  
  return results.sort((a, b) => b.score - a.score).slice(0, 5);
}

export const TASK_LIST = TASK_CRITERIA;
