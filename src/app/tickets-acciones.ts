"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireUsuario } from "@/lib/auth";
import { armarAviso, enviarCorreo, type Aviso } from "@/lib/correo";
import { AVISOS_SOPORTE_PARA, CONTACTO_EMAIL, PORTAL_URL, destinatarios } from "@/lib/sitio";
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
// Avisos por correo. Salen después de responder (after) para no hacer esperar
// a nadie, y si fallan la acción ya quedó hecha. Los correos de cada aviso los
// entrega la función destinatarios_aviso_ticket, que valida quién los pide.
// ---------------------------------------------------------------------------

type Supabase = SupabaseClient;

type ResumenTicket = {
  id: string;
  numero: number;
  asunto: string;
  prioridad: string;
  vence_at: string;
  cliente: string;
};

const PIE_PORTAL = "No respondas este correo: contesta desde el portal para que quede registrado en el ticket.";

async function resumenTicket(supabase: Supabase, ticketId: string): Promise<ResumenTicket | null> {
  const { data } = await supabase
    .from("tickets")
    .select("id, numero, asunto, prioridad, vence_at, cliente:clientes(nombre, nombre_fantasia)")
    .eq("id", ticketId)
    .maybeSingle();
  if (!data) return null;
  const c = data.cliente as unknown as { nombre: string; nombre_fantasia: string | null } | null;
  return { ...data, cliente: c?.nombre_fantasia ?? c?.nombre ?? "Cliente" };
}

async function correosDe(supabase: Supabase, ticketId: string, evento: "cliente" | "responsable") {
  const { data } = await supabase.rpc("destinatarios_aviso_ticket", { p_ticket_id: ticketId, p_evento: evento });
  return ((data ?? []) as string[]).filter(Boolean);
}

async function enviarAviso(para: string[], asunto: string, aviso: Aviso, idempotencia: string) {
  if (para.length === 0) return;
  await enviarCorreo({ para, asunto, ...armarAviso(aviso), idempotencia });
}

const esUrgente = (prioridad: string) => prioridad === "urgente" || prioridad === "alta";

function prefijo(t: ResumenTicket) {
  return esUrgente(t.prioridad) ? `${prioridadInfo(t.prioridad).etiqueta.toUpperCase()} · ` : "";
}

// Al cliente: el equipo le respondió.
async function avisarRespuestaAlCliente(supabase: Supabase, ticketId: string, mensajeId: string, contenido: string) {
  const [t, para] = await Promise.all([resumenTicket(supabase, ticketId), correosDe(supabase, ticketId, "cliente")]);
  if (!t) return;
  await enviarAviso(
    para,
    `Respondimos tu ticket ${numeroTicket(t.numero)}: ${t.asunto}`,
    {
      ceja: "Soporte ProyIT",
      titulo: `Respondimos tu ticket ${numeroTicket(t.numero)}`,
      parrafos: [`El equipo de ProyIT respondió tu ticket "${t.asunto}".`],
      cita: { etiqueta: "Respuesta", texto: contenido },
      boton: { texto: "Ver y responder", url: `${PORTAL_URL}/portal/tickets/${t.id}` },
      pie: `${PIE_PORTAL} Si no puedes ingresar, escríbenos a ${CONTACTO_EMAIL}.`,
    },
    `ticket-respuesta-${mensajeId}`,
  );
}

// Al cliente: su ticket espera su respuesta o quedó resuelto.
async function avisarEstadoAlCliente(supabase: Supabase, ticketId: string, estado: "esperando_cliente" | "resuelto") {
  const [t, para] = await Promise.all([resumenTicket(supabase, ticketId), correosDe(supabase, ticketId, "cliente")]);
  if (!t) return;
  const esperando = estado === "esperando_cliente";
  await enviarAviso(
    para,
    esperando
      ? `Necesitamos tu respuesta en el ticket ${numeroTicket(t.numero)}`
      : `Resolvimos tu ticket ${numeroTicket(t.numero)}: ${t.asunto}`,
    {
      ceja: "Soporte ProyIT",
      titulo: esperando ? "Necesitamos tu respuesta" : "Resolvimos tu ticket",
      parrafos: esperando
        ? [`Para seguir con tu ticket "${t.asunto}" necesitamos que nos respondas en el portal.`]
        : [
            `Marcamos como resuelto tu ticket "${t.asunto}".`,
            "Si el problema sigue, respóndenos en el mismo ticket y lo reabrimos.",
          ],
      boton: { texto: "Ver el ticket", url: `${PORTAL_URL}/portal/tickets/${t.id}` },
      pie: PIE_PORTAL,
    },
    `ticket-estado-${t.id}-${estado}-${Date.now()}`,
  );
}

// Al responsable: se le asignó un ticket.
async function avisarAsignacion(supabase: Supabase, ticketId: string) {
  const [t, para] = await Promise.all([resumenTicket(supabase, ticketId), correosDe(supabase, ticketId, "responsable")]);
  if (!t) return;
  await enviarAviso(
    para,
    `${prefijo(t)}Te asignaron el ticket ${numeroTicket(t.numero)}: ${t.asunto} (${t.cliente})`,
    {
      ceja: esUrgente(t.prioridad) ? `Ticket ${prioridadInfo(t.prioridad).etiqueta.toLowerCase()} asignado` : "Ticket asignado",
      titulo: `${numeroTicket(t.numero)} · ${t.asunto}`,
      parrafos: ["Te asignaron este ticket de soporte."],
      filas: [
        ["Cliente", t.cliente],
        ["Prioridad", prioridadInfo(t.prioridad).etiqueta],
        ["Responder antes de", formatearPlazo(t.vence_at)],
      ],
      boton: { texto: "Abrir el ticket", url: `${PORTAL_URL}/equipo/tickets/${t.id}` },
      pie: PIE_PORTAL,
      urgente: esUrgente(t.prioridad),
    },
    `ticket-asignado-${t.id}-${Date.now()}`,
  );
}

// Al responsable (o al super usuario si no hay): el cliente respondió.
async function avisarRespuestaDelCliente(supabase: Supabase, ticketId: string, mensajeId: string, contenido: string) {
  const [t, responsable] = await Promise.all([
    resumenTicket(supabase, ticketId),
    correosDe(supabase, ticketId, "responsable"),
  ]);
  if (!t) return;
  const hayResponsable = responsable.length > 0;
  await enviarAviso(
    hayResponsable ? responsable : destinatarios(AVISOS_SOPORTE_PARA, process.env.AVISOS_SOPORTE_PARA),
    `${prefijo(t)}${t.cliente} respondió el ticket ${numeroTicket(t.numero)}: ${t.asunto}`,
    {
      ceja: "Respuesta del cliente",
      titulo: `${numeroTicket(t.numero)} · ${t.asunto}`,
      parrafos: [`${t.cliente} respondió en el ticket.`],
      cita: { etiqueta: "Mensaje", texto: contenido },
      boton: {
        texto: "Abrir el ticket",
        url: `${PORTAL_URL}/${hayResponsable ? "equipo" : "admin"}/tickets/${t.id}`,
      },
      pie: PIE_PORTAL,
      urgente: esUrgente(t.prioridad),
    },
    `ticket-respuesta-${mensajeId}`,
  );
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
// esperaría hasta que alguien entrara al panel. Sin "responder a": contestar
// por correo sacaría la conversación del ticket (el correo del cliente va en
// el cuerpo por si hace falta llamarlo o escribirle).
async function avisarTicketNuevo(t: TicketNuevo) {
  const urgente = esUrgente(t.prioridad);
  const prioridad = prioridadInfo(t.prioridad);
  const plazo = formatearPlazo(t.vence_at);
  await enviarAviso(
    destinatarios(AVISOS_SOPORTE_PARA, process.env.AVISOS_SOPORTE_PARA),
    `${urgente ? `${prioridad.etiqueta.toUpperCase()} · ` : ""}Ticket ${numeroTicket(t.numero)}: ${t.asunto} (${t.cliente})`,
    {
      ceja: urgente ? `Ticket ${prioridad.etiqueta.toLowerCase()} · responder ${plazo}` : "Nuevo ticket de soporte",
      titulo: `${numeroTicket(t.numero)} · ${t.asunto}`,
      parrafos: [],
      filas: [
        ["Cliente", t.cliente],
        ["Abierto por", t.autorEmail ? `${t.autor} (${t.autorEmail})` : t.autor],
        ["Prioridad", prioridad.etiqueta],
        ["Responder antes de", plazo],
        ["Proyecto", t.proyecto ?? "Soporte general"],
      ],
      cita: { etiqueta: "Qué está pasando", texto: t.descripcion },
      boton: { texto: "Abrir el ticket", url: `${PORTAL_URL}/admin/tickets/${t.id}` },
      pie: PIE_PORTAL,
      urgente,
    },
    `ticket-${t.id}`,
  );
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
  // los conoce quien los creó).
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
  const { supabase, perfil } = await requireUsuario();
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

  // Las notas internas no avisan a nadie: son del equipo para el equipo.
  if (!interno) {
    after(() =>
      perfil?.role === "cliente"
        ? avisarRespuestaDelCliente(supabase, ticketId, data.id, limpio)
        : avisarRespuestaAlCliente(supabase, ticketId, data.id, limpio),
    );
  }
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
// Gestión (responsable y super usuario): responsable, estado y prioridad se
// guardan juntos con un solo botón, para que ningún cambio quede sin guardar.
// ---------------------------------------------------------------------------

export async function gestionarTicketAction(b: string, ticketId: string, fd: FormData) {
  const { supabase, perfil } = await requireUsuario();
  const estado = texto(fd, "estado", 20);
  const prioridad = texto(fd, "prioridad", 10);
  if (!estado || !ESTADOS_TICKET.some((e) => e.valor === estado)) volver(b, ticketId, { error: "ticket_no_guardado" });
  if (!prioridad || !PRIORIDADES.some((p) => p.valor === prioridad)) volver(b, ticketId, { error: "ticket_no_guardado" });

  const { data: antes } = await supabase
    .from("tickets")
    .select("estado, responsable_id")
    .eq("id", ticketId)
    .maybeSingle();
  if (!antes) volver(b, ticketId, { error: "ticket_no_guardado" });

  // Solo el super usuario asigna; el campo no viaja en el formulario del equipo.
  const cambiaResponsable = perfil?.role === "admin" && fd.has("responsable_id");
  const responsable = cambiaResponsable ? texto(fd, "responsable_id", 40) : antes.responsable_id;

  const { data, error } = await supabase
    .from("tickets")
    .update(cambiaResponsable ? { estado, prioridad, responsable_id: responsable } : { estado, prioridad })
    .eq("id", ticketId)
    .select("id");
  if (error || !data?.length) volver(b, ticketId, { error: "ticket_no_guardado" });
  refrescar(ticketId);

  const nuevoResponsable = cambiaResponsable && responsable && responsable !== antes.responsable_id;
  const avisarCliente = (estado === "esperando_cliente" || estado === "resuelto") && estado !== antes.estado;
  after(async () => {
    if (nuevoResponsable) await avisarAsignacion(supabase, ticketId);
    if (avisarCliente) await avisarEstadoAlCliente(supabase, ticketId, estado as "esperando_cliente" | "resuelto");
  });

  if (cambiaResponsable && responsable !== antes.responsable_id)
    volver(b, ticketId, { ok: responsable ? "ticket_asignado" : "ticket_sin_responsable" });
  volver(b, ticketId, { ok: "ticket_actualizado" });
}
