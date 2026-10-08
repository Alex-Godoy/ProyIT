import { requireAdmin } from "@/lib/auth";
import { formatearFechaHora } from "@/lib/proyectos";
import { ESTADOS_DIAGNOSTICO, HORARIOS } from "@/lib/sitio";
import { BotonEnviar, inputClase, labelClase } from "@/components/admin/ui";
import { actualizarDiagnosticoAction } from "@/app/diagnostico-acciones";

export const metadata = { title: "Diagnósticos · Administración ProyIT" };

type Diagnostico = {
  id: string;
  nombre: string;
  empresa: string | null;
  email: string;
  telefono: string | null;
  interes: string | null;
  mensaje: string | null;
  horario: string | null;
  origen: string | null;
  estado: string;
  notas: string | null;
  created_at: string;
};

const COLOR_ESTADO: Record<string, string> = {
  nueva: "bg-brand-orange/10 text-brand-orange-dark",
  contactada: "bg-sky-100 text-sky-800",
  agendada: "bg-emerald-100 text-emerald-800",
  descartada: "bg-slate-100 text-slate-600",
};

const etiquetaEstado = (v: string) => ESTADOS_DIAGNOSTICO.find((e) => e.valor === v)?.etiqueta ?? v;
const etiquetaHorario = (v: string | null) => HORARIOS.find((h) => h.valor === v)?.etiqueta ?? null;

export default async function AdminDiagnosticosPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("solicitudes_diagnostico")
    .select("id, nombre, empresa, email, telefono, interes, mensaje, horario, origen, estado, notas, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const solicitudes = (data ?? []) as Diagnostico[];
  const abiertas = solicitudes.filter((s) => s.estado === "nueva" || s.estado === "contactada");
  const cerradas = solicitudes.filter((s) => s.estado === "agendada" || s.estado === "descartada");

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-bold text-navy">Solicitudes de diagnóstico</h1>
      <p className="mt-1 max-w-2xl text-muted">
        Personas que pidieron un diagnóstico o una primera conversación desde el sitio. Contáctalas y registra en qué
        quedó cada una.
      </p>

      {[
        { titulo: "Por gestionar", lista: abiertas, vacio: "No hay solicitudes pendientes." },
        { titulo: "Cerradas", lista: cerradas, vacio: "Aún no hay solicitudes cerradas." },
      ].map((grupo) => (
        <section key={grupo.titulo} className="mt-8">
          <h2 className="text-lg font-semibold text-ink">
            {grupo.titulo} ({grupo.lista.length})
          </h2>
          {grupo.lista.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-white p-6 text-center text-muted ring-1 ring-slate-200">{grupo.vacio}</p>
          ) : (
            <ul className="mt-3 space-y-4">
              {grupo.lista.map((s) => (
                <li key={s.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">
                        {s.nombre}
                        {s.empresa && <span className="font-normal text-muted"> · {s.empresa}</span>}
                      </p>
                      <p className="mt-0.5 flex flex-wrap gap-x-3 text-sm">
                        <a href={`mailto:${s.email}`} className="text-brand-blue hover:underline">
                          {s.email}
                        </a>
                        {s.telefono && (
                          <a href={`tel:${s.telefono}`} className="text-brand-blue hover:underline">
                            {s.telefono}
                          </a>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Recibida {formatearFechaHora(s.created_at)}
                        {etiquetaHorario(s.horario) && ` · Prefiere: ${etiquetaHorario(s.horario)}`}
                        {s.origen && ` · Desde: ${s.origen}`}
                      </p>
                    </div>
                    <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${COLOR_ESTADO[s.estado] ?? ""}`}>
                      {etiquetaEstado(s.estado)}
                    </span>
                  </div>
                  {s.interes && (
                    <p className="mt-3 text-sm">
                      <span className="text-muted">Le interesa:</span> <span className="font-medium text-ink">{s.interes}</span>
                    </p>
                  )}
                  {s.mensaje && <p className="mt-2 whitespace-pre-line rounded-lg bg-surface p-3 text-sm text-ink">{s.mensaje}</p>}

                  <form action={actualizarDiagnosticoAction.bind(null, s.id)} className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
                    <div>
                      <label htmlFor={`estado-${s.id}`} className={labelClase}>
                        Estado
                      </label>
                      <select id={`estado-${s.id}`} name="estado" defaultValue={s.estado} className={inputClase}>
                        {ESTADOS_DIAGNOSTICO.map((e) => (
                          <option key={e.valor} value={e.valor}>
                            {e.etiqueta}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`notas-${s.id}`} className={labelClase}>
                        Notas internas
                      </label>
                      <input
                        id={`notas-${s.id}`}
                        name="notas"
                        defaultValue={s.notas ?? ""}
                        placeholder="Ej.: reunión el martes 10:00"
                        className={inputClase}
                      />
                    </div>
                    <BotonEnviar>Guardar</BotonEnviar>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  );
}
