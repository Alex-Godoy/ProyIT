import Link from "next/link";
import { requireEquipo } from "@/lib/auth";
import { etiquetaCargo, puede } from "@/lib/permisos";
import { COLUMNAS_PROYECTO, formatearFecha, formatearFechaHora, type Proyecto } from "@/lib/proyectos";
import { nombreVisible } from "@/lib/clientes";
import { BarraAvance, EtapaBadge } from "@/components/proyectos/ui";
import { ChipSinLeer, cargarSinLeer } from "@/components/proyectos/sin-leer";
import { ESTADOS_ABIERTOS, estadoSla, type Ticket } from "@/lib/tickets";

type FilaProyecto = Proyecto & { cliente: { nombre: string; nombre_fantasia: string | null } | null };

export default async function EquipoInicioPage() {
  const { supabase, miembro } = await requireEquipo();

  // RLS devuelve solo los proyectos asignados a esta persona.
  const [{ data }, { data: ticketsData }, sinLeer] = await Promise.all([
    supabase
      .from("proyectos")
      .select(`${COLUMNAS_PROYECTO}, cliente:clientes(nombre, nombre_fantasia)`)
      .order("updated_at", { ascending: false }),
    // Tickets abiertos de los que es responsable (RLS).
    supabase
      .from("tickets")
      .select("vence_at, primera_respuesta_at, estado")
      .in("estado", ESTADOS_ABIERTOS),
    cargarSinLeer(supabase),
  ]);
  const proyectos = (data ?? []) as unknown as FilaProyecto[];
  const tickets = (ticketsData ?? []) as Pick<Ticket, "vence_at" | "primera_respuesta_at" | "estado">[];
  const ticketsVencidos = tickets.filter((t) => estadoSla(t).tipo === "vencido").length;
  const enCurso = proyectos.filter((p) => p.etapa !== "entregado");
  const entregados = proyectos.filter((p) => p.etapa === "entregado");

  const permisos = [
    puede(miembro.cargo, "hito_completar") && "completar hitos",
    puede(miembro.cargo, "documento_subir") && "subir documentos",
    puede(miembro.cargo, "novedad_publicar") && "publicar novedades",
    puede(miembro.cargo, "avance_editar") && "actualizar el avance",
  ].filter(Boolean) as string[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-blue">{etiquetaCargo(miembro.cargo)}</p>
      <h1 className="mt-1 text-2xl font-bold text-navy sm:text-3xl">Hola, {miembro.nombre.split(" ")[0]}</h1>
      <p className="mt-2 max-w-2xl text-muted">
        {permisos.length > 0
          ? `En tus proyectos puedes ${permisos.join(", ").replace(/, ([^,]*)$/, " y $1")}.`
          : "Aquí ves los proyectos en los que participas."}
      </p>

      {tickets.length > 0 && (
        <Link
          href="/equipo/tickets"
          className={`mt-6 flex items-center justify-between gap-3 rounded-2xl p-4 ring-1 transition hover:shadow-md sm:p-5 ${
            ticketsVencidos > 0 ? "bg-red-50 ring-red-200" : "bg-white ring-slate-200"
          }`}
        >
          <span>
            <span className="block font-semibold text-ink">
              Tienes {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"} de soporte por atender
            </span>
            {ticketsVencidos > 0 && (
              <span className="block text-sm text-red-700">
                {ticketsVencidos} con el plazo de respuesta vencido
              </span>
            )}
          </span>
          <span className="text-sm font-semibold text-brand-blue">Ver tickets →</span>
        </Link>
      )}

      <h2 className="mt-8 text-lg font-semibold text-ink">Proyectos en curso ({enCurso.length})</h2>
      {enCurso.length === 0 ? (
        <div className="mt-3 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
          <p className="font-medium text-ink">No tienes proyectos asignados en curso.</p>
          <p className="mt-1 text-sm text-muted">Cuando te asignen a uno, aparecerá aquí.</p>
        </div>
      ) : (
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {enCurso.map((p) => (
            <li key={p.id}>
              <Link
                href={`/equipo/proyectos/${p.id}${sinLeer[p.id] ? "?tab=mensajes" : ""}`}
                className="flex h-full flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md hover:ring-brand-blue sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-navy">{p.nombre}</p>
                    <p className="truncate text-sm text-muted">{p.cliente ? nombreVisible(p.cliente) : ""}</p>
                  </div>
                  <EtapaBadge etapa={p.etapa} />
                </div>
                {sinLeer[p.id] ? (
                  <div className="mt-2">
                    <ChipSinLeer cantidad={sinLeer[p.id]} />
                  </div>
                ) : null}
                <div className="mt-auto pt-4">
                  <BarraAvance avance={p.avance} />
                  <p className="mt-2 text-xs text-muted">
                    Término estimado {formatearFecha(p.fecha_termino_estimada)} · actualizado{" "}
                    {formatearFechaHora(p.updated_at)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {entregados.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-semibold text-ink">Entregados ({entregados.length})</h2>
          <ul className="mt-3 divide-y divide-slate-100 rounded-2xl bg-white ring-1 ring-slate-200">
            {entregados.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/equipo/proyectos/${p.id}${sinLeer[p.id] ? "?tab=mensajes" : ""}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink">{p.nombre}</span>
                    <span className="block truncate text-xs text-muted">{p.cliente ? nombreVisible(p.cliente) : ""}</span>
                  </span>
                  <span className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <ChipSinLeer cantidad={sinLeer[p.id]} />
                    <EtapaBadge etapa={p.etapa} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
