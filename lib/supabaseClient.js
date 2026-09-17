import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client ini dipakai di seluruh aplikasi untuk bicara ke Supabase
// (autentikasi, database, dan storage gambar).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
