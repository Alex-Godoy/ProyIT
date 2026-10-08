"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { POLITICA_VERSION } from "@/lib/empresa";
import { ESTADOS_DIAGNOSTICO, HORARIOS, INTERESES } from "@/lib/sitio";

export type EstadoEnvio = { ok: boolean; error?: string } | null;

function texto(fd: FormData, campo: string, max: number) {
  const v = fd.get(campo);
  return typeof v === "string" && v.trim() !== "" ? v.trim().slice(0, max) : null;
}

// Si hay clave secreta de Turnstile, el captcha se valida aquí. Sin ella (p. ej.
// en desarrollo) el formulario funciona igual y solo quedan los otros frenos.
async function captchaValido(token: string | null) {
  const secreto = process.env.TURNSTILE_SECRET_KEY;
  if (!secreto) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: secreto, response: token }),
    });
    const datos = (await res.json()) as { success?: boolean };
    return datos.success === true;
  } catch {
    return false;
  }
}

export async function solicitarDiagnosticoAction(_prev: EstadoEnvio, fd: FormData): Promise<EstadoEnvio> {
  // Campo trampa: invisible para personas, los bots lo completan.
  if (texto(fd, "sitio_web", 200)) return { ok: true };

  const nombre = texto(fd, "nombre", 120);
  const email = texto(fd, "email", 200)?.toLowerCase() ?? null;
  const interes = texto(fd, "interes", 80);
  const horario = texto(fd, "horario", 20);

  if (!nombre || nombre.length < 2) return { ok: false, error: "Cuéntanos tu nombre." };
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Revisa tu correo: no parece válido." };
  if (fd.get("privacidad") !== "on")
    return { ok: false, error: "Para contactarte necesitamos que aceptes la política de privacidad." };
  if (!(await captchaValido(texto(fd, "captcha", 4000))))
    return { ok: false, error: "No pudimos verificar que no eres un robot. Inténtalo de nuevo." };

  const supabase = await createClient();
  const { error } = await supabase.from("solicitudes_diagnostico").insert({
    nombre,
    empresa: texto(fd, "empresa", 120),
    email,
    telefono: texto(fd, "telefono", 40),
    interes: interes && (INTERESES as readonly string[]).includes(interes) ? interes : null,
    mensaje: texto(fd, "mensaje", 2000),
    horario: HORARIOS.some((h) => h.valor === horario) ? horario : null,
    origen: texto(fd, "origen", 40),
    privacidad_version: POLITICA_VERSION,
  });

  if (error) {
    if (error.message.includes("demasiadas_solicitudes"))
      return { ok: false, error: "Ya recibimos tus solicitudes de hoy. Te contactaremos pronto." };
    return { ok: false, error: "No pudimos enviar tu solicitud. Inténtalo de nuevo en unos minutos." };
  }

  revalidatePath("/admin/diagnosticos");
  return { ok: true };
}

export async function actualizarDiagnosticoAction(id: string, fd: FormData) {
  const { supabase } = await requireAdmin();
  const estado = texto(fd, "estado", 20);
  await supabase
    .from("solicitudes_diagnostico")
    .update({
      estado: ESTADOS_DIAGNOSTICO.some((e) => e.valor === estado) ? estado : "nueva",
      notas: texto(fd, "notas", 4000),
    })
    .eq("id", id);
  revalidatePath("/admin/diagnosticos");
}
