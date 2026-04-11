import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function importResume() {
  console.log('🚀 Starting Resume Import...');

  // 1. Import Training & Education
  const daoTaoPath = path.join(process.cwd(), 'data/lilich_dao_tao.md');
  if (fs.existsSync(daoTaoPath)) {
    const content = fs.readFileSync(daoTaoPath, 'utf8');
    
    // Section A: Đào tạo
    const trainingMatch = content.match(/## A\. Đào tạo\s*\n\n\|[\s\S]*?\|\n([\s\S]*?)(?=\n\n##|$)/);
    if (trainingMatch) {
      const rows = trainingMatch[1].trim().split('\n').slice(1); // Skip separator
      const data = rows.map(row => {
        const cols = row.split('|').map(c => c.trim()).filter(Boolean);
        if (cols.length < 6) return null;
        return { school: cols[1], specialty: cols[2], period: cols[3], mode: cols[4], degree: cols[5] };
      }).filter(Boolean);
      await supabase.from('resume_training').delete().neq('id', 0);
      await supabase.from('resume_training').insert(data);
      console.log(`✅ Imported ${data.length} training records.`);
    }

    // Section B: Bồi dưỡng
    const educationMatch = content.match(/## B\. Bồi dưỡng\s*\n\n\|[\s\S]*?\|\n([\s\S]*?)(?=\n\n##|$)/);
    if (educationMatch) {
      const rows = educationMatch[1].trim().split('\n').slice(1);
      const data = rows.map(row => {
        const cols = row.split('|').map(c => c.trim()).filter(Boolean);
        if (cols.length < 6) return null;
        return { center: cols[1], content: cols[2], period: cols[3], mode: cols[4], certificate: cols[5] };
      }).filter(Boolean);
      await supabase.from('resume_education').delete().neq('id', 0);
      await supabase.from('resume_education').insert(data);
      console.log(`✅ Imported ${data.length} education records.`);
    }
  }

  // 2. Import Rewards & Discipline
  const khenThuongPath = path.join(process.cwd(), 'data/lilich_khen_thuong.md');
  if (fs.existsSync(khenThuongPath)) {
    const content = fs.readFileSync(khenThuongPath, 'utf8');

    // Section A: Khen thưởng
    const rewardsMatch = content.match(/## A\. Khen thưởng\s*\n\n\|[\s\S]*?\|\n([\s\S]*?)(?=\n\n##|$)/);
    if (rewardsMatch) {
      const rows = rewardsMatch[1].trim().split('\n').slice(1);
      const data = rows.map(row => {
        const cols = row.split('|').map(c => c.trim()).filter(Boolean);
        if (cols.length < 3) return null;
        return { date_str: cols[0], content: cols[1], authority: cols[2] };
      }).filter(Boolean);
      await supabase.from('resume_rewards').delete().neq('id', 0);
      await supabase.from('resume_rewards').insert(data);
      console.log(`✅ Imported ${data.length} reward records.`);
    }

    // Section B: Kỷ luật
    const disciplineMatch = content.match(/## B\. Kỷ luật\s*\n\n\|[\s\S]*?\|\n([\s\S]*?)(?=\n\n##|$)/);
    if (disciplineMatch) {
      const rows = disciplineMatch[1].trim().split('\n').slice(1);
      const data = rows.map(row => {
        const cols = row.split('|').map(c => c.trim()).filter(Boolean);
        if (cols.length < 4) return null;
        if (cols[1] === 'Không') return null;
        return { date_str: cols[0], reason: cols[1], form: cols[2], authority: cols[3] };
      }).filter(Boolean);
      await supabase.from('resume_discipline').delete().neq('id', 0);
      await supabase.from('resume_discipline').insert(data);
      console.log(`✅ Imported ${data.length} discipline records.`);
    }
  }

  // 3. Import Family Relationships
  const giaDinhPath = path.join(process.cwd(), 'data/lilich_gia_dinh.md');
  if (fs.existsSync(giaDinhPath)) {
    const content = fs.readFileSync(giaDinhPath, 'utf8');
    const sections = [
      { id: 'A', name: 'Bản thân, Vợ và Con', label: 'Bản thân/Vợ/Con' },
      { id: 'B', name: 'Quan hệ gia đình bên nội & ngoại', label: 'Nội/Ngoại' },
      { id: 'C', name: 'Cô, Bác, Chú, Cậu, Dì bên bản thân', label: 'Cô/Dì/Chú/Bác' },
      { id: 'D', name: 'Quan hệ gia đình bên vợ', label: 'Bên vợ' }
    ];

    await supabase.from('resume_family').delete().neq('id', 0);
    
    for (const section of sections) {
      const regex = new RegExp(`## ${section.id}\\. ${section.name.replace(/&/g, '&')}\\s*\\n\\n\\|[\\s\\S]*?\\|\\n([\\s\\S]*?)(?=\\n\\n---|$|\\n\\n##)`);
      const match = content.match(regex);
      if (match) {
        const rows = match[1].trim().split('\n').slice(1);
        const data = rows.map(row => {
          const cols = row.split('|').map(c => c.trim()).filter(Boolean);
          if (cols.length < 4) return null;
          return { 
            group_type: section.label,
            relationship: cols[0],
            full_name: cols[1],
            birth_year: cols[2],
            occupation: cols[3],
            details: cols[4] || ''
          };
        }).filter(Boolean);
        await supabase.from('resume_family').insert(data);
        console.log(`✅ Imported ${data.length} records for ${section.label}.`);
      }
    }
  }

  console.log('🎉 Resume Import Complete!');
}

importResume();
