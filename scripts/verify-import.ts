import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function verify() {
  const { data, error } = await supabase
    .from('nhansu')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error fetching data:', error.message);
  } else {
    console.log('Successfully fetched records from Supabase:');
    console.table(data);
  }
}

verify();
