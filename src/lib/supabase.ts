import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_API_URL;
const supabaseKey = import.meta.env.VITE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

export const supabase = createClient(supabaseUrl, supabaseKey);