import type { SupabaseClient } from "@supabase/supabase-js";
import type { OpcionCliente } from "@/components/admin/proyecto-form";

// Lista para el selector de cliente del formulario de proyecto.
export async function cargarOpcionesClientes(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("clientes")
    .select("id, tipo, nombre, nombre_fantasia, activo")
    .order("nombre");
  return (data ?? []) as OpcionCliente[];
}
