import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables manually if not using a loader
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * Standardizes date from DD/MM/YYYY to YYYY-MM-DD
 */
function standardizeDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
}

/**
 * Simple CSV line parser that handles quoted values
 */
function parseCsvLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function importNhansu() {
  const fileName = process.argv[2] || 'data/nhansu_initial.csv';
  const csvPath = path.resolve(process.cwd(), fileName);
  
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: File not found at ${csvPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(csvPath, 'utf8');
  
  // Parser thông minh hơn xử lý cả dấu xuống dòng trong ngoặc kép
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < rawData.length; i++) {
    const char = rawData[i];
    const nextChar = rawData[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') { // Double quotes
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++; // Handle CRLF
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
  // Add last row if exists
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    console.log('No data to import.');
    return;
  }

  const firstRow = rows[0];
  const hasHeaders = firstRow.some(h => h.toLowerCase().includes('tt') || h.toLowerCase().includes('tên'));
  const startIndex = hasHeaders ? 1 : 0;

  const data = [];
  for (let i = startIndex; i < rows.length; i++) {
    const values = rows[i];
    if (values.length < 5) continue;

    const row = {
      id: parseInt(values[0]) || i + 1,
      full_name: values[1] || 'Chưa rõ',
      date_of_birth: standardizeDate(values[2]),
      department: values[3] || '',
      education_level: values[4] || '',
      specialization: values[5] || '',
      professional_title: values[6] || '',
      professional_code: values[7] || ''
    };
    data.push(row);
  }

  console.log(`Cleaning and standardizing ${data.length} records...`);

  const { error } = await supabase
    .from('nhansu')
    .upsert(data, { onConflict: 'id' });

  if (error) {
    console.error('Error importing data:', error.message);
  } else {
    console.log('Successfully imported personnel data to Supabase!');
  }
}

importNhansu().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
