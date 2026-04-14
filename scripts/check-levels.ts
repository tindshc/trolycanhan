import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data, error } = await supabase.from('nhansu').select('education_level');
    if (error) {
        console.error('Error:', error.message);
        return;
    }
    const levels = new Set(data.map(d => d.education_level));
    console.log('Unique education levels:', Array.from(levels));
}

checkData();
