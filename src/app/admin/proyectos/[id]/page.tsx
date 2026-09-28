import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { cargarOpcionesClientes } from "@/lib/admin-datos";
import {
  CheckHito,
  DatosDocumento,
  TextoHito,
  TextoNovedad,
  cargarProyecto,
} from "@/components/proyectos/detalle";
import ProyectoForm from "@/components/admin/proyecto-form";
import SubirDocumento from "@/components/admin/subir-documento";
import { Avisos } from "@/components/admin/avisos";
import { BotonEnviar, inputClase, labelClase } from "@/components/admin/ui";
import {
  actualizarProyectoAction,
  alternarHitoAction,
  crearHitoAction,
  crearNovedadAction,
  eliminarDocumentoAction,
  eliminarHitoAction,
  eliminarNovedadAction,
  eliminarProyectoAction,
} from "../../actions";

const tarjeta = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6";

export default async function AdminProyectoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { id } = await params;
  const { error, ok } = await searchParams;
  const { supabase } = await requireAdmin();

  const [datos, clientes] = await Promise.all([cargarProyecto(supabase, id), cargarOpcionesClientes(supabase)]);
  if (!datos) notFound();
  const { proyecto, hitos, novedades, documentos, urls } = datos;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/proyectos" className="text-sm font-medium text-brand-blue hover:underline">
          ← Proyectos
        </Link>
        <Link
          href={`/portal/proyectos/${proyecto.id}`}
          className="text-sm font-medium text-brand-blue hover:underline"
        >
          Ver como cliente →
        </Link>
      </div>
      <h1 className="mt-3 text-2xl font-bold text-navy">{proyecto.nombre}</h1>
      <Avisos error={error} ok={ok} />

      <section className={`mt-6 ${tarjeta}`}>
        <h2 className="mb-5 text-lg font-semibold text-ink">Datos del proyecto</h2>
        <ProyectoForm
          action={actualizarProyectoAction.bind(null, proyecto.id)}
          proyecto={proyecto}
          clientes={clientes}
          textoBoton="Guardar cambios"
        />
      </section>

      <section className={`mt-6 ${tarjeta}`}>
        <h2 className="text-lg font-semibold text-ink">Hitos</h2>
        {hitos.length === 0 ? (
          <p className="mt-3 text-muted">Sin hitos todavía.</p>
        ) : (
          <ol className="mt-4 divide-y divide-slate-100">
            {hitos.map((h) => (
              <li key={h.id} className="flex items-start justify-between gap-3 py-3">
                <div className="flex gap-3">
                  <form action={alternarHitoAction.bind(null, proyecto.id, h.id, !!h.completado_at)}>
                    <button type="submit" title={h.completado_at ? "Marcar pendiente" : "Marcar completado"}>
                      <CheckHito completado={!!h.completado_at} />
                    </button>
                  </form>
                  <TextoHito hito={h} />
                </div>
                <form action={eliminarHitoAction.bind(null, proyecto.id, h.id)}>
                  <BotonEnviar variante="peligro" confirmar={`¿Eliminar el hito "${h.titulo}"?`}>
                    Eliminar
                  </BotonEnviar>
                </form>
              </li>
            ))}
          </ol>
        )}

        <form
          action={crearHitoAction.bind(null, proyecto.id)}
          className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <div>
            <label htmlFor="hito-titulo" className={labelClase}>
              Nuevo hito
            </label>
            <input id="hito-titulo" name="titulo" required placeholder="Ej: Instalación de cámaras" className={inputClase} />
          </div>
          <div>
            <label htmlFor="hito-fecha" className={labelClase}>
              Fecha estimada
            </label>
            <input id="hito-fecha" name="fecha_estimada" type="date" className={inputClase} />
          </div>
          <BotonEnviar>Agregar</BotonEnviar>
          <div className="sm:col-span-3">
            <input name="descripcion" placeholder="Detalle opcional" className={inputClase} aria-label="Detalle del hito" />
          </div>
        </form>
      </section>

      <section className={`mt-6 ${tarjeta}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Documentos</h2>
          <SubirDocumento proyectoId={proyecto.id} />
        </div>
        {documentos.length === 0 ? (
          <p className="mt-3 text-muted">Sin documentos todavía.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {documentos.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                <DatosDocumento documento={d} />
                <div className="flex shrink-0 items-center gap-2">
                  {urls[d.storage_path] && (
                    <a href={urls[d.storage_path]} className="text-sm font-medium text-navy hover:underline">
                      Descargar
                    </a>
                  )}
                  <form action={eliminarDocumentoAction.bind(null, proyecto.id, d.id, d.storage_path)}>
                    <BotonEnviar variante="peligro" confirmar={`¿Eliminar "${d.nombre}"?`}>
                      Eliminar
                    </BotonEnviar>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`mt-6 ${tarjeta}`}>
        <h2 className="text-lg font-semibold text-ink">Bitácora</h2>
        <form action={crearNovedadAction.bind(null, proyecto.id)} className="mt-4 space-y-3">
          <textarea
            name="contenido"
            required
            rows={3}
            placeholder="Ej: Se completó el cableado del sector B. Mañana instalamos los equipos."
            className={inputClase}
            aria-label="Nueva novedad"
          />
          <BotonEnviar>Publicar novedad</BotonEnviar>
        </form>
        {novedades.length > 0 && (
          <ul className="mt-6 space-y-5">
            {novedades.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-3">
                <TextoNovedad novedad={n} />
                <form action={eliminarNovedadAction.bind(null, proyecto.id, n.id)}>
                  <BotonEnviar variante="peligro" confirmar="¿Eliminar esta novedad?">
                    Eliminar
                  </BotonEnviar>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-red-200 p-6">
        <h2 className="font-semibold text-red-700">Eliminar proyecto</h2>
        <p className="mt-1 text-sm text-muted">Borra el proyecto con sus hitos, bitácora y documentos. No se puede deshacer.</p>
        <form action={eliminarProyectoAction.bind(null, proyecto.id)} className="mt-4">
          <BotonEnviar variante="peligro" confirmar={`¿Eliminar definitivamente "${proyecto.nombre}"?`}>
            Eliminar proyecto
          </BotonEnviar>
        </form>
      </section>
    </main>
  );
}
