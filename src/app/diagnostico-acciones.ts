"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { enviarCorreo, escaparHtml } from "@/lib/correo";
import { POLITICA_VERSION } from "@/lib/empresa";
import {
  AVISOS_DIAGNOSTICO_PARA,
  ESTADOS_DIAGNOSTICO,
  HORARIOS,
  INTERESES,
  INTERES_URGENCIA,
  PORTAL_URL,
  esInteresPlan,
} from "@/lib/sitio";

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

function destinatariosAviso() {
  return (process.env.AVISOS_DIAGNOSTICO_PARA?.split(",") ?? AVISOS_DIAGNOSTICO_PARA)
    .map((c) => c.trim())
    .filter(Boolean);
}

// Las urgencias y los planes de soporte llegan por el mismo formulario; el
// tema elegido decide cómo se presentan los correos.
type Tipo = "urgencia" | "plan" | "diagnostico";

function tipoDe(interes: string | null): Tipo {
  if (interes === INTERES_URGENCIA) return "urgencia";
  if (esInteresPlan(interes)) return "plan";
  return "diagnostico";
}

const AVISO: Record<Tipo, { ceja: string; asunto: string; mensaje: string; color: string }> = {
  urgencia: {
    ceja: "Urgencia técnica · contactar hoy",
    asunto: "URGENTE · Soporte técnico",
    mensaje: "Qué está fallando",
    color: "#b34700",
  },
  plan: {
    ceja: "Interés en plan de soporte",
    asunto: "Plan de soporte",
    mensaje: "Personas y equipos",
    color: "#1f6aa8",
  },
  diagnostico: {
    ceja: "Nueva solicitud de diagnóstico",
    asunto: "Nueva solicitud de diagnóstico",
    mensaje: "Lo que le duele hoy",
    color: "#1f6aa8",
  },
};

const CONFIRMACION: Record<Tipo, string> = {
  urgencia:
    "Recibimos tu solicitud de soporte urgente. Te contactaremos por teléfono o WhatsApp lo antes posible y, antes de empezar, te diremos cuánto cuesta la atención.",
  plan: "Recibimos tu interés en el plan de soporte. Te contactaremos a la brevedad para revisar tus equipos y activar tu plan.",
  diagnostico:
    "Te contactaremos a la brevedad para coordinar una primera conversación de 30 minutos, sin costo. Si vemos que podemos ayudarte, te proponemos el diagnóstico. Si no, te lo decimos.",
};

// Aviso interno al equipo comercial. Todo lo que escribió el visitante se
// escapa antes de ir al HTML; "Responder" le contesta directo a la persona.
async function avisarNuevaSolicitud(s: NuevaSolicitud, urlAdmin: string) {
  const para = destinatariosAviso();
  if (para.length === 0) return;
  const aviso = AVISO[tipoDe(s.interes)];

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
  <p style="margin:0 0 4px;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${aviso.color}">${aviso.ceja}</p>
  <h1 style="margin:0 0 16px;font-size:20px">${escaparHtml(s.nombre)}${s.empresa ? ` · ${escaparHtml(s.empresa)}` : ""}</h1>
  <table style="border-collapse:collapse;width:100%;font-size:14px">${visibles
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#5b6b80;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0">${escaparHtml(v)}</td></tr>`,
    )
    .join("")}</table>
  ${s.mensaje ? `<p style="margin:16px 0 4px;color:#5b6b80;font-size:13px">${aviso.mensaje}</p><p style="margin:0;padding:12px;background:#f4f7fb;border-radius:8px;font-size:14px;white-space:pre-line">${escaparHtml(s.mensaje)}</p>` : ""}
  <p style="margin:24px 0"><a href="${escaparHtml(urlAdmin)}" style="display:inline-block;background:#061e4a;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px;font-weight:bold">Gestionar en el portal</a></p>
  <p style="margin:0;color:#5b6b80;font-size:12px">Responde este correo para escribirle directamente a ${escaparHtml(s.nombre)}.</p>
</div>`;

  const texto = [
    aviso.ceja,
    "",
    ...visibles.map(([k, v]) => `${k}: ${v}`),
    ...(s.mensaje ? ["", `${aviso.mensaje}:`, s.mensaje] : []),
    "",
    `Gestionar: ${urlAdmin}`,
  ].join("\n");

  await enviarCorreo({
    para,
    asunto: `${aviso.asunto}: ${s.nombre}${s.empresa ? ` (${s.empresa})` : ""}`,
    html,
    texto,
    responderA: s.email,
    idempotencia: `diagnostico-${s.id}`,
  });
}

// Confirmación al visitante. Cualquiera puede escribir un correo ajeno en el
// formulario, así que este mensaje no repite nada de texto libre (ni nombre
// ni mensaje): solo el tema y el horario, que salen de listas fijas. Así no
// sirve para mandarle contenido arbitrario a un tercero.
async function confirmarAlVisitante(s: NuevaSolicitud) {
  const responderA = destinatariosAviso()[0];
  const horario = HORARIOS.find((h) => h.valor === s.horario)?.etiqueta ?? null;
  const detalles: [string, string][] = [];
  if (s.interes) detalles.push(["Tema", s.interes]);
  if (horario && s.horario !== "indistinto") detalles.push(["Prefieres conversar", horario]);

  const cuerpo = CONFIRMACION[tipoDe(s.interes)];
  const logo = `${PORTAL_URL}/brand/proyit-logo-blanco.png`;
  const privacidad = `${PORTAL_URL}/privacidad`;

  const html = `<div style="background:#f4f7fb;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#0f1c2e">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
    <div style="background:#061e4a;padding:20px 28px"><img src="${escaparHtml(logo)}" alt="ProyIT" height="28" style="display:block;height:28px;border:0"></div>
    <div style="padding:28px">
      <h1 style="margin:0 0 12px;font-size:22px;color:#0b1f45">Recibimos tu solicitud</h1>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6">Hola, gracias por escribirnos.</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6">${cuerpo}</p>
      ${
        detalles.length
          ? `<table style="border-collapse:collapse;font-size:14px;margin:0 0 16px">${detalles
              .map(
                ([k, v]) =>
                  `<tr><td style="padding:4px 12px 4px 0;color:#5b6b80">${k}</td><td style="padding:4px 0;font-weight:bold">${escaparHtml(v)}</td></tr>`,
              )
              .join("")}</table>`
          : ""
      }
      <p style="margin:0;font-size:15px;line-height:1.6">Si quieres contarnos algo más, responde este correo.</p>
    </div>
    <div style="padding:16px 28px;border-top:1px solid #e2e8f0;font-size:12px;line-height:1.5;color:#5b6b80">
      Si no hiciste esta solicitud, puedes ignorar este mensaje.<br>
      ProyIT · Inversiones Tesoros Chile SpA · <a href="${escaparHtml(privacidad)}" style="color:#5b6b80">Política de privacidad</a>
    </div>
  </div>
</div>`;

  const texto = [
    "Recibimos tu solicitud",
    "",
    "Hola, gracias por escribirnos.",
    "",
    cuerpo,
    ...(detalles.length ? ["", ...detalles.map(([k, v]) => `${k}: ${v}`)] : []),
    "",
    "Si quieres contarnos algo más, responde este correo.",
    "",
    "Si no hiciste esta solicitud, puedes ignorar este mensaje.",
    `ProyIT · Inversiones Tesoros Chile SpA · Política de privacidad: ${privacidad}`,
  ].join("\n");

  await enviarCorreo({
    para: [s.email],
    asunto: "Recibimos tu solicitud · ProyIT",
    html,
    texto,
    responderA,
    idempotencia: `diagnostico-confirmacion-${s.id}`,
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
  // En una urgencia se llama a la persona: sin teléfono no hay cómo.
  const telefono = linea(fd, "telefono", 40);
  if (interes === INTERES_URGENCIA && (telefono?.replace(/\D/g, "").length ?? 0) < 8)
    return { ok: false, error: "Para atender tu urgencia necesitamos un teléfono o WhatsApp donde llamarte." };
  if (!(await captchaValido(texto(fd, "captcha", 4000))))
    return { ok: false, error: "No pudimos verificar que no eres un robot. Inténtalo de nuevo." };

  // El id se genera aquí (el visitante no puede leer la fila después de
  // insertarla) para usarlo como clave del aviso por correo.
  const solicitud: NuevaSolicitud = {
    id: crypto.randomUUID(),
    nombre,
    empresa: linea(fd, "empresa", 120),
    email,
    telefono,
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
  // Cada envío es independiente: si uno falla, el otro sale igual.
  after(() =>
    Promise.allSettled([
      avisarNuevaSolicitud(solicitud, `${PORTAL_URL}/admin/diagnosticos`),
      confirmarAlVisitante(solicitud),
    ]),
  );

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
