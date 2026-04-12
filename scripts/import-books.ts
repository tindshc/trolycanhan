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

async function importBooks() {
  console.log('📚 Starting Book Import...');

  const docsachPath = path.join(process.cwd(), 'data/docsach_dan_so.md');
  if (!fs.existsSync(docsachPath)) {
    console.error('File not found: ' + docsachPath);
    return;
  }

  const content = fs.readFileSync(docsachPath, 'utf8');
  const lines = content.split('\n');

  let currentBookId: number | null = null;
  let bookTitle = '';
  let author = '';
  let year = '';
  
  // 1. Parse Metadata and Title (Header #)
  const titleLines = lines.filter(l => l.startsWith('# '));
  if (titleLines.length > 0) {
    bookTitle = titleLines.map(l => l.replace('# ', '').trim()).join(' - ');
    
    // Look for Năm biên soạn or Năm xuất bản
    const yearLine = lines.find(l => l.includes('**Năm biên soạn:**') || l.includes('**Năm xuất bản:**'));
    if (yearLine) {
       year = yearLine.split(':**')[1].trim();
    }
    
    const authorLine = lines.find(l => l.includes('**Tác giả:**'));
    author = authorLine ? authorLine.split('**Tác giả:**')[1].trim() : 'Nhiều tác giả';
  }

  if (!bookTitle) {
    console.error('No book title found (Heading # is required).');
    return;
  }

  // Upsert Book
  const { data: book, error: bError } = await supabase.from('books').upsert({ title: bookTitle, author, year }, { onConflict: 'title' }).select().single();
  if (bError) return console.error('Error upserting book:', bError);
  currentBookId = book.id;
  console.log(`📖 Book: ${bookTitle} (ID: ${currentBookId})`);

  // 2. Parse Sections (Headings ## and ###)
  // We'll split the content by ## or ### headings
  const sections: { title: string; content: string; level: number }[] = [];
  let currentSecTitle = '';
  let currentSecContent: string[] = [];
  let currentLevel = 0;

  // Simple parser for hierarchical sections
  for (let line of lines) {
    if (line.startsWith('## ') || line.startsWith('### ')) {
      // Save previous section
      if (currentSecTitle) {
        sections.push({ title: currentSecTitle, content: currentSecContent.join('\n').trim(), level: currentLevel });
      }
      // Start new section
      currentLevel = line.startsWith('## ') ? 2 : 3;
      currentSecTitle = line.replace(/^#+ /, '').trim();
      currentSecContent = [];
    } else if (currentSecTitle) {
      if (!line.includes('**Tác giả:**') && !line.includes('**Năm xuất bản:**') && !line.startsWith('# ')) {
          currentSecContent.push(line);
      }
    }
  }
  // Push last section
  if (currentSecTitle) {
    sections.push({ title: currentSecTitle, content: currentSecContent.join('\n').trim(), level: currentLevel });
  }

  // Clear and Insert Sections
  await supabase.from('book_sections').delete().eq('book_id', currentBookId);
  const insertData = sections.map((s, idx) => ({
    book_id: currentBookId,
    title: s.title,
    content: s.content,
    order_index: idx,
    level: s.level
  }));

  const { error: sError } = await supabase.from('book_sections').insert(insertData);
  if (sError) console.error('Error inserting sections:', sError);
  else console.log(`✅ Imported ${sections.length} sections for ${bookTitle}.`);

  console.log('🎉 Book Import Complete!');
}

importBooks();
