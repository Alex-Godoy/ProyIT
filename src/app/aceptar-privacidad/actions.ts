"use server";

import { redirect } from "next/navigation";
import { requireUsuario } from "@/lib/auth";
import { POLITICA_VERSION } from "@/lib/empresa";

export async function aceptarPoliticaAction(fd: FormData) {
  if (fd.get("acepto") !== "on") redirect("/aceptar-privacidad");
  const { supabase, user } = await requireUsuario({ sinPolitica: true });
  // La fecha de aceptación la fija la base de datos (trigger), no el cliente.
  await supabase.from("profiles").update({ privacidad_version: POLITICA_VERSION }).eq("id", user.id);
  redirect("/portal");
}
