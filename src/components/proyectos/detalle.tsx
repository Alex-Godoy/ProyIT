import type { SupabaseClient } from "@supabase/supabase-js";
import {
  BUCKET_DOCUMENTOS,
  COLUMNAS_PROYECTO,
  formatearFecha,
  formatearFechaHora,
  formatearTamano,
  type Documento,
  type Hito,
  type Novedad,
  type Proyecto,
} from "@/lib/proyectos";
import { BarraAvance, EtapaBadge } from "@/components/proyectos/ui";


// Carga un proyecto con sus hitos, novedades y documentos (con enlaces de
// descarga temporales). Devuelve null si no existe o RLS no lo deja ver.
export async function cargarProyecto(supabase: SupabaseClient, id: string) {
  const { data: proyecto } = await supabase
    .from("proyectos")
    .select(COLUMNAS_PROYECTO)
    .eq("id", id)
    .maybeSingle<Proyecto>();
  if (!proyecto) return null;

  const [{ data: hitos }, { data: novedades }, { data: documentos }] = await Promise.all([
    supabase
      .from("proyecto_hitos")
      .select("id, titulo, descripcion, fecha_estimada, completado_at, orden")
      .eq("proyecto_id", id)
      .order("orden")
      .order("fecha_estimada", { nullsFirst: false }),
    supabase
      .from("proyecto_novedades")
      .select("id, contenido, created_at")
      .eq("proyecto_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("proyecto_documentos")
      .select("id, nombre, storage_path, tamano_bytes, created_at")
      .eq("proyecto_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const docs = (documentos ?? []) as Documento[];
  const urls: Record<string, string> = {};
  if (docs.length > 0) {
    const { data: firmadas } = await supabase.storage
      .from(BUCKET_DOCUMENTOS)
      .createSignedUrls(docs.map((d) => d.storage_path), 900, { download: true });
    firmadas?.forEach((f) => {
      if (f.path && f.signedUrl) urls[f.path] = f.signedUrl;
    });
  }

  return {
    proyecto,
    hitos: (hitos ?? []) as Hito[],
    novedades: (novedades ?? []) as Novedad[],
    documentos: docs,
    urls,
  };
}

// Equipo asignado (solo nombre y cargo) y datos de contacto del cliente.
export async function cargarContextoProyecto(supabase: SupabaseClient, proyecto: Proyecto) {
  const [{ data: equipo }, { data: cliente }] = await Promise.all([
    supabase.rpc("equipo_del_proyecto", { p_proyecto_id: proyecto.id }),
    supabase
      .from("clientes")
      .select("nombre, tipo, telefono, email, direccion, comuna")
      .eq("id", proyecto.cliente_id)
      .maybeSingle(),
  ]);
  return {
    equipo: (equipo ?? []) as { nombre: string; cargo: string }[],
    cliente: cliente as {
      nombre: string;
      tipo: string;
      telefono: string | null;
      email: string | null;
      direccion: string | null;
      comuna: string | null;
    } | null,
  };
}

export function ResumenProyecto({ proyecto }: { proyecto: Proyecto }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">{proyecto.nombre}</h1>
        <EtapaBadge etapa={proyecto.etapa} />
      </div>
      {proyecto.descripcion && <p className="mt-3 whitespace-pre-line text-muted">{proyecto.descripcion}</p>}
      <div className="mt-6">
        <BarraAvance avance={proyecto.avance} />
      </div>
      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted">Inicio</dt>
          <dd className="font-medium text-ink">{formatearFecha(proyecto.fecha_inicio)}</dd>
        </div>
        <div>
          <dt className="text-muted">Término estimado</dt>
          <dd className="font-medium text-ink">{formatearFecha(proyecto.fecha_termino_estimada)}</dd>
        </div>
        <div>
          <dt className="text-muted">Última actualización</dt>
          <dd className="font-medium text-ink">{formatearFechaHora(proyecto.updated_at)}</dd>
        </div>
      </dl>
    </section>
  );
}

export function CheckHito({ completado }: { completado: boolean }) {
  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
        completado ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white"
      }`}
      aria-label={completado ? "Completado" : "Pendiente"}
    >
      {completado && (
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 12l5 5L20 7" />
        </svg>
      )}
    </span>
  );
}

export function TextoHito({ hito }: { hito: Hito }) {
  return (
    <div className="min-w-0">
      <p className={`font-medium ${hito.completado_at ? "text-muted line-through" : "text-ink"}`}>{hito.titulo}</p>
      {hito.descripcion && <p className="text-sm text-muted">{hito.descripcion}</p>}
      <p className="text-xs text-muted">
        {hito.completado_at
          ? `Completado el ${formatearFechaHora(hito.completado_at)}`
          : `Fecha estimada: ${formatearFecha(hito.fecha_estimada)}`}
      </p>
    </div>
  );
}

export function DatosDocumento({ documento }: { documento: Documento }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-ink">{documento.nombre}</p>
      <p className="text-xs text-muted">
        {formatearFechaHora(documento.created_at)}
        {documento.tamano_bytes ? ` · ${formatearTamano(documento.tamano_bytes)}` : ""}
      </p>
    </div>
  );
}

export function TextoNovedad({ novedad }: { novedad: Novedad }) {
  return (
    <div className="border-l-2 border-brand-blue/40 pl-4">
      <p className="text-xs font-medium text-muted">{formatearFechaHora(novedad.created_at)}</p>
      <p className="mt-1 whitespace-pre-line text-ink">{novedad.contenido}</p>
    </div>
  );
}
