import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qjrwiyqqwcpjvdlbadda.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_e_mN81Eb8v476rYpkMrGAA_d_GWM6mD";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
