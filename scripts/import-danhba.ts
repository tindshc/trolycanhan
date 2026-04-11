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

async function importDanhba() {
  const fileName = process.argv[2] || 'data/danhba_initial.csv';
  const csvPath = path.resolve(process.cwd(), fileName);
  
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: File not found at ${csvPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(csvPath, 'utf8');
  
  // Reuse the smart parser logic
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < rawData.length; i++) {
    const char = rawData[i];
    const nextChar = rawData[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      }
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    console.log('No data found.');
    return;
  }

  // Detect headers: DANHBA,DV,HOTEN,CHUCVU,DTBAN,DIDONG,File
  const firstRow = rows[0];
  const hasHeaders = firstRow.some(h => h.toUpperCase().includes('HOTEN') || h.toUpperCase().includes('DANHBA'));
  const startIndex = hasHeaders ? 1 : 0;

  const data = [];
  for (let i = startIndex; i < rows.length; i++) {
    const values = rows[i];
    if (values.length < 3) continue;

    // Mapping: HOTEN (index 2), CHUCVU (index 3), DTBAN (index 4), DIDONG (index 5)
    data.push({
      full_name: values[2] || 'Không tên',
      position: values[3] || '',
      landline: values[4] || '',
      mobile: values[5] || '',
      birth_year: '' // Placeholder for NAMSINH
    });
  }

  console.log(`Importing ${data.length} contacts to Supabase...`);

  const { error } = await supabase
    .from('danhba')
    .insert(data);

  if (error) {
    console.error('Error importing contacts:', error.message);
  } else {
    console.log('Successfully imported contacts!');
  }
}

importDanhba().catch(console.error);
