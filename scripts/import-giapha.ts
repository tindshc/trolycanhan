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

async function importGiapha() {
  const mdPath = path.resolve(process.cwd(), 'data/giapha.md');
  if (!fs.existsSync(mdPath)) {
    console.error(`File not found: ${mdPath}`);
    return;
  }

  // PRE-CLEANUP: Specific fix for the duplicate "Thiện" reported by user
  console.log('Cleaning up specific duplicate records...');
  // We keep the one with descendants (likely the original 330) and remove simpler duplicates
  await supabase.from('giapha').delete().eq('full_name', 'Nguyễn Văn Thiện').eq('generation', 12);

  const content = fs.readFileSync(mdPath, 'utf8');
  const lines = content.split('\n');

  let currentBranch = '';
  const parentOfGen: Record<number, number | null> = {};
  let lastId: number | null = null;
  let currentGenContext = 0;
  let generationOfBullet = 0;
  
  const stack: { indent: number; id: number; generation: number }[] = [];

  console.log('\n--- STARTING SMART-ALIAS GENEALOGY IMPORT ---');

  for (let line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || line.startsWith('---')) continue;

    if (line.startsWith('# ') || (trimmedLine.toUpperCase().startsWith('NHÁNH') && !trimmedLine.includes('Thế hệ'))) {
      currentBranch = trimmedLine.replace('# ', '').replace(/\*\*/g, '').trim();
      currentGenContext = 0;
      lastId = null;
      generationOfBullet = 0;
      continue;
    }

    const genMatch = trimmedLine.match(/(?:\*\*)?Thế hệ (\d+)(?:\*\*)?/i);
    if (genMatch) {
      const newGen = parseInt(genMatch[1]);
      if (newGen > currentGenContext && lastId) {
          parentOfGen[newGen] = lastId;
      }
      currentGenContext = newGen;
      continue;
    }

    const isPersonLine = (trimmedLine.includes('**') || trimmedLine.match(/^[1-9]\./) || trimmedLine.match(/^[├└│─]/) || isLikelyPerson(trimmedLine)) 
                        && !trimmedLine.includes('Xem nhánh chi tiết') 
                        && !trimmedLine.includes('trở xuống');
    
    if (isPersonLine) {
      const markerMatch = line.match(/[├└\*]|\d+\./);
      const markerPosRaw = markerMatch ? line.indexOf(markerMatch[0]) : 0;
      const prefix = line.substring(0, markerPosRaw);
      const indent = prefix.replace(/│/g, ' ').length;

      let rawName = trimmedLine.match(/\*\*(.*?)\*\*/) ? trimmedLine.match(/\*\*(.*?)\*\*/)![1] : trimmedLine.split('(')[0];
      let gender = (trimmedLine.includes('Thị') || trimmedLine.includes('Con gái')) ? 'Nữ' : 'Nam';
      if (trimmedLine.includes('Con trai')) gender = 'Nam';

      let cleanName = rawName
        .replace(/^[0-9\.\s├└│─-]+/g, '')
        .replace(/^(Con trai|Con gái|Vợ|Chồng):\s*/gi, '')
        .replace(/\*\*/g, '')
        .trim();

      if (!cleanName || cleanName.length < 2 || cleanName.toUpperCase().startsWith('THế HỆ')) continue;

      const isSpouse = (trimmedLine.includes('Vợ:') || trimmedLine.includes('Chồng:')) && !trimmedLine.includes('Con của');
      if (isSpouse) {
        if (lastId) {
          await supabase.from('giapha').update({ spouse_name: cleanName }).eq('id', lastId);
          console.log(`      💍 Spouse: ${cleanName}`);
        }
        continue;
      }

      const numberMatch = trimmedLine.match(/^(\d+)\./);
      if (numberMatch && indent === 0) {
          if (generationOfBullet > 0) currentGenContext = generationOfBullet;
          else generationOfBullet = currentGenContext;
      }

      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      let parentId: number | null = null;
      let actualGen = currentGenContext;

      if (indent > 0 && stack.length > 0) {
        parentId = stack[stack.length - 1].id;
        actualGen = stack[stack.length - 1].generation + 1;
      } else {
        parentId = parentOfGen[currentGenContext] || null;
      }

      // --- SMART UPSERT WITH ALIAS NORMALIZATION ---
      const normalizedQueryName = cleanName.split('(')[0].trim(); // Strip "(Duật)" for query
      
      let personId: number | null = null;
      const { data: existing } = await supabase.from('giapha')
        .select('id, full_name')
        .ilike('full_name', `%${normalizedQueryName}%`)
        .eq('generation', actualGen)
        .limit(1);

      if (existing && existing.length > 0) {
          personId = existing[0].id;
          console.log(`      🔄 Merging: [Gen ${actualGen}] ${cleanName} into existing ID: ${personId} (${existing[0].full_name})`);
          // Update parent and potentially refine the name to include alias if new file has it
          await supabase.from('giapha').update({ parent_id: parentId, full_name: cleanName }).eq('id', personId);
      } else {
          // Insert New
          const dateMatch = trimmedLine.match(/\((.*?)\)/);
          const dates = dateMatch ? (dateMatch[1].includes(' – ') ? dateMatch[1].split(' – ') : [dateMatch[1], null]) : [null, null];
          const { data, error } = await supabase.from('giapha').insert([{
            full_name: cleanName,
            generation: actualGen,
            gender,
            birth_day: (dates[0] || '').trim(),
            death_day: (dates[1] || '').trim(),
            parent_id: parentId,
            branch: currentBranch
          }]).select();

          if (data) {
            personId = data[0].id;
            console.log(`      ✅ Added: [Gen ${actualGen}] ${cleanName} (ID: ${personId})`);
          } else if (error) {
            console.error(`      ❌ Error:`, error.message);
          }
      }

      if (personId) {
        lastId = personId;
        stack.push({ indent, id: personId, generation: actualGen });
      }
    }
  }

  console.log('\n--- SMART IMPORT COMPLETED ---');
}

function isLikelyPerson(line: string): boolean {
    const t = line.trim();
    if (t.length < 3) return false;
    if (t.toUpperCase().startsWith('NHÁNH')) return false;
    if (t.includes('Thế hệ')) return false;
    if (t.includes('Xem nhánh chi tiết')) return false;
    if (t.includes('hệ 12 trở xuống')) return false;
    return true;
}

importGiapha().catch(console.error);
