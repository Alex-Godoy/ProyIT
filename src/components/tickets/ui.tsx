import { estadoSla, estadoTicketInfo, prioridadInfo, type Ticket } from "@/lib/tickets";

const pill = "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold";

export function EstadoTicketBadge({ estado, vista = "equipo" }: { estado: string; vista?: "cliente" | "equipo" }) {
  const info = estadoTicketInfo(estado);
  return <span className={`${pill} ${info.clase}`}>{vista === "cliente" ? info.paraCliente : info.etiqueta}</span>;
}

export function PrioridadBadge({ prioridad }: { prioridad: string }) {
  const info = prioridadInfo(prioridad);
  return <span className={`${pill} ${info.clase}`}>{info.etiqueta}</span>;
}

// Plazo de primera respuesta (solo lo ve el equipo).
export function SlaBadge({ ticket }: { ticket: Pick<Ticket, "vence_at" | "primera_respuesta_at" | "estado"> }) {
  const sla = estadoSla(ticket);
  if (sla.tipo === "cumplido") return <span className={`${pill} bg-emerald-50 text-emerald-700`}>Respondido</span>;
  if (sla.tipo === "cerrado") return null;
  if (sla.tipo === "vencido") {
    return <span className={`${pill} bg-red-600 text-white`}>Plazo vencido hace {sla.horas} h</span>;
  }
  return (
    <span className={`${pill} ${sla.horas <= 2 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>
      Responder en {sla.horas} h
    </span>
  );
}
