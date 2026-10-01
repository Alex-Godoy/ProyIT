"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireUsuario } from "@/lib/auth";
import { BUCKET_TICKETS, ESTADOS_TICKET, MAX_ADJUNTOS, PRIORIDADES } from "@/lib/tickets";
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

export async function crearTicketAction(fd: FormData): Promise<{ id: string } | { error: string }> {
  const { supabase, user } = await requireUsuario();
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
    .select("id")
    .single();
  if (error || !data) return { error: "No pudimos crear el ticket. Inténtalo de nuevo." };

  refrescar(data.id);
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
