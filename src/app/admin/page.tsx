import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { nombreVisible } from "@/lib/clientes";
import { etiquetaTipo } from "@/lib/derechos";
import { COLUMNAS_PROYECTO, formatearFecha, formatearFechaHora, type Proyecto } from "@/lib/proyectos";
import { BarraAvance, EtapaBadge } from "@/components/proyectos/ui";

export const metadata = { title: "Resumen · Administración ProyIT" };

type ClienteMin = { nombre: string; nombre_fantasia: string | null };
type FilaProyecto = Proyecto & { cliente: ClienteMin | null };
type HitoVencido = {
  id: string;
  titulo: string;
  fecha_estimada: string;
  proyecto: { id: string; nombre: string } | null;
};
type AccesoPendiente = { id: string; email: string; cliente: ({ id: string } & ClienteMin) | null };

const EN_CURSO = ["planificacion", "en_ejecucion", "en_pruebas"];
const DIAS_SIN_ACTUALIZAR = 14;

// Fecha de hoy en Chile como "YYYY-MM-DD" (para comparar con columnas date).
function hoyChile() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(new Date());
}

function saludo() {
  const hora = Number(
    new Intl.DateTimeFormat("es-CL", { hour: "numeric", hour12: false, timeZone: "America/Santiago" }).format(new Date()),
  );
  return hora < 12 ? "Buenos días" : hora < 20 ? "Buenas tardes" : "Buenas noches";
}

export default async function AdminResumenPage() {
  const { supabase, perfil } = await requireAdmin();
  const hoy = hoyChile();
  const limiteActualizacion = new Date(Date.now() - DIAS_SIN_ACTUALIZAR * 86_400_000).toISOString();
  const contar = (tabla: string) => supabase.from(tabla).select("id", { count: "exact", head: true });

  const [
    empresas,
    personas,
    enCurso,
    totalClientes,
    totalAccesos,
    totalProyectos,
    totalNovedades,
    pendientesRes,
    vencidosRes,
    sinActualizarRes,
    recientesRes,
    solicitudesRes,
  ] = await Promise.all([
    contar("clientes").eq("tipo", "empresa").eq("activo", true),
    contar("clientes").eq("tipo", "persona").eq("activo", true),
    contar("proyectos").in("etapa", EN_CURSO),
    contar("clientes"),
    contar("cliente_accesos"),
    contar("proyectos"),
    contar("proyecto_novedades"),
    supabase
      .from("cliente_accesos")
      .select("id, email, cliente:clientes(id, nombre, nombre_fantasia)", { count: "exact" })
      .is("user_id", null)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("proyecto_hitos")
      .select("id, titulo, fecha_estimada, proyecto:proyectos(id, nombre)", { count: "exact" })
      .is("completado_at", null)
      .lt("fecha_estimada", hoy)
      .order("fecha_estimada")
      .limit(4),
    supabase
      .from("proyectos")
      .select("id, nombre, updated_at", { count: "exact" })
      .in("etapa", EN_CURSO)
      .lt("updated_at", limiteActualizacion)
      .order("updated_at")
      .limit(4),
    supabase
      .from("proyectos")
      .select(`${COLUMNAS_PROYECTO}, cliente:clientes(nombre, nombre_fantasia)`)
      .in("etapa", EN_CURSO)
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("solicitudes_derechos")
      .select("id, tipo, email, plazo_respuesta", { count: "exact" })
      .in("estado", ["recibida", "en_proceso"])
      .order("plazo_respuesta")
      .limit(4),
  ]);

  const pendientes = (pendientesRes.data ?? []) as unknown as AccesoPendiente[];
  const vencidos = (vencidosRes.data ?? []) as unknown as HitoVencido[];
  const sinActualizar = (sinActualizarRes.data ?? []) as { id: string; nombre: string; updated_at: string }[];
  const proyectos = (recientesRes.data ?? []) as unknown as FilaProyecto[];

  const nPendientes = pendientesRes.count ?? 0;
  const nVencidos = vencidosRes.count ?? 0;
  const nSinActualizar = sinActualizarRes.count ?? 0;
  const solicitudes = (solicitudesRes.data ?? []) as { id: string; tipo: string; email: string; plazo_respuesta: string }[];
  const nSolicitudes = solicitudesRes.count ?? 0;
  const nAtencion = nSolicitudes + nPendientes + nVencidos + nSinActualizar;

  const pasos = [
    { hecho: (totalClientes.count ?? 0) > 0, titulo: "Crea tu primer cliente", texto: "Una empresa o una persona.", href: "/admin/clientes/nuevo" },
    { hecho: (totalAccesos.count ?? 0) > 0, titulo: "Dale acceso al portal", texto: "Agrega el correo con el que se registrará.", href: "/admin/clientes" },
    { hecho: (totalProyectos.count ?? 0) > 0, titulo: "Crea un proyecto", texto: "Con etapa, avance e hitos.", href: "/admin/proyectos/nuevo" },
    { hecho: (totalNovedades.count ?? 0) > 0, titulo: "Publica la primera novedad", texto: "Tu cliente la verá en su bitácora.", href: "/admin/proyectos" },
  ];
  const pasosHechos = pasos.filter((p) => p.hecho).length;

  const kpis = [
    { etiqueta: "Empresas activas", valor: empresas.count ?? 0, href: "/admin/clientes?tipo=empresa", icono: IconoEmpresa },
    { etiqueta: "Personas activas", valor: personas.count ?? 0, href: "/admin/clientes?tipo=persona", icono: IconoPersona },
    { etiqueta: "Proyectos en curso", valor: enCurso.count ?? 0, href: "/admin/proyectos", icono: IconoProyecto },
    { etiqueta: "Requieren atención", valor: nAtencion, href: "#atencion", icono: IconoAlerta, alerta: nAtencion > 0 },
  ];

  const fechaLarga = new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Santiago",
  }).format(new Date());

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand-blue/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-10 h-72 w-72 rounded-full bg-brand-orange/15 blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium capitalize text-white/60">{fechaLarga}</p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
              {saludo()}, {perfil?.full_name?.split(" ")[0] ?? "super usuario"}
            </h1>
            <p className="mt-2 max-w-xl text-white/75">
              {nAtencion > 0
                ? `Tienes ${nAtencion} ${nAtencion === 1 ? "tema que requiere" : "temas que requieren"} tu atención.`
                : (enCurso.count ?? 0) > 0
                  ? "Todo al día. Tus clientes ven el avance de sus proyectos en tiempo real."
                  : "Administra tus clientes y mantén al día el avance de sus proyectos."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin/clientes/nuevo"
              className="rounded-lg bg-brand-orange px-5 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-brand-orange/30 transition hover:bg-brand-orange-dark"
            >
              + Nuevo cliente
            </Link>
            <Link
              href="/admin/proyectos/nuevo"
              className="rounded-lg border border-white/30 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/10"
            >
              + Nuevo proyecto
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 pt-6 lg:grid-cols-4">
          {kpis.map((k) => (
            <Link
              key={k.etiqueta}
              href={k.href}
              className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md hover:ring-brand-blue sm:gap-4 sm:p-5"
            >
              <span
                className={`hidden rounded-xl p-2.5 sm:inline-flex ${
                  k.alerta ? "bg-brand-orange/10 text-brand-orange-dark" : "bg-navy/5 text-navy"
                }`}
              >
                <k.icono />
              </span>
              <span className="min-w-0">
                <span className={`block text-2xl font-bold sm:text-3xl ${k.alerta ? "text-brand-orange-dark" : "text-navy"}`}>
                  {k.valor}
                </span>
                <span className="block text-xs text-muted sm:text-sm">{k.etiqueta}</span>
              </span>
            </Link>
          ))}
        </div>

        {/* Primeros pasos (se oculta cuando todo está hecho) */}
        {pasosHechos < pasos.length && (
          <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">Primeros pasos</h2>
                <p className="text-sm text-muted">Deja el portal listo para tus clientes.</p>
              </div>
              <span className="text-sm font-semibold text-navy">
                {pasosHechos} de {pasos.length}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-orange transition-all"
                style={{ width: `${(pasosHechos / pasos.length) * 100}%` }}
              />
            </div>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {pasos.map((p, i) => (
                <li key={p.titulo}>
                  <Link
                    href={p.href}
                    className={`flex h-full gap-3 rounded-xl p-3 ring-1 transition ${
                      p.hecho ? "bg-emerald-50/60 ring-emerald-100" : "ring-slate-200 hover:ring-brand-blue"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        p.hecho ? "bg-emerald-500 text-white" : "bg-navy/5 text-navy"
                      }`}
                    >
                      {p.hecho ? "✓" : i + 1}
                    </span>
                    <span>
                      <span className={`block text-sm font-semibold ${p.hecho ? "text-muted line-through" : "text-ink"}`}>
                        {p.titulo}
                      </span>
                      <span className="block text-xs text-muted">{p.texto}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Proyectos en curso */}
          <section className="lg:col-span-2">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold text-ink">Proyectos en curso</h2>
              <Link href="/admin/proyectos" className="text-sm font-medium text-brand-blue hover:underline">
                Ver todos →
              </Link>
            </div>
            {proyectos.length === 0 ? (
              <div className="mt-3 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                <p className="font-medium text-ink">No hay proyectos en curso.</p>
                <p className="mt-1 text-sm text-muted">Cuando crees uno, aquí verás su avance de un vistazo.</p>
              </div>
            ) : (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {proyectos.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/proyectos/${p.id}`}
                      className="flex h-full flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md hover:ring-brand-blue sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-navy">{p.nombre}</p>
                          <p className="truncate text-sm text-muted">{p.cliente ? nombreVisible(p.cliente) : ""}</p>
                        </div>
                        <EtapaBadge etapa={p.etapa} />
                      </div>
                      <div className="mt-auto pt-4">
                        <BarraAvance avance={p.avance} />
                        <p className="mt-2 text-xs text-muted">Actualizado {formatearFechaHora(p.updated_at)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Requiere tu atención */}
          <section id="atencion" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-ink">Requiere tu atención</h2>
            {nAtencion === 0 ? (
              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  ✓
                </span>
                <p className="text-sm text-emerald-900">Nada pendiente. ¡Buen trabajo!</p>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {nSolicitudes > 0 && (
                  <GrupoAtencion titulo="Solicitudes de derechos (plazo legal)" total={nSolicitudes} tono="rojo">
                    {solicitudes.map((s) => (
                      <ItemAtencion
                        key={s.id}
                        href="/admin/solicitudes"
                        principal={`${etiquetaTipo(s.tipo)} · ${s.email}`}
                        secundario={`Responder antes del ${formatearFecha(s.plazo_respuesta)}`}
                      />
                    ))}
                  </GrupoAtencion>
                )}
                {nVencidos > 0 && (
                  <GrupoAtencion titulo="Hitos atrasados" total={nVencidos} tono="rojo">
                    {vencidos.map((h) => (
                      <ItemAtencion
                        key={h.id}
                        href={h.proyecto ? `/admin/proyectos/${h.proyecto.id}` : "/admin/proyectos"}
                        principal={h.titulo}
                        secundario={`${h.proyecto?.nombre ?? ""} · vencía el ${formatearFecha(h.fecha_estimada)}`}
                      />
                    ))}
                  </GrupoAtencion>
                )}
                {nSinActualizar > 0 && (
                  <GrupoAtencion titulo={`Sin novedades hace +${DIAS_SIN_ACTUALIZAR} días`} total={nSinActualizar} tono="ambar">
                    {sinActualizar.map((p) => (
                      <ItemAtencion
                        key={p.id}
                        href={`/admin/proyectos/${p.id}`}
                        principal={p.nombre}
                        secundario={`Última actualización ${formatearFechaHora(p.updated_at)}`}
                      />
                    ))}
                  </GrupoAtencion>
                )}
                {nPendientes > 0 && (
                  <GrupoAtencion titulo="Accesos sin registrarse" total={nPendientes} tono="azul">
                    {pendientes.map((a) => (
                      <ItemAtencion
                        key={a.id}
                        href={a.cliente ? `/admin/clientes/${a.cliente.id}` : "/admin/clientes"}
                        principal={a.email}
                        secundario={a.cliente ? nombreVisible(a.cliente) : ""}
                      />
                    ))}
                  </GrupoAtencion>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------

const TONOS = {
  rojo: "bg-red-50 text-red-700",
  ambar: "bg-amber-50 text-amber-800",
  azul: "bg-brand-blue/10 text-navy",
};

function GrupoAtencion({
  titulo,
  total,
  tono,
  children,
}: {
  titulo: string;
  total: number;
  tono: keyof typeof TONOS;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className={`flex items-center justify-between px-4 py-2.5 text-sm font-semibold ${TONOS[tono]}`}>
        <span>{titulo}</span>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs">{total}</span>
      </div>
      <ul className="divide-y divide-slate-100">{children}</ul>
    </div>
  );
}

function ItemAtencion({ href, principal, secundario }: { href: string; principal: string; secundario: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-slate-50">
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-ink">{principal}</span>
          <span className="block truncate text-xs text-muted">{secundario}</span>
        </span>
        <span className="text-muted" aria-hidden>
          →
        </span>
      </Link>
    </li>
  );
}

const iconoClase = "h-5 w-5";
const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function IconoEmpresa() {
  return (
    <svg viewBox="0 0 24 24" className={iconoClase} {...trazo} aria-hidden>
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1" />
    </svg>
  );
}
function IconoPersona() {
  return (
    <svg viewBox="0 0 24 24" className={iconoClase} {...trazo} aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
function IconoProyecto() {
  return (
    <svg viewBox="0 0 24 24" className={iconoClase} {...trazo} aria-hidden>
      <path d="M3 3v18h18" />
      <path d="m7 15 4-4 3 3 5-6" />
    </svg>
  );
}
function IconoAlerta() {
  return (
    <svg viewBox="0 0 24 24" className={iconoClase} {...trazo} aria-hidden>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
  );
}
