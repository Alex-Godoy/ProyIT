import Link from "next/link";
import { formatearFechaHora } from "@/lib/proyectos";
import { numeroTicket, type Ticket } from "@/lib/tickets";
import { EstadoTicketBadge, PrioridadBadge, SlaBadge } from "@/components/tickets/ui";

export type FilaTicket = Ticket & {
  cliente?: { nombre: string; nombre_fantasia: string | null } | null;
  proyecto?: { nombre: string } | null;
};

export default function ListaTickets({
  tickets,
  base,
  vista,
  vacio,
}: {
  tickets: FilaTicket[];
  base: string;
  vista: "cliente" | "equipo";
  vacio: string;
}) {
  if (tickets.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-muted">{vacio}</div>
    );
  }
  return (
    <ul className="mt-4 space-y-3">
      {tickets.map((t) => (
        <li key={t.id}>
          <Link
            href={`${base}/${t.id}`}
            className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md hover:ring-brand-blue sm:p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted">{numeroTicket(t.numero)}</span>
              <EstadoTicketBadge estado={t.estado} vista={vista} />
              <PrioridadBadge prioridad={t.prioridad} />
              {vista === "equipo" && <SlaBadge ticket={t} />}
              {vista === "equipo" && !t.responsable_id && (
                <span className="rounded-full bg-brand-orange px-2.5 py-0.5 text-xs font-semibold text-white">Sin asignar</span>
              )}
            </div>
            <p className="mt-2 font-semibold text-navy">{t.asunto}</p>
            <p className="mt-0.5 truncate text-sm text-muted">
              {[
                vista === "equipo" ? (t.cliente?.nombre_fantasia ?? t.cliente?.nombre) : null,
                t.proyecto?.nombre ?? "Soporte general",
                `actualizado ${formatearFechaHora(t.updated_at)}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
