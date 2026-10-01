import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { POLITICA_VERSION } from "@/lib/empresa";
import { esCargo, puede, type Accion, type Cargo, type RolEnProyecto } from "@/lib/permisos";

export type Perfil = {
  id: string;
  email: string | null;
  full_name: string | null;
  company: string | null;
  role: "cliente" | "admin" | "equipo";
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

export type MiembroEquipo = { id: string; nombre: string; cargo: Cargo };

// Integrante activo del equipo ProyIT (no incluye al super usuario).
export async function requireEquipo() {
  const ctx = await requireUsuario();
  if (ctx.perfil?.role !== "equipo") redirect("/portal");
  const { data: miembro } = await ctx.supabase
    .from("equipo")
    .select("id, nombre, cargo")
    .eq("user_id", ctx.user.id)
    .eq("activo", true)
    .maybeSingle<MiembroEquipo>();
  if (!miembro) redirect("/portal");
  return { ...ctx, miembro };
}

// Qué es el usuario dentro de un proyecto: "admin", su cargo si está asignado,
// o null si no participa. RLS aplica la misma regla en la base de datos.
export async function rolEnProyecto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  perfil: Perfil | null,
  proyectoId: string,
): Promise<RolEnProyecto | null> {
  if (perfil?.role === "admin") return "admin";
  if (perfil?.role !== "equipo") return null;
  const { data } = await supabase
    .from("proyecto_equipo")
    .select("equipo:equipo!inner(cargo, activo, user_id)")
    .eq("proyecto_id", proyectoId)
    .eq("equipo.user_id", userId)
    .eq("equipo.activo", true)
    .maybeSingle<{ equipo: { cargo: string } }>();
  return esCargo(data?.equipo.cargo) ? data.equipo.cargo : null;
}

// Para acciones sobre un proyecto: exige que el usuario pueda hacer `accion`.
export async function requirePermiso(proyectoId: string, accion: Accion) {
  const ctx = await requireUsuario();
  const rol = await rolEnProyecto(ctx.supabase, ctx.user.id, ctx.perfil, proyectoId);
  if (!puede(rol, accion)) redirect("/portal");
  return { ...ctx, rol: rol as RolEnProyecto };
}

// Home según el rol.
export function inicioSegunRol(rol: Perfil["role"] | undefined) {
  return rol === "admin" ? "/admin" : rol === "equipo" ? "/equipo" : "/portal";
}
