import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const PROJECTS_RAW = `
CTMT	Chương trình mục tiêu Y tế- Dân số
DANCT	Đề án Người cao tuổi
CTDCMS	Chương trình điều chỉnh mức sinh
DVKHHGD	Chương trình Củng cố, phát triển và nâng cao chất lượng dịch vụ kế hoạch hóa gia đình đến năm 2030 tại thành phố Đà Nẵng
SLTSSS	Chương trình mở rộng tầm soát, chẩn đoán, điều trị một số bệnh, tật trước sinh và sơ sinh
TTDS	Chương trình Truyền thông Dân số 
HTTT	Chương trình củng cố và phát triển hệ thống thông tin chuyên ngành dân số
`;

const ACTIVITIES_RAW = `
HDHDDA0	1. Hội nghị sinh hoạt thường kỳ Câu lạc bộ Tư vấn và chăm sóc sức khỏe người cao tuổi dựa vào cộng đồng về Hướng dẫn các kỹ năng phòng bệnh, chữa bệnh và tự chăm sóc sức khoẻ cho NCT.
HDHDDA1	2. Hưởng ứng nhân sự kiện Tháng hành động và Ngày quốc tế NCT (01/10) tại TTYT (01 băng rôn) và 13 TYT (01 băng rôn/trạm)
HDHDDA2	3. Tổ chức hướng dẫn tập trung (nói chuyện chuyên đề) để phổ biến về kiến thức CSSK cho NCT
HDHDDA3	4. Truyền thông trên phương tiện truyền thanh: Bồi dưỡng phát thanh viên 25.000 đ lần x 12 lần/năm x 13 phường, Chi biên tập 80.000 đ/trang/350 từ đến dưới 600 từ x12 bài /năm x 13 phường,
HDHDDA4	1. Nói chuyện chuyên đề tại cộng đồng về mất cân bằng giới tính khi sinh tại 6/13 phường
HDHDDA5	2. Hội nghị sinh hoạt thường kỳ Câu lạc bộ liên thế hệ thực hiện truyền thông ksmcbgt ks tại 13 phường (13 phường x 1 lần/quý x 3 quý)
HDHDDA6	3. Nói chuyện chuyên đề tại cộng đồng về lợi ích tham gia sàng lọc trước sinh, sơ sinh 6/13 phường
HDHDDA7	4. Hỗ trợ chi phí thực hiện dich vụ sàng lọc, chuẩn đoán trước sinh và sơ sinh cho đối tượng miễn phí
HDHDDA8	5. Hội nghị sinh hoạt ngoại khóa phối hợp tuyên truyền phổ biến kiến thức về Dân số, chăm sóc SKSS VTN, giới, giới tính tại 13 trường THCS (100 em/buổi x 13 buổi)
HDHDDA9	6. Hội nghị sinh hoạt thường kỳ Câu lạc bộ Tư vấn và khám sức khỏe tiền hôn nhân 13 phường
HDHDDA10	7. Ngày Dân số Thế giới (11/7): treo băng rôn tại 13 điểm TYT
HDHDDA11	8. Ngày tránh thai Thế giới (26/9): treo băng rôn tại 13 điểm TYT
HDHDDA12	9. Ngày Dân số Việt Nam (26/12): Tổ chức hoạt động nhân ngày DS VN 26/12, treo băng rôn, làm xe hoa tham dự ngày Mittinh DS VN 26/12
HDHDDA13	10. Tổ chức các buổi Hội nghị hướng dẫn tập trung về SKSS/KHHGĐ trong Chiến dịch truyền thông lồng ghép với cung cấp dịch vụ DS-KHHGĐ (theo thực trạng mức sinh từng địa bàn) 6/13 phường)
HDHDDA14	11. Củng cố và phát triển hệ thống thông tin chuyên ngành dân số
HDHDDA15	12. Họp giao ban CTV Dân số - Y tế mỗi tháng/lần /phường 
HDHDDA16	13. Báo cáo + Bảng kiểm CTV DS-YT-TE
HDHDDA17	1. Nói chuyện chuyên đề Chương trình điều chỉnh mức sinh phù hợp các vùng, đối tượng. Đối tượng là các cặp vợ chồng trong độ tuổi sinh đẻ có 01 con; các cặp đã kết hôn nhưng chưa có con, nam nữ thanh niên trong độ tuổi kết hôn……
HDHDDA18	4, Hội nghị sơ kết Đề án chăm sóc sức khỏe người cao tuổi trên địa bàn quận giai đoạn 2022-2025
HDHDDA19	6, Nói chuyện chuyên đề về hỗ trợ sinh sản, dự phòng vô sinh tại cộng đồng, hệ luỵ của phá thai không an toàn
HDHDDA20	7, Tổ chức mô hình cung cấp dịch vụ, lồng ghép truyền thông về kế hoạch hoá gia đình/sức khoẻ sinh sản cho đối tượng là: người dân đi biển dài ngày, nam nữ trong độ tuổi sinh đẻ… (1 đợt/phường x 13 phường)
HDHDDA21	5, Nói chuyện chuyên đề về sức khỏe tiền hôn nhân góp phần nâng cao chất lượng dân số cho thanh niên, nam nữ chuẩn bị kết hôn tại cộng đồng về THN(Tập trung cho các đối tượng: thanh niên, nam nữ chuẩn bị kết hôn). 
HDHDDA22	6, Ngày Thalassemia Thế giới (8/5): treo băng rôn tại 13 điểm TYT
HDHDDA23	12, Đổi sổ ghi chép ban đầu về dân số (Sổ hộ gia đình) định kỳ 5 năm 2026-2030
HDHDDA24	10, Làm mới pano tuyên truyền: sửa chữa pano đã hư hỏng (2 cụm pano), và hoạt động chi tiêt
`;

const TASK_TYPES_RAW = `
BCV	Báo cáo viên
NU	Nước uống
BR	Băng rôn
HT	Hội trường
PTBT	Phát thanh và biên tập
PIN	Pin
SLTS	Sàng lọc trước sinh
SLSS	Sàng lọc sơ sinh
XETT	Xe tuyên truyền
INPTT	In PTT
CNPTT	Cập nhật PTT
GSPTT	Giám sát PTT
PHOTOBC	Photo Báo cáo
MTBR	Treo cờ nheo Mittinh
MTHOA	Hoa tươi Mittinh
MTNU	Nước uống Mittinh
MTPHUON	Phướn Mittinh
MTPHOTO	Photo Mittinh
MTPV	Phục vụ Mittinh
A0IN	In trang ruột sổ A0
A0DONG	Đóng tập sổ A0 
MTCO	Cờ Mittinh
MTPN	Pano Mitinh
SUAPN	Sửa Pano
MTVN	Âm thanh, ánh sáng, văn nghệ Mittinh
`;

const EXPENSES_RAW = `
HDDA39	2025	DANCT	HDHDDA0	BCV	36	300	10800	
HDDA40	2025	DANCT	HDHDDA0	NU	1800	20	36000	35 người/phường x 13 phường x 3 quý
HDDA41	2025	DANCT	HDHDDA1	BR	10	400	4000	
HDDA42	2025	DANCT	HDHDDA2	BCV	36	500	18000	
HDDA43	2025	DANCT	HDHDDA2	NU	450	20	9000	100 người/phường x 13 phường x 2 lần
HDDA46	2025	CTMT	HDHDDA4	BCV	5	500	2500	
HDDA47	2025	CTMT	HDHDDA4	NU	250	20	5000	50 người x 6 buổi
HDDA50	2025	CTMT	HDHDDA5	BCV	36	300	10800	
HDDA51	2025	CTMT	HDHDDA5	NU	1800	20	36000	35 người/quý/ phường x 13 phường x 4 quý
HDDA52	2025	SLTSSS	HDHDDA6	BCV	5	500	2500	
HDDA53	2025	SLTSSS	HDHDDA6	NU	250	20	5000	50 người x 6 buổi
HDDA55	2025	SLTSSS	HDHDDA7	SLTS	3	568,2	1704,6	Gói xét nghiệm sàng lọc trước sinh cơ bản
HDDA56	2025	SLTSSS	HDHDDA7	SLSS	3	327	981	Gói xét nghiệm sàng lọc sơ sinh cơ bản
HDDA57	2025	DVKHHGD	HDHDDA8	BCV	9	500	4500	
HDDA58	2025	DVKHHGD	HDHDDA8	NU	900	20	18000	100 người x 13 buổi
HDDA60	2025	CTMT	HDHDDA9	BCV	36	300	10800	
HDDA61	2025	CTMT	HDHDDA9	NU	1800	20	36000	35 người/quý/ phường x 13 phường x 4 quý
HDDA64	2025	TTDS	HDHDDA12	XETT	1	15000	15000	
HDDA69	2025	HTTT	HDHDDA14	INPTT	16512	0,35	5779,2	344 CTV x 4 phiếu/tháng x 12 tháng x 350 đồng/phiếu
HDDA70	2025	HTTT	HDHDDA14	CNPTT	4900	5	24500	(5.000đ/hộ có thông tin biến động cập nhật)
HDDA72	2025	CTMT	HDHDDA15	NU	4668	5	23340	(344 CTV+ 05 CBYT...): Nước uống
HDDA74	2025	CTDCMS	HDHDDA17	BCV	9	500	4500	
HDDA75	2025	CTDCMS	HDHDDA17	NU	450	20	9000	50 người x 13 buổi
HDDA79	2025	DVKHHGD	HDHDDA19	BCV	5	500	2500	
HDDA80	2025	DVKHHGD	HDHDDA19	NU	250	20	5000	50 người x 6 buổi
HDDA86	2025	TTDS	HDHDDA12	MTVN	1	16000	16000	
HDDA87	2025	TTDS	HDHDDA12	MTBR	50	200	10000	300.000 đồng/băng rôn * 15 điểm
HDDA88	2025	TTDS	HDHDDA12	MTHOA	1	4500	4500	đôn hoa, lãng hoa, đĩa hoa
HDDA89	2025	TTDS	HDHDDA12	MTNU	800	5	4000	
HDDA89	2025	TTDS	HDHDDA12	MTPN	2	2000	4000	
HDDA91	2025	TTDS	HDHDDA12	MTPHUON	50	200	10000	
HDDA92	2025	TTDS	HDHDDA12	MTPV	1	1000	1000	
`;

function parseDecimal(str: string): number {
  if (!str) return 0;
  // Replace comma with dot
  const normalized = str.replace(',', '.');
  return parseFloat(normalized);
}

async function run() {
  console.log('--- Starting Project Expense Ingestion ---');

  // 1. PROJECTS
  const projects = PROJECTS_RAW.trim().split('\n').map(line => {
    const [code, ...nameParts] = line.split('\t');
    return { code: code.trim(), name: nameParts.join('\t').trim() };
  }).filter(p => p.code);

  const { error: pErr } = await supabase.from('pe_projects').upsert(projects);
  console.log('Projects upserted:', pErr || 'Success');

  // 2. ACTIVITIES
  const activities = ACTIVITIES_RAW.trim().split('\n').map(line => {
    const [code, ...nameParts] = line.split('\t');
    return { code: code.trim(), name: nameParts.join('\t').trim() };
  }).filter(a => a.code);

  const { error: aErr } = await supabase.from('pe_activities').upsert(activities);
  console.log('Activities upserted:', aErr || 'Success');

  // 3. TASK TYPES
  const taskTypes = TASK_TYPES_RAW.trim().split('\n').map(line => {
    const [code, ...nameParts] = line.split('\t');
    return { code: code.trim(), name: nameParts.join('\t').trim() };
  }).filter(t => t.code);

  const { error: tErr } = await supabase.from('pe_task_types').upsert(taskTypes);
  console.log('Task Types upserted:', tErr || 'Success');

  // 4. EXPENSES
  const expenses = EXPENSES_RAW.trim().split('\n').map(line => {
    const parts = line.split('\t');
    if (parts.length < 8) return null;
    return {
      record_code: parts[0].trim(),
      year: parseInt(parts[1]),
      project_code: parts[2].trim(),
      activity_code: parts[3].trim(),
      task_code: parts[4].trim(),
      qty: parseDecimal(parts[5]),
      price: parseDecimal(parts[6]),
      total: parseDecimal(parts[7]),
      note: (parts[8] || '').trim()
    };
  }).filter(e => e && e.record_code);

  const { error: eErr } = await supabase.from('pe_expenses').insert(expenses);
  console.log('Expenses inserted:', eErr || 'Success');
}

run();
