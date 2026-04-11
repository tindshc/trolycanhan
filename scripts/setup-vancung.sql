-- SQL script to create the 'vancung_templates' table
CREATE TABLE IF NOT EXISTS public.vancung_templates (
  id SERIAL PRIMARY KEY,
  ceremony_type TEXT NOT NULL,
  location TEXT NOT NULL, -- 'outdoor' or 'indoor'
  lyrics TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ceremony_type, location)
);

-- Enable RLS
ALTER TABLE public.vancung_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for now" ON public.vancung_templates
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Insert Initial Templates
INSERT INTO public.vancung_templates (ceremony_type, location, lyrics) VALUES
('🎉 Tất niên', 'outdoor', 'Vật đổi sao dời – Năm cùng tháng kiệt – Xuân tiết gần sang – Đông tàn sắp hết – Trưa 29 (30) tết – Sửa lễ tất niên – Truy niệm tổ tiên – Theo như thường lệ - Tuế trừ cáo tế - Lễ bạc kính dâng – Phù tửu hương đăng – Lễ nghi cụ soạn – Thành kính cúi xin - Tiên linh chứng giám – phù hộ toàn gia – Lớn bé trẻ già – Bình yên khang thái.'),
('👋 Tiễn ông bà', 'outdoor', 'Trước án toạ kính cẩn thưa rằng : Tiệc Xuân đã mãn – Lễ tạ kính trình – Rước tiễn tiên linh – Lại về âm giới – Buổi đầu năm mới – Toàn gia mong đợi – Lưu phúc lưu ân – Kính cáo tôn thần – Phù trì phù hộ - Dương cơ âm mộ - Mọi chỗ tốt lành – Con cháu an ninh – Vận hành khang thái.'),
('🍼 Đầy tháng', 'outdoor', 'Phù hộ độ trì vuốt ve che chở, cho cháu được ăn ngon ngủ yên, hay ăn chóng lớn, vô bệnh vô tật, vô tai vô ương, vô hạn vô ách. Phù hộ cho cháu được tươi đẹp thông minh sáng láng. Thân mệnh bình yên cường tráng, kiếp kiếp được hưởng vinh hoa phú quí. Gia đình chúng con được phúc thọ an khang. Nhân lành nẩy nở, nghiệp dữ tiêu tan. Bốn mùa không hạn ách nghĩ lo. Xin thành tâm đĩnh lễ, cúi xin chứng giám lòng thành.'),
('🍎 Cúng ông Táo', 'outdoor', 'Nay cuối mùa đông, tứ quí theo vòng, hai hai (ba) tháng chạp, sửa lễ kính dâng, Hoa quả đèn hương, Xiêm hài áo mũ, Phỏng theo lễ cũ. Ngài là vị chủ. Ngũ tự gia thần. Soi xét lòng trần, Táo Quân chứng giám. Trong năm sai phạm, các tội lỗi lầm. Cúi xin tôn thần, gia ân châm chước. Ban lộc ban phước, phù hộ toàn gia, trai gái trẻ già, an ninh khang thái.'),
('🎇 Giao thừa', 'outdoor', 'Phút thiêng liêng giao thừa vừa tới - Pháo vang lừng đón buổi đầu xuân. Cầu mong vạn tượng canh tân - Tam dương khai thái cung trần lễ nghi. Nguyện tôn thần phù trì bảo hộ - Câu anh linh tiên tổ lưu ân. Ban cho con cháu hạ trần - An ninh khang thái muôn phần tốt tươi. Thiều quang chiếu rọi rạng ngời');
