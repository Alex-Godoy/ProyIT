import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatearFecha, formatearFechaHora } from "@/lib/proyectos";
import { COLUMNAS_SOLICITUD, ESTADOS_SOLICITUD, etiquetaTipo, type Solicitud } from "@/lib/derechos";
import { Avisos } from "@/components/admin/avisos";
import { BotonEnviar, inputClase, labelClase } from "@/components/admin/ui";
import { actualizarSolicitudAction } from "../actions";
import { CabeceraPagina, CuerpoPagina } from "@/components/portal/ui";

export const metadata = { title: "Solicitudes de derechos · Administración ProyIT" };

function diasRestantes(plazo: string) {
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(new Date());
  return Math.round((Date.parse(plazo) - Date.parse(hoy)) / 86_400_000);
}

export default async function AdminSolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("solicitudes_derechos")
    .select(COLUMNAS_SOLICITUD)
    .order("estado", { ascending: true })
    .order("plazo_respuesta", { ascending: true });
  const solicitudes = (data ?? []) as Solicitud[];
  const abiertas = solicitudes.filter((s) => s.estado === "recibida" || s.estado === "en_proceso");
  const cerradas = solicitudes.filter((s) => s.estado === "respondida" || s.estado === "rechazada");

  return (
    <main>
      <CabeceraPagina
        ancho="medio"
        cejaTexto="Ley 21.719"
        bajada="Acceso, rectificación, supresión, oposición, portabilidad y bloqueo. El plazo legal de respuesta es de 30 días corridos, prorrogable una vez por 30 días más informando al titular."
      >
        Solicitudes de derechos
      </CabeceraPagina>
      <CuerpoPagina ancho="medio">
        <Avisos error={error} />

        <section className="mt-6">
          <h2 className="font-display text-xl font-bold text-tinta">Pendientes ({abiertas.length})</h2>
          {abiertas.length === 0 ? (
            <p className="mt-3 rounded-[18px] bg-white p-6 text-center text-muted ring-1 ring-linea">
              No hay solicitudes pendientes.
            </p>
          ) : (
            <ul className="mt-3 space-y-4">
              {abiertas.map((s) => {
                const dias = diasRestantes(s.plazo_respuesta);
                const urgencia =
                  dias < 0 ? "bg-red-600 text-white" : dias <= 5 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800";
                return (
                  <li key={s.id} className="rounded-[18px] bg-white p-5 shadow-sm ring-1 ring-linea sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">{etiquetaTipo(s.tipo)}</p>
                        <p className="truncate text-sm text-muted">
                          {s.email} · recibida {formatearFechaHora(s.created_at)}
                        </p>
                      </div>
                      <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${urgencia}`}>
                        {dias < 0 ? `Vencida hace ${-dias} días` : dias === 0 ? "Vence hoy" : `Vence en ${dias} días`}
                      </span>
                    </div>
                    {s.detalle && <p className="mt-3 whitespace-pre-line rounded-lg bg-fondo p-3 text-sm text-ink">{s.detalle}</p>}

                    <form action={actualizarSolicitudAction.bind(null, s.id)} className="mt-4 space-y-3">
                      <div>
                        <label htmlFor={`respuesta-${s.id}`} className={labelClase}>
                          Respuesta al titular
                        </label>
                        <textarea
                          id={`respuesta-${s.id}`}
                          name="respuesta"
                          rows={3}
                          defaultValue={s.respuesta ?? ""}
                          placeholder="Lo que verá la persona en “Mis datos”."
                          className={inputClase}
                        />
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="sm:w-56">
                          <label htmlFor={`estado-${s.id}`} className={labelClase}>
                            Estado
                          </label>
                          <select id={`estado-${s.id}`} name="estado" defaultValue={s.estado} className={inputClase}>
                            {Object.entries(ESTADOS_SOLICITUD).map(([valor, e]) => (
                              <option key={valor} value={valor}>
                                {e.etiqueta}
                              </option>
                            ))}
                          </select>
                        </div>
                        <BotonEnviar>Guardar</BotonEnviar>
                      </div>
                    </form>
                    {s.tipo === "supresion" && (
                      <p className="mt-3 text-xs text-muted">
                        Para eliminar la cuenta: quita sus accesos en la ficha del cliente y borra el usuario desde Supabase
                        → Authentication → Users. Conserva solo lo que exija la ley (p. ej. tributario).
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {cerradas.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl font-bold text-tinta">Cerradas</h2>
            <div className="mt-3 overflow-x-auto rounded-[18px] bg-white shadow-sm ring-1 ring-linea">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-linea text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Titular</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Recibida</th>
                    <th className="px-4 py-3 font-medium">Cerrada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linea/70">
                  {cerradas.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-3 text-ink">{etiquetaTipo(s.tipo)}</td>
                      <td className="px-4 py-3 text-ink">{s.email}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADOS_SOLICITUD[s.estado].clase}`}>
                          {ESTADOS_SOLICITUD[s.estado].etiqueta}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">{formatearFecha(s.created_at)}</td>
                      <td className="px-4 py-3 text-muted">{s.respondida_at ? formatearFecha(s.respondida_at) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <p className="mt-8 text-sm text-muted">
          Los cambios quedan registrados en la bitácora de auditoría. Ver{" "}
          <Link href="/privacidad" className="text-acento hover:underline">
            Política de Privacidad
          </Link>
          .
        </p>
      </CuerpoPagina>
    </main>
  );
}
