import { requireAdmin } from "@/lib/auth";
import { formatearFechaHora } from "@/lib/proyectos";
import { BOTONES_WHATSAPP, ESTADOS_DIAGNOSTICO, HORARIOS, INTERES_URGENCIA, esInteresPlan } from "@/lib/sitio";
import { BotonEnviar, inputClase, labelClase } from "@/components/admin/ui";
import ContactoWhatsApp from "@/components/admin/contacto-whatsapp";
import { actualizarDiagnosticoAction } from "@/app/diagnostico-acciones";
import { CabeceraPagina, CuerpoPagina } from "@/components/portal/ui";

export const metadata = { title: "Diagnósticos · Administración ProyIT" };

type Diagnostico = {
  id: string;
  nombre: string;
  empresa: string | null;
  email: string | null;
  telefono: string | null;
  interes: string | null;
  mensaje: string | null;
  horario: string | null;
  origen: string | null;
  estado: string;
  notas: string | null;
  reserva_inicio: string | null;
  created_at: string;
};

// De dónde llegó: el formulario del home no marca nada; Cal.com y WhatsApp sí.
const CANAL: Record<string, { etiqueta: string; clase: string }> = {
  "cal.com": { etiqueta: "Cal.com", clase: "bg-emerald-100 text-emerald-800" },
  whatsapp: { etiqueta: "WhatsApp", clase: "bg-green-100 text-green-800" },
};

const DIAS_CLICS = 30;

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
  const desde = new Date(Date.now() - DIAS_CLICS * 24 * 60 * 60 * 1000).toISOString();
  const [{ data }, { data: clics }] = await Promise.all([
    supabase
      .from("solicitudes_diagnostico")
      .select("id, nombre, empresa, email, telefono, interes, mensaje, horario, origen, estado, notas, reserva_inicio, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("clics_whatsapp").select("origen").gte("created_at", desde).limit(10000),
  ]);
  const solicitudes = (data ?? []) as Diagnostico[];

  const clicsPorBoton = new Map<string, number>();
  for (const c of clics ?? []) clicsPorBoton.set(c.origen, (clicsPorBoton.get(c.origen) ?? 0) + 1);
  const rankingClics = [...clicsPorBoton].sort((a, b) => b[1] - a[1]);
  const totalClics = clics?.length ?? 0;
  const etiquetaBoton = (b: string) => BOTONES_WHATSAPP[b as keyof typeof BOTONES_WHATSAPP] ?? b;

  // Las urgencias técnicas van primero: hay que contactarlas el mismo día.
  const esUrgente = (s: Diagnostico) => s.interes === INTERES_URGENCIA;
  const abiertas = solicitudes
    .filter((s) => s.estado === "nueva" || s.estado === "contactada")
    .sort((a, b) => Number(esUrgente(b)) - Number(esUrgente(a)));
  // Reuniones de Cal.com que aún no ocurren, de la más cercana a la más lejana.
  const ahora = new Date().toISOString();
  const esProxima = (s: Diagnostico) => s.estado === "agendada" && !!s.reserva_inicio && s.reserva_inicio >= ahora;
  const proximas = solicitudes
    .filter(esProxima)
    .sort((a, b) => (a.reserva_inicio ?? "").localeCompare(b.reserva_inicio ?? ""));
  const cerradas = solicitudes.filter((s) => (s.estado === "agendada" && !esProxima(s)) || s.estado === "descartada");

  return (
    <main>
      <CabeceraPagina
        ancho="medio"
        cejaTexto="Contactos web"
        bajada="Diagnósticos, urgencias técnicas e interés en planes de soporte que llegan desde el home, las reuniones reservadas en Cal.com y los contactos de WhatsApp. Contacta a cada persona y registra en qué quedó. Las urgencias aparecen primero."
      >
        Solicitudes del sitio
      </CabeceraPagina>
      <CuerpoPagina ancho="medio">
        <ContactoWhatsApp />

        <section className="mt-6 rounded-[18px] bg-white p-5 shadow-sm ring-1 ring-linea sm:p-6">
          <h2 className="font-semibold text-ink">
            Clics en WhatsApp · últimos {DIAS_CLICS} días <span className="text-muted">({totalClics})</span>
          </h2>
          <p className="mt-1 text-sm text-muted">
            Cuántas veces se tocó cada botón de WhatsApp del sitio. Sirve para saber cuál funciona; quién escribió lo
            registras arriba.
          </p>
          {rankingClics.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Aún no hay clics registrados.</p>
          ) : (
            <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
              {rankingClics.map(([boton, n]) => (
                <li key={boton} className="flex justify-between gap-4 border-b border-linea/70 py-1">
                  <span className="text-ink">{etiquetaBoton(boton)}</span>
                  <span className="font-semibold text-navy">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {[
          { titulo: "Próximas reuniones", lista: proximas, vacio: "No hay reuniones agendadas en Cal.com." },
          { titulo: "Por gestionar", lista: abiertas, vacio: "No hay solicitudes pendientes." },
          { titulo: "Cerradas", lista: cerradas, vacio: "Aún no hay solicitudes cerradas." },
        ].map((grupo) => (
          <section key={grupo.titulo} className="mt-8">
            <h2 className="font-display text-xl font-bold text-tinta">
              {grupo.titulo} ({grupo.lista.length})
            </h2>
            {grupo.lista.length === 0 ? (
              <p className="mt-3 rounded-[18px] bg-white p-6 text-center text-muted ring-1 ring-linea">{grupo.vacio}</p>
            ) : (
              <ul className="mt-3 space-y-4">
                {grupo.lista.map((s) => (
                  <li
                    key={s.id}
                    className={`rounded-[18px] bg-white p-5 shadow-sm sm:p-6 ${
                      esUrgente(s) && grupo.titulo === "Por gestionar" ? "ring-2 ring-brand-orange" : "ring-1 ring-linea"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">
                          {esUrgente(s) && (
                            <span className="mr-2 rounded-full bg-brand-orange-text px-2 py-0.5 align-middle text-[11px] font-bold uppercase tracking-wide text-white">
                              Urgente
                            </span>
                          )}
                          {s.origen && CANAL[s.origen] && (
                            <span
                              className={`mr-2 rounded-full px-2 py-0.5 align-middle text-[11px] font-bold uppercase tracking-wide ${CANAL[s.origen].clase}`}
                            >
                              {CANAL[s.origen].etiqueta}
                            </span>
                          )}
                          {esInteresPlan(s.interes) && (
                            <span className="mr-2 rounded-full bg-sky-100 px-2 py-0.5 align-middle text-[11px] font-bold uppercase tracking-wide text-sky-800">
                              Plan de soporte
                            </span>
                          )}
                          {s.nombre}
                          {s.empresa && <span className="font-normal text-muted"> · {s.empresa}</span>}
                        </p>
                        <p className="mt-0.5 flex flex-wrap gap-x-3 text-sm">
                          {s.email && (
                            <a href={`mailto:${s.email}`} className="text-acento hover:underline">
                              {s.email}
                            </a>
                          )}
                          {s.telefono && (
                            <a href={`tel:${s.telefono}`} className="text-acento hover:underline">
                              {s.telefono}
                            </a>
                          )}
                        </p>
                        {s.reserva_inicio && (
                          <p className="mt-1 text-sm font-medium text-emerald-800">
                            Reunión: {formatearFechaHora(s.reserva_inicio)}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted">
                          Recibida {formatearFechaHora(s.created_at)}
                          {etiquetaHorario(s.horario) && ` · Prefiere: ${etiquetaHorario(s.horario)}`}
                          {s.origen && !CANAL[s.origen] && ` · Desde: ${s.origen}`}
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
                    {s.mensaje && <p className="mt-2 whitespace-pre-line rounded-lg bg-fondo p-3 text-sm text-ink">{s.mensaje}</p>}

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
      </CuerpoPagina>
    </main>
  );
}
