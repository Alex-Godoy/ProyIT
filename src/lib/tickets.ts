// Definiciones del módulo de tickets de soporte. Los plazos (SLA) deben
// coincidir con public.ticket_horas_sla (supabase/migrations/20261001120000_tickets.sql).

export const PRIORIDADES = [
  { valor: "baja", etiqueta: "Baja", horas: 72, clase: "bg-slate-100 text-slate-700" },
  { valor: "media", etiqueta: "Media", horas: 24, clase: "bg-brand-blue/10 text-navy" },
  { valor: "alta", etiqueta: "Alta", horas: 8, clase: "bg-amber-100 text-amber-800" },
  { valor: "urgente", etiqueta: "Urgente", horas: 4, clase: "bg-red-100 text-red-700" },
] as const;

export type Prioridad = (typeof PRIORIDADES)[number]["valor"];

export const ESTADOS_TICKET = [
  { valor: "abierto", etiqueta: "Abierto", paraCliente: "Recibido", clase: "bg-brand-orange/10 text-brand-orange-dark" },
  { valor: "en_progreso", etiqueta: "En progreso", paraCliente: "En progreso", clase: "bg-brand-blue/10 text-navy" },
  {
    valor: "esperando_cliente",
    etiqueta: "Esperando al cliente",
    paraCliente: "Esperando tu respuesta",
    clase: "bg-amber-100 text-amber-800",
  },
  { valor: "resuelto", etiqueta: "Resuelto", paraCliente: "Resuelto", clase: "bg-emerald-100 text-emerald-800" },
  { valor: "cerrado", etiqueta: "Cerrado", paraCliente: "Cerrado", clase: "bg-slate-200 text-slate-700" },
] as const;

export type EstadoTicket = (typeof ESTADOS_TICKET)[number]["valor"];

export const ESTADOS_ABIERTOS: EstadoTicket[] = ["abierto", "en_progreso", "esperando_cliente"];

export type Ticket = {
  id: string;
  numero: number;
  cliente_id: string;
  proyecto_id: string | null;
  asunto: string;
  descripcion: string;
  prioridad: Prioridad;
  estado: EstadoTicket;
  responsable_id: string | null;
  vence_at: string;
  primera_respuesta_at: string | null;
  resuelto_at: string | null;
  created_at: string;
  updated_at: string;
};

export const COLUMNAS_TICKET =
  "id, numero, cliente_id, proyecto_id, asunto, descripcion, prioridad, estado, responsable_id, vence_at, primera_respuesta_at, resuelto_at, created_at, updated_at";

export type MensajeTicket = {
  id: string;
  autor_tipo: "cliente" | "equipo";
  contenido: string;
  interno: boolean;
  created_at: string;
};

export type AdjuntoTicket = {
  id: string;
  mensaje_id: string | null;
  interno: boolean;
  nombre: string;
  storage_path: string;
  tamano_bytes: number | null;
  created_at: string;
};

export const BUCKET_TICKETS = "ticket-adjuntos";
export const MAX_ADJUNTOS = 5;
export const MAX_BYTES_ADJUNTO = 20 * 1024 * 1024;

export function prioridadInfo(valor: string) {
  return PRIORIDADES.find((p) => p.valor === valor) ?? PRIORIDADES[1];
}

export function estadoTicketInfo(valor: string) {
  return ESTADOS_TICKET.find((e) => e.valor === valor) ?? ESTADOS_TICKET[0];
}

// Estado del plazo de primera respuesta.
export function estadoSla(t: Pick<Ticket, "vence_at" | "primera_respuesta_at" | "estado">, ahora = Date.now()) {
  if (t.primera_respuesta_at) return { tipo: "cumplido" as const };
  if (!ESTADOS_ABIERTOS.includes(t.estado)) return { tipo: "cerrado" as const };
  const restanteMs = Date.parse(t.vence_at) - ahora;
  if (restanteMs <= 0) return { tipo: "vencido" as const, horas: Math.ceil(-restanteMs / 3_600_000) };
  return { tipo: "en_plazo" as const, horas: Math.ceil(restanteMs / 3_600_000) };
}

export function numeroTicket(numero: number) {
  return `#${numero}`;
}

// "hoy a las 14:30", "mañana a las 09:00" o "el jueves 16 de octubre a las
// 10:00", en hora de Chile. Es el plazo que se le promete al cliente.
export function formatearPlazo(fecha: string, ahora = new Date()) {
  const zona = "America/Santiago";
  const dia = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: zona }).format(d);
  const objetivo = new Date(fecha);
  const hora = new Intl.DateTimeFormat("es-CL", { timeZone: zona, hour: "2-digit", minute: "2-digit", hour12: false }).format(objetivo);
  if (dia(objetivo) === dia(ahora)) return `hoy a las ${hora}`;
  if (dia(objetivo) === dia(new Date(ahora.getTime() + 86_400_000))) return `mañana a las ${hora}`;
  const fechaLarga = new Intl.DateTimeFormat("es-CL", { timeZone: zona, weekday: "long", day: "numeric", month: "long" })
    .format(objetivo)
    .replace(",", "");
  return `el ${fechaLarga} a las ${hora}`;
}
