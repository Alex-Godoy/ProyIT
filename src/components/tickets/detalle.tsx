import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import {
  BUCKET_TICKETS,
  COLUMNAS_TICKET,
  estadoSla,
  formatearPlazo,
  numeroTicket,
  type AdjuntoTicket,
  type MensajeTicket,
  type Ticket,
} from "@/lib/tickets";
import { formatearFechaHora, formatearTamano } from "@/lib/proyectos";
import { CONTACTO_EMAIL } from "@/lib/sitio";
import { etiquetaCargo } from "@/lib/permisos";
import { EstadoTicketBadge, PrioridadBadge, SlaBadge } from "@/components/tickets/ui";
import ResponderForm from "@/components/tickets/responder-form";

// Carga un ticket con su conversación y adjuntos (enlaces temporales).
// RLS filtra: el cliente no recibe notas internas ni sus adjuntos.
export async function cargarTicket(supabase: SupabaseClient, id: string) {
  const { data: ticket } = await supabase.from("tickets").select(COLUMNAS_TICKET).eq("id", id).maybeSingle<Ticket>();
  if (!ticket) return null;

  const [{ data: mensajes }, { data: adjuntos }, { data: responsable }, { data: cliente }, { data: proyecto }] =
    await Promise.all([
      supabase
        .from("ticket_mensajes")
        .select("id, autor_tipo, contenido, interno, created_at")
        .eq("ticket_id", id)
        .order("created_at"),
      supabase
        .from("ticket_adjuntos")
        .select("id, mensaje_id, interno, nombre, storage_path, tamano_bytes, created_at")
        .eq("ticket_id", id)
        .order("created_at"),
      supabase.rpc("responsable_del_ticket", { p_ticket_id: id }),
      supabase.from("clientes").select("nombre, telefono, email").eq("id", ticket.cliente_id).maybeSingle(),
      ticket.proyecto_id
        ? supabase.from("proyectos").select("nombre").eq("id", ticket.proyecto_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const listaAdjuntos = (adjuntos ?? []) as AdjuntoTicket[];
  const urls: Record<string, string> = {};
  if (listaAdjuntos.length > 0) {
    const { data: firmadas } = await supabase.storage
      .from(BUCKET_TICKETS)
      .createSignedUrls(listaAdjuntos.map((a) => a.storage_path), 900);
    firmadas?.forEach((f) => {
      if (f.path && f.signedUrl) urls[f.path] = f.signedUrl;
    });
  }

  const resp = ((responsable ?? []) as { nombre: string; cargo: string }[])[0] ?? null;
  return {
    ticket,
    mensajes: (mensajes ?? []) as MensajeTicket[],
    adjuntos: listaAdjuntos,
    urls,
    responsable: resp,
    cliente: cliente as { nombre: string; telefono: string | null; email: string | null } | null,
    proyecto: proyecto as { nombre: string } | null,
  };
}

type Datos = NonNullable<Awaited<ReturnType<typeof cargarTicket>>>;

function ListaAdjuntos({ adjuntos, urls }: { adjuntos: AdjuntoTicket[]; urls: Record<string, string> }) {
  if (adjuntos.length === 0) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {adjuntos.map((a) => (
        <li key={a.id}>
          <a
            href={urls[a.storage_path]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-[16rem] items-center gap-1.5 rounded-lg bg-white/70 px-2.5 py-1.5 text-xs font-medium text-navy ring-1 ring-slate-200 hover:ring-brand-blue"
          >
            <span aria-hidden>📎</span>
            <span className="truncate">{a.nombre}</span>
            {a.tamano_bytes ? <span className="shrink-0 text-muted">{formatearTamano(a.tamano_bytes)}</span> : null}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function VistaTicket({
  datos,
  vista,
  panelGestion,
}: {
  datos: Datos;
  vista: "cliente" | "equipo";
  // Formulario de estado/prioridad/responsable (solo quien atiende).
  panelGestion?: ReactNode;
}) {
  const { ticket, mensajes, adjuntos, urls, responsable, cliente, proyecto } = datos;
  const adjuntosIniciales = adjuntos.filter((a) => !a.mensaje_id);
  const cerrado = ticket.estado === "cerrado";

  const etiquetaAutor = (m: MensajeTicket) =>
    m.autor_tipo === "cliente"
      ? vista === "cliente"
        ? "Tú"
        : (cliente?.nombre ?? "Cliente")
      : vista === "cliente"
        ? responsable
          ? `${responsable.nombre} · ProyIT`
          : "Equipo ProyIT"
        : m.interno
          ? "Nota interna"
          : "Equipo ProyIT";

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {vista === "cliente" && <PlazoRespuesta ticket={ticket} />}

        {/* Cabecera */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-muted">{numeroTicket(ticket.numero)}</span>
            <EstadoTicketBadge estado={ticket.estado} vista={vista} />
            <PrioridadBadge prioridad={ticket.prioridad} />
            {vista === "equipo" && <SlaBadge ticket={ticket} />}
          </div>
          <h1 className="mt-2 text-xl font-bold text-navy sm:text-2xl">{ticket.asunto}</h1>
          <p className="mt-1 text-sm text-muted">
            {proyecto ? `Proyecto: ${proyecto.nombre}` : "Soporte general"} · abierto {formatearFechaHora(ticket.created_at)}
          </p>
          <p className="mt-4 whitespace-pre-line text-ink">{ticket.descripcion}</p>
          <ListaAdjuntos adjuntos={adjuntosIniciales} urls={urls} />
        </section>

        {/* Conversación */}
        <ol className="space-y-3" aria-label="Conversación">
          {mensajes.map((m) => {
            const propio = (vista === "cliente") === (m.autor_tipo === "cliente");
            return (
              <li key={m.id} className={`flex ${propio ? "justify-end" : "justify-start"}`}>
                <div
                  className={`w-full max-w-[92%] rounded-2xl p-4 sm:max-w-[80%] ${
                    m.interno
                      ? "bg-amber-50 ring-1 ring-amber-200"
                      : propio
                        ? "bg-navy text-white"
                        : "bg-white ring-1 ring-slate-200"
                  }`}
                >
                  <p className={`text-xs font-semibold ${propio && !m.interno ? "text-white/70" : "text-muted"}`}>
                    {m.interno && "🔒 "}
                    {etiquetaAutor(m)} · {formatearFechaHora(m.created_at)}
                  </p>
                  <p className={`mt-1 whitespace-pre-line ${propio && !m.interno ? "text-white" : "text-ink"}`}>
                    {m.contenido}
                  </p>
                  <ListaAdjuntos adjuntos={adjuntos.filter((a) => a.mensaje_id === m.id)} urls={urls} />
                </div>
              </li>
            );
          })}
        </ol>

        {cerrado ? (
          <p className="rounded-2xl bg-slate-100 p-4 text-center text-sm text-muted">
            Este ticket está cerrado.{" "}
            {vista === "cliente" ? "Si el problema vuelve, crea un ticket nuevo." : "Reábrelo cambiando su estado."}
          </p>
        ) : (
          <ResponderForm ticketId={ticket.id} puedeNotaInterna={vista === "equipo"} />
        )}
      </div>

      {/* Lateral */}
      {/* Quien atiende ve primero el panel de gestión en el celular (asignar o
          cambiar el estado sin bajar por toda la conversación). */}
      <aside className={`space-y-4 ${panelGestion ? "order-first lg:order-none" : ""}`}>
        {panelGestion}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Detalle</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-muted">Responsable</dt>
              <dd className="font-medium text-ink">
                {responsable ? `${responsable.nombre} (${etiquetaCargo(responsable.cargo)})` : "Por asignar"}
              </dd>
            </div>
            {vista === "equipo" && cliente && (
              <div>
                <dt className="text-muted">Cliente</dt>
                <dd className="font-medium text-ink">{cliente.nombre}</dd>
                {cliente.telefono && (
                  <dd>
                    <a href={`tel:${cliente.telefono}`} className="text-brand-blue hover:underline">
                      {cliente.telefono}
                    </a>
                  </dd>
                )}
                {cliente.email && (
                  <dd>
                    <a href={`mailto:${cliente.email}`} className="break-all text-brand-blue hover:underline">
                      {cliente.email}
                    </a>
                  </dd>
                )}
              </div>
            )}
            <div>
              <dt className="text-muted">Última actividad</dt>
              <dd className="font-medium text-ink">{formatearFechaHora(ticket.updated_at)}</dd>
            </div>
            {ticket.resuelto_at && (
              <div>
                <dt className="text-muted">Resuelto</dt>
                <dd className="font-medium text-ink">{formatearFechaHora(ticket.resuelto_at)}</dd>
              </div>
            )}
          </dl>
        </section>
      </aside>
    </div>
  );
}

// Lo que el cliente necesita saber apenas abre su ticket: hasta cuándo le
// responderemos. Desaparece cuando el equipo responde o el ticket se cierra.
function PlazoRespuesta({ ticket }: { ticket: Ticket }) {
  const sla = estadoSla(ticket);
  if (sla.tipo === "cumplido" || sla.tipo === "cerrado") return null;

  if (sla.tipo === "vencido") {
    return (
      <p role="status" className="rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-900 ring-1 ring-amber-200">
        <strong className="font-semibold">Ya deberíamos haberte respondido.</strong> Disculpa la demora: tu ticket sigue
        en la fila de atención. Si no puede esperar, escríbenos a{" "}
        <a href={`mailto:${CONTACTO_EMAIL}`} className="font-semibold underline">
          {CONTACTO_EMAIL}
        </a>
        .
      </p>
    );
  }

  return (
    <p role="status" className="rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-900 ring-1 ring-emerald-200">
      <strong className="font-semibold">Recibimos tu ticket.</strong> Te responderemos{" "}
      <strong className="font-semibold">{formatearPlazo(ticket.vence_at)}</strong> como máximo. Verás la respuesta aquí.
    </p>
  );
}
