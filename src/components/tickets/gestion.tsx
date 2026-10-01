import { ESTADOS_TICKET, PRIORIDADES, type Ticket } from "@/lib/tickets";
import { etiquetaCargo } from "@/lib/permisos";
import { BotonEnviar, inputClase, labelClase } from "@/components/admin/ui";
import { actualizarTicketAction, asignarResponsableAction } from "@/app/tickets-acciones";

export type OpcionResponsable = { id: string; nombre: string; cargo: string; sugerido: boolean };

export default function PanelGestionTicket({
  ticket,
  base,
  responsables,
}: {
  ticket: Ticket;
  base: "/admin/tickets" | "/equipo/tickets";
  // Solo el super usuario asigna responsable.
  responsables?: OpcionResponsable[];
}) {
  return (
    <section className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      {responsables && (
        <form action={asignarResponsableAction.bind(null, ticket.id)} className="space-y-2">
          <label htmlFor="responsable_id" className={labelClase}>
            Responsable
          </label>
          <select
            id="responsable_id"
            name="responsable_id"
            defaultValue={ticket.responsable_id ?? ""}
            className={`${inputClase} ${!ticket.responsable_id ? "border-brand-orange ring-2 ring-brand-orange/20" : ""}`}
          >
            <option value="">— Sin asignar —</option>
            {responsables.some((r) => r.sugerido) && (
              <optgroup label="Equipo del proyecto">
                {responsables
                  .filter((r) => r.sugerido)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} — {etiquetaCargo(r.cargo)}
                    </option>
                  ))}
              </optgroup>
            )}
            <optgroup label={responsables.some((r) => r.sugerido) ? "Resto del equipo" : "Equipo"}>
              {responsables
                .filter((r) => !r.sugerido)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} — {etiquetaCargo(r.cargo)}
                  </option>
                ))}
            </optgroup>
          </select>
          <BotonEnviar variante="secundario">{ticket.responsable_id ? "Reasignar" : "Asignar"}</BotonEnviar>
        </form>
      )}

      <form
        action={actualizarTicketAction.bind(null, base, ticket.id)}
        className={`space-y-3 ${responsables ? "border-t border-slate-100 pt-5" : ""}`}
      >
        <div>
          <label htmlFor="estado" className={labelClase}>
            Estado
          </label>
          <select id="estado" name="estado" defaultValue={ticket.estado} className={inputClase}>
            {ESTADOS_TICKET.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.etiqueta}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="prioridad" className={labelClase}>
            Prioridad
          </label>
          <select id="prioridad" name="prioridad" defaultValue={ticket.prioridad} className={inputClase}>
            {PRIORIDADES.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.etiqueta} (responder en {p.horas} h)
              </option>
            ))}
          </select>
        </div>
        <BotonEnviar>Guardar</BotonEnviar>
      </form>
    </section>
  );
}
