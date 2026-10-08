"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { enviarCorreo, escaparHtml } from "@/lib/correo";
import { POLITICA_VERSION } from "@/lib/empresa";
import { AVISOS_DIAGNOSTICO_PARA, ESTADOS_DIAGNOSTICO, HORARIOS, INTERESES, PORTAL_URL } from "@/lib/sitio";

export type EstadoEnvio = { ok: boolean; error?: string } | null;

function texto(fd: FormData, campo: string, max: number) {
  const v = fd.get(campo);
  return typeof v === "string" && v.trim() !== "" ? v.trim().slice(0, max) : null;
}

// Campos de una sola línea: sin saltos ni espacios repetidos (van al asunto
// y al encabezado del aviso por correo).
function linea(fd: FormData, campo: string, max: number) {
  return texto(fd, campo, max)?.replace(/\s+/g, " ") ?? null;
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

type NuevaSolicitud = {
  id: string;
  nombre: string;
  empresa: string | null;
  email: string;
  telefono: string | null;
  interes: string | null;
  mensaje: string | null;
  horario: string | null;
  origen: string | null;
};

// Aviso interno al equipo comercial. Todo lo que escribió el visitante se
// escapa antes de ir al HTML; "Responder" le contesta directo a la persona.
async function avisarNuevaSolicitud(s: NuevaSolicitud, urlAdmin: string) {
  const para = (process.env.AVISOS_DIAGNOSTICO_PARA?.split(",") ?? AVISOS_DIAGNOSTICO_PARA)
    .map((c) => c.trim())
    .filter(Boolean);
  if (para.length === 0) return;

  const horario = HORARIOS.find((h) => h.valor === s.horario)?.etiqueta ?? null;
  const filas: [string, string | null][] = [
    ["Nombre", s.nombre],
    ["Empresa", s.empresa],
    ["Correo", s.email],
    ["WhatsApp / teléfono", s.telefono],
    ["Le interesa", s.interes],
    ["Prefiere conversar", horario],
    ["Botón usado", s.origen],
  ];
  const visibles = filas.filter((f): f is [string, string] => Boolean(f[1]));

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#0f1c2e;max-width:560px">
  <p style="margin:0 0 4px;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#1f6aa8">Nueva solicitud de diagnóstico</p>
  <h1 style="margin:0 0 16px;font-size:20px">${escaparHtml(s.nombre)}${s.empresa ? ` · ${escaparHtml(s.empresa)}` : ""}</h1>
  <table style="border-collapse:collapse;width:100%;font-size:14px">${visibles
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#5b6b80;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0">${escaparHtml(v)}</td></tr>`,
    )
    .join("")}</table>
  ${s.mensaje ? `<p style="margin:16px 0 4px;color:#5b6b80;font-size:13px">Lo que le duele hoy</p><p style="margin:0;padding:12px;background:#f4f7fb;border-radius:8px;font-size:14px;white-space:pre-line">${escaparHtml(s.mensaje)}</p>` : ""}
  <p style="margin:24px 0"><a href="${escaparHtml(urlAdmin)}" style="display:inline-block;background:#061e4a;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px;font-weight:bold">Gestionar en el portal</a></p>
  <p style="margin:0;color:#5b6b80;font-size:12px">Responde este correo para escribirle directamente a ${escaparHtml(s.nombre)}.</p>
</div>`;

  const texto = [
    "Nueva solicitud de diagnóstico",
    "",
    ...visibles.map(([k, v]) => `${k}: ${v}`),
    ...(s.mensaje ? ["", "Lo que le duele hoy:", s.mensaje] : []),
    "",
    `Gestionar: ${urlAdmin}`,
  ].join("\n");

  await enviarCorreo({
    para,
    asunto: `Nueva solicitud de diagnóstico: ${s.nombre}${s.empresa ? ` (${s.empresa})` : ""}`,
    html,
    texto,
    responderA: s.email,
    idempotencia: `diagnostico-${s.id}`,
  });
}

export async function solicitarDiagnosticoAction(_prev: EstadoEnvio, fd: FormData): Promise<EstadoEnvio> {
  // Campo trampa: invisible para personas, los bots lo completan.
  if (texto(fd, "sitio_web", 200)) return { ok: true };

  const nombre = linea(fd, "nombre", 120);
  const email = texto(fd, "email", 200)?.toLowerCase() ?? null;
  const interes = texto(fd, "interes", 80);
  const horario = texto(fd, "horario", 20);

  if (!nombre || nombre.length < 2) return { ok: false, error: "Cuéntanos tu nombre." };
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Revisa tu correo: no parece válido." };
  if (fd.get("privacidad") !== "on")
    return { ok: false, error: "Para contactarte necesitamos que aceptes la política de privacidad." };
  if (!(await captchaValido(texto(fd, "captcha", 4000))))
    return { ok: false, error: "No pudimos verificar que no eres un robot. Inténtalo de nuevo." };

  // El id se genera aquí (el visitante no puede leer la fila después de
  // insertarla) para usarlo como clave del aviso por correo.
  const solicitud: NuevaSolicitud = {
    id: crypto.randomUUID(),
    nombre,
    empresa: linea(fd, "empresa", 120),
    email,
    telefono: linea(fd, "telefono", 40),
    interes: interes && (INTERESES as readonly string[]).includes(interes) ? interes : null,
    mensaje: texto(fd, "mensaje", 2000),
    horario: HORARIOS.some((h) => h.valor === horario) ? horario : null,
    origen: texto(fd, "origen", 40),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("solicitudes_diagnostico")
    .insert({ ...solicitud, privacidad_version: POLITICA_VERSION });

  if (error) {
    if (error.message.includes("demasiadas_solicitudes"))
      return { ok: false, error: "Ya recibimos tus solicitudes de hoy. Te contactaremos pronto." };
    return { ok: false, error: "No pudimos enviar tu solicitud. Inténtalo de nuevo en unos minutos." };
  }

  revalidatePath("/admin/diagnosticos");

  // El correo sale después de responder: el visitante no espera al proveedor
  // y, si el envío falla, su solicitud igual queda guardada.
  after(() => avisarNuevaSolicitud(solicitud, `${PORTAL_URL}/admin/diagnosticos`));

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
