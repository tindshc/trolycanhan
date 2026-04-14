import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const maleNames = [
    'Châu Khắc Cường', 
    'Nguyễn Văn Vũ Phước', 
    'Nguyễn Trương Thanh Tú', 
    'Phan Phước Trường', 
    'Tạ Thanh Cầm', 
    'Ngô Văn Thanh Hiệp', 
    'Huỳnh Đoàn Hưng', 
    'Nguyễn Công Tín', 
    'Đoàn Phương Bình'
];

async function updateGenders() {
    console.log('🚀 Updating genders for specific personnel...');
    
    const { error } = await supabase
        .from('nhansu')
        .update({ gender: 'Nam' })
        .in('full_name', maleNames);
        
    if (error) {
        console.error('❌ Error updating genders:', error.message);
    } else {
        console.log('✅ Successfully updated genders for:', maleNames.join(', '));
    }
}

updateGenders();
