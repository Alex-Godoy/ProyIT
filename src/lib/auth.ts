import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { POLITICA_VERSION } from "@/lib/empresa";

export type Perfil = {
  id: string;
  email: string | null;
  full_name: string | null;
  company: string | null;
  role: "cliente" | "admin";
  privacidad_version: string | null;
  privacidad_aceptada_at: string | null;
  created_at: string;
};

// Devuelve el cliente de Supabase junto al usuario y su perfil, o manda a /login.
// Si no aceptó la versión vigente de la política de privacidad, lo manda a
// aceptarla antes de mostrar cualquier dato (salvo `sinPolitica`).
export async function requireUsuario({ sinPolitica = false }: { sinPolitica?: boolean } = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("id, email, full_name, company, role, privacidad_version, privacidad_aceptada_at, created_at")
    .eq("id", user.id)
    .maybeSingle<Perfil>();

  if (!sinPolitica && perfil?.privacidad_version !== POLITICA_VERSION) redirect("/aceptar-privacidad");

  return { supabase, user, perfil };
}

export async function requireAdmin() {
  const ctx = await requireUsuario();
  if (ctx.perfil?.role !== "admin") redirect("/portal");
  return ctx;
}
