import type { SupabaseClient } from "@supabase/supabase-js";
import { textoSinLeer } from "@/lib/proyectos";

// Mensajes sin leer por proyecto, para los listados (RLS filtra).
export async function cargarSinLeer(supabase: SupabaseClient): Promise<Record<string, number>> {
  const { data } = await supabase.rpc("mensajes_sin_leer");
  return Object.fromEntries(
    ((data ?? []) as { proyecto_id: string; cantidad: number }[]).map((f) => [f.proyecto_id, f.cantidad]),
  );
}

export function ChipSinLeer({ cantidad }: { cantidad?: number }) {
  if (!cantidad) return null;
  return (
    <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-xs font-semibold text-brand-orange-dark">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" aria-hidden />
      {textoSinLeer(cantidad)}
    </span>
  );
}
