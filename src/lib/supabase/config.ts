// Valores públicos (la publishable key está diseñada para exponerse en el navegador;
// la seguridad la da RLS). Se pueden sobrescribir con variables de entorno.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ptlpamubtydzcoufvxus.supabase.co";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_sXY463qzeMvPkUk7i-o_QA_pMO30MDM";
