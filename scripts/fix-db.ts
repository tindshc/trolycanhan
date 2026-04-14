import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runFixes() {
    console.log('🚀 Running database fixes...');
    
    // 1. Update all genders to 'Nữ'
    console.log('Updating all genders to "Nữ"...');
    const { error: genderError } = await supabase.from('nhansu').update({ gender: 'Nữ' }).neq('id', 0); // Corrected filter
    if (genderError) console.error('❌ Error updating genders:', genderError.message);
    else console.log('✅ Updated genders successfully.');

    // 2. Sync sequence
    // Note: Supabase client doesn't allow running arbitrary SQL like setval directly.
    // I will tell the user to run this in the SQL Editor.
    console.log('⚠️ Please run the following SQL in Supabase SQL Editor to fix the Duplicate Key error:');
    console.log("\nSELECT setval('nhansu_id_seq', (SELECT MAX(id) FROM nhansu));\n");
}

runFixes();
