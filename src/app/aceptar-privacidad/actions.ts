"use server";

import { redirect } from "next/navigation";
import { requireUsuario } from "@/lib/auth";
import { POLITICA_VERSION } from "@/lib/empresa";
import { destinoSeguro } from "@/lib/destino";

export async function aceptarPoliticaAction(fd: FormData) {
  const valor = fd.get("siguiente");
  // Solo rutas internas del portal (ver destinoSeguro).
  const siguiente = destinoSeguro(typeof valor === "string" ? valor : null);
  if (fd.get("acepto") !== "on") redirect(`/aceptar-privacidad?siguiente=${encodeURIComponent(siguiente)}`);
  const { supabase, user } = await requireUsuario({ sinPolitica: true });
  // La fecha de aceptación la fija la base de datos (trigger), no el cliente.
  await supabase.from("profiles").update({ privacidad_version: POLITICA_VERSION }).eq("id", user.id);
  // Vuelve a donde iba (p. ej. "Nuevo ticket").
  redirect(siguiente);
}
