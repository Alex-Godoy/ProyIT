import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth";
import {
  CheckHito,
  DatosDocumento,
  ResumenProyecto,
  TextoHito,
  TextoNovedad,
  cargarContextoProyecto,
  cargarProyecto,
} from "@/components/proyectos/detalle";
import { etiquetaCargo } from "@/lib/permisos";

export default async function DetalleProyectoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUsuario();

  const datos = await cargarProyecto(supabase, id);
  if (!datos) notFound();
  const { proyecto, hitos, novedades, documentos, urls } = datos;
  const completados = hitos.filter((h) => h.completado_at).length;
  const { equipo } = await cargarContextoProyecto(supabase, proyecto);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/portal/proyectos" className="text-sm font-medium text-brand-blue hover:underline">
        ← Mis proyectos
      </Link>

      <div className="mt-3">
        <ResumenProyecto proyecto={proyecto} />
      </div>

      {equipo.length > 0 && (
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-ink">Tu equipo ProyIT</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {equipo.map((e) => (
              <li key={e.nombre + e.cargo} className="flex items-center gap-3 rounded-xl px-3 py-2 ring-1 ring-slate-200">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/5 text-sm font-bold text-navy">
                  {e.nombre.charAt(0).toUpperCase()}
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink">{e.nombre}</span>
                  <span className="block text-xs text-muted">{etiquetaCargo(e.cargo)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">Hitos</h2>
            {hitos.length > 0 && (
              <span className="text-sm text-muted">
                {completados} de {hitos.length} completados
              </span>
            )}
          </div>
          {hitos.length === 0 ? (
            <p className="mt-4 text-muted">Todavía no hay hitos definidos.</p>
          ) : (
            <ol className="mt-4 space-y-4">
              {hitos.map((h) => (
                <li key={h.id} className="flex gap-3">
                  <CheckHito completado={!!h.completado_at} />
                  <TextoHito hito={h} />
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
          <h2 className="text-lg font-semibold text-ink">Documentos</h2>
          {documentos.length === 0 ? (
            <p className="mt-4 text-muted">Sin documentos por ahora.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {documentos.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                  <DatosDocumento documento={d} />
                  {urls[d.storage_path] && (
                    <a
                      href={urls[d.storage_path]}
                      className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-navy hover:bg-slate-50"
                    >
                      Descargar
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-ink">Bitácora</h2>
        {novedades.length === 0 ? (
          <p className="mt-4 text-muted">Aquí verás las novedades a medida que avancemos.</p>
        ) : (
          <ul className="mt-4 space-y-5">
            {novedades.map((n) => (
              <li key={n.id}>
                <TextoNovedad novedad={n} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
