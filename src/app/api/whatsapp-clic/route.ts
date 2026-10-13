import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { BOTONES_WHATSAPP } from "@/lib/sitio";

// Cuenta un clic en un botón de WhatsApp del sitio (lo envía EnlaceWhatsApp con
// sendBeacon). Solo se aceptan botones conocidos.
export async function POST(request: Request) {
  const boton = (await request.text()).trim();
  if (!Object.hasOwn(BOTONES_WHATSAPP, boton)) return new Response(null, { status: 400 });

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { error } = await supabase.from("clics_whatsapp").insert({ origen: boton });
  return new Response(null, { status: error ? 500 : 204 });
}
