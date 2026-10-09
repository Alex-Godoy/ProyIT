"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { requireAdmin, requireUsuario } from "@/lib/auth";
import { enviarCorreo, escaparHtml } from "@/lib/correo";
import { AVISOS_SOPORTE_PARA, PORTAL_URL, destinatarios } from "@/lib/sitio";
import {
  BUCKET_TICKETS,
  ESTADOS_TICKET,
  MAX_ADJUNTOS,
  PRIORIDADES,
  formatearPlazo,
  numeroTicket,
  prioridadInfo,
} from "@/lib/tickets";
import type { CodigoMensaje, CodigoOk } from "@/lib/mensajes";

// Acciones del módulo de tickets. Quién puede hacer qué lo decide RLS
// (ver migración de tickets); aquí se valida la entrada y se ordena el flujo.

const BASES = ["/portal/tickets", "/admin/tickets", "/equipo/tickets"] as const;

function base(valor: string) {
  return (BASES as readonly string[]).includes(valor) ? valor : "/portal/tickets";
}

function texto(fd: FormData, campo: string, max: number) {
  const v = fd.get(campo);
  return typeof v === "string" && v.trim() !== "" ? v.trim().slice(0, max) : null;
}

function refrescar(ticketId?: string) {
  for (const b of BASES) {
    revalidatePath(b);
    if (ticketId) revalidatePath(`${b}/${ticketId}`);
  }
  revalidatePath("/admin");
  revalidatePath("/equipo");
  revalidatePath("/portal");
}

function volver(b: string, ticketId: string, r: { ok: CodigoOk } | { error: CodigoMensaje }): never {
  const q = "ok" in r ? `ok=${r.ok}` : `error=${r.error}`;
  redirect(`${base(b)}/${ticketId}?${q}`);
}

// ---------------------------------------------------------------------------
// Crear (cliente; el super usuario también puede registrar uno a nombre de un cliente)
// ---------------------------------------------------------------------------

type TicketNuevo = {
  id: string;
  numero: number;
  vence_at: string;
  asunto: string;
  descripcion: string;
  prioridad: string;
  cliente: string;
  proyecto: string | null;
  autor: string;
  autorEmail: string | null;
};

// Aviso al equipo cuando un cliente abre un ticket: sin esto, el ticket
// esperaría hasta que alguien entrara al panel. El texto del cliente se
// escapa antes de ir al HTML; "Responder" le escribe a quien lo abrió.
async function avisarTicketNuevo(t: TicketNuevo) {
  const para = destinatarios(AVISOS_SOPORTE_PARA, process.env.AVISOS_SOPORTE_PARA);
  if (para.length === 0) return;

  const prioridad = prioridadInfo(t.prioridad);
  const urgente = t.prioridad === "urgente" || t.prioridad === "alta";
  const plazo = formatearPlazo(t.vence_at);
  const url = `${PORTAL_URL}/admin/tickets/${t.id}`;
  const filas: [string, string][] = [
    ["Cliente", t.cliente],
    ["Abierto por", t.autorEmail ? `${t.autor} (${t.autorEmail})` : t.autor],
    ["Prioridad", prioridad.etiqueta],
    ["Responder antes de", plazo],
    ["Proyecto", t.proyecto ?? "Soporte general"],
  ];

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#0f1c2e;max-width:560px">
  <p style="margin:0 0 4px;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${urgente ? "#b34700" : "#1f6aa8"}">${urgente ? `Ticket ${escaparHtml(prioridad.etiqueta.toLowerCase())} · responder ${escaparHtml(plazo)}` : "Nuevo ticket de soporte"}</p>
  <h1 style="margin:0 0 16px;font-size:20px">${numeroTicket(t.numero)} · ${escaparHtml(t.asunto)}</h1>
  <table style="border-collapse:collapse;width:100%;font-size:14px">${filas
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#5b6b80;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0">${escaparHtml(v)}</td></tr>`,
    )
    .join("")}</table>
  <p style="margin:16px 0 4px;color:#5b6b80;font-size:13px">Qué está pasando</p>
  <p style="margin:0;padding:12px;background:#f4f7fb;border-radius:8px;font-size:14px;white-space:pre-line">${escaparHtml(t.descripcion)}</p>
  <p style="margin:24px 0"><a href="${escaparHtml(url)}" style="display:inline-block;background:#061e4a;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px;font-weight:bold">Abrir el ticket</a></p>
  <p style="margin:0;color:#5b6b80;font-size:12px">Responde desde el portal para que quede registrado en el ticket.</p>
</div>`;

  const texto = [
    urgente ? `Ticket ${prioridad.etiqueta.toLowerCase()} · responder ${plazo}` : "Nuevo ticket de soporte",
    "",
    `${numeroTicket(t.numero)} · ${t.asunto}`,
    ...filas.map(([k, v]) => `${k}: ${v}`),
    "",
    "Qué está pasando:",
    t.descripcion,
    "",
    `Abrir el ticket: ${url}`,
  ].join("\n");

  await enviarCorreo({
    para,
    asunto: `${urgente ? `${prioridad.etiqueta.toUpperCase()} · ` : ""}Ticket ${numeroTicket(t.numero)}: ${t.asunto} (${t.cliente})`,
    html,
    texto,
    responderA: t.autorEmail ?? undefined,
    idempotencia: `ticket-${t.id}`,
  });
}

export async function crearTicketAction(fd: FormData): Promise<{ id: string } | { error: string }> {
  const { supabase, user, perfil } = await requireUsuario();
  const asunto = texto(fd, "asunto", 200);
  const descripcion = texto(fd, "descripcion", 8000);
  const clienteId = texto(fd, "cliente_id", 40);
  const proyectoId = texto(fd, "proyecto_id", 40);
  const prioridad = texto(fd, "prioridad", 10) ?? "media";

  if (!asunto || asunto.length < 3) return { error: "Escribe un asunto (mínimo 3 caracteres)." };
  if (!descripcion) return { error: "Cuéntanos qué pasa en la descripción." };
  if (!clienteId) return { error: "No encontramos a qué cliente asociar el ticket." };
  if (!PRIORIDADES.some((p) => p.valor === prioridad)) return { error: "Prioridad no válida." };

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      cliente_id: clienteId,
      proyecto_id: proyectoId,
      creado_por: user.id,
      asunto,
      descripcion,
      prioridad,
    })
    .select("id, numero, vence_at")
    .single();
  if (error || !data) return { error: "No pudimos crear el ticket. Inténtalo de nuevo." };

  refrescar(data.id);

  // Solo avisa los tickets que abre un cliente (los que registra el equipo ya
  // los conoce quien los creó). Sale después de responder: no lo hace esperar.
  if (perfil?.role === "cliente") {
    const [{ data: cliente }, { data: proyecto }] = await Promise.all([
      supabase.from("clientes").select("nombre, nombre_fantasia").eq("id", clienteId).maybeSingle(),
      proyectoId
        ? supabase.from("proyectos").select("nombre").eq("id", proyectoId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    const aviso: TicketNuevo = {
      id: data.id,
      numero: data.numero,
      vence_at: data.vence_at,
      asunto,
      descripcion,
      prioridad,
      cliente: cliente?.nombre_fantasia ?? cliente?.nombre ?? "Cliente",
      proyecto: proyecto?.nombre ?? null,
      autor: perfil.full_name ?? user.email ?? "Cliente",
      autorEmail: user.email ?? null,
    };
    after(() => avisarTicketNuevo(aviso));
  }

  return { id: data.id };
}

// ---------------------------------------------------------------------------
// Conversación
// ---------------------------------------------------------------------------

export async function responderTicketAction(
  ticketId: string,
  contenido: string,
  interno: boolean,
): Promise<{ mensajeId: string } | { error: string }> {
  const { supabase } = await requireUsuario();
  const limpio = contenido.trim().slice(0, 8000);
  if (!limpio) return { error: "Escribe un mensaje." };

  // Autor y tipo (cliente/equipo) los fija la base de datos; una nota
  // interna de alguien que no atiende el ticket es rechazada allí.
  const { data, error } = await supabase
    .from("ticket_mensajes")
    .insert({ ticket_id: ticketId, contenido: limpio, interno })
    .select("id")
    .single();
  if (error || !data) return { error: "No pudimos enviar el mensaje." };

  refrescar(ticketId);
  return { mensajeId: data.id };
}

export async function registrarAdjuntosAction(
  ticketId: string,
  mensajeId: string | null,
  archivos: { nombre: string; storagePath: string; tamanoBytes: number; mimeType: string }[],
): Promise<{ error: string | null }> {
  const { supabase } = await requireUsuario();
  const validos = archivos.slice(0, MAX_ADJUNTOS).filter((a) => a.storagePath.startsWith(`${ticketId}/`));
  if (validos.length === 0) return { error: null };

  const { error } = await supabase.from("ticket_adjuntos").insert(
    validos.map((a) => ({
      ticket_id: ticketId,
      mensaje_id: mensajeId,
      nombre: a.nombre.slice(0, 200),
      storage_path: a.storagePath,
      tamano_bytes: a.tamanoBytes,
      mime_type: a.mimeType || null,
    })),
  );
  if (error) {
    await supabase.storage.from(BUCKET_TICKETS).remove(validos.map((a) => a.storagePath));
    return { error: "No pudimos adjuntar los archivos." };
  }
  refrescar(ticketId);
  return { error: null };
}

// ---------------------------------------------------------------------------
// Gestión (responsable y super usuario)
// ---------------------------------------------------------------------------

export async function actualizarTicketAction(b: string, ticketId: string, fd: FormData) {
  const { supabase } = await requireUsuario();
  const estado = texto(fd, "estado", 20);
  const prioridad = texto(fd, "prioridad", 10);
  if (!estado || !ESTADOS_TICKET.some((e) => e.valor === estado)) volver(b, ticketId, { error: "ticket_no_guardado" });
  if (!prioridad || !PRIORIDADES.some((p) => p.valor === prioridad)) volver(b, ticketId, { error: "ticket_no_guardado" });

  const { data, error } = await supabase
    .from("tickets")
    .update({ estado, prioridad })
    .eq("id", ticketId)
    .select("id");
  if (error || !data?.length) volver(b, ticketId, { error: "ticket_no_guardado" });
  refrescar(ticketId);
  volver(b, ticketId, { ok: "ticket_actualizado" });
}

export async function asignarResponsableAction(ticketId: string, fd: FormData) {
  const { supabase } = await requireAdmin();
  const responsable = texto(fd, "responsable_id", 40);
  const { error } = await supabase.from("tickets").update({ responsable_id: responsable }).eq("id", ticketId);
  if (error) volver("/admin/tickets", ticketId, { error: "ticket_no_guardado" });
  refrescar(ticketId);
  volver("/admin/tickets", ticketId, { ok: responsable ? "ticket_asignado" : "ticket_sin_responsable" });
}
