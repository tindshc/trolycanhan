import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
async function check() {
  const { data, error } = await supabase.from('giapha').select('id, full_name, parent_id, generation').order('id');
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}
check();
