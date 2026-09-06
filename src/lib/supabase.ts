import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim() || "https://placeholder.supabase.co";
const candidateKey = [
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
].find((k) => k && !k.includes("placeholder") && !k.includes("your-") && k.trim().length > 20)?.trim() || "placeholder-key";

export const supabase = createClient(supabaseUrl, candidateKey);
