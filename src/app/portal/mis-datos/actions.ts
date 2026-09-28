"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUsuario } from "@/lib/auth";
import { TIPOS_SOLICITUD } from "@/lib/derechos";

const RUTA = "/portal/mis-datos";

function texto(fd: FormData, campo: string, max = 2000) {
  const v = fd.get(campo);
  return typeof v === "string" && v.trim() !== "" ? v.trim().slice(0, max) : null;
}

// Rectificación directa de los datos que la persona controla.
export async function actualizarMisDatosAction(fd: FormData) {
  const { supabase, user } = await requireUsuario();
  const full_name = texto(fd, "full_name", 120);
  if (!full_name) redirect(`${RUTA}?aviso=nombre_vacio`);

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, company: texto(fd, "company", 120) })
    .eq("id", user.id);
  if (error) redirect(`${RUTA}?aviso=error`);

  revalidatePath("/portal", "layout");
  redirect(`${RUTA}?aviso=datos_guardados`);
}

export async function crearSolicitudAction(fd: FormData) {
  const { supabase, user } = await requireUsuario();
  const tipo = texto(fd, "tipo", 20);
  if (!tipo || !TIPOS_SOLICITUD.some((t) => t.valor === tipo)) redirect(`${RUTA}?aviso=tipo_invalido`);

  // El correo y el plazo de respuesta los completa la base de datos.
  const { error } = await supabase
    .from("solicitudes_derechos")
    .insert({ user_id: user.id, email: user.email ?? "", tipo, detalle: texto(fd, "detalle") });
  if (error) redirect(`${RUTA}?aviso=error`);

  revalidatePath(RUTA);
  revalidatePath("/admin", "layout");
  redirect(`${RUTA}?aviso=solicitud_enviada#solicitudes`);
}
