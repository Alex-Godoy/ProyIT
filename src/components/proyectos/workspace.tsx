import Link from "next/link";
import type { ReactNode } from "react";
import { ETAPAS, type Documento, type Hito, type Novedad, type Proyecto } from "@/lib/proyectos";
import { etiquetaCargo, puede, type RolEnProyecto } from "@/lib/permisos";
import {
  CheckHito,
  DatosDocumento,
  ResumenProyecto,
  TextoHito,
  TextoNovedad,
} from "@/components/proyectos/detalle";
import { ConversacionProyecto, type DatosMensajes } from "@/components/proyectos/mensajes";
import SubirDocumento from "@/components/admin/subir-documento";
import { BotonEnviar, inputClase, labelClase } from "@/components/admin/ui";
import {
  actualizarAvanceAction,
  actualizarHitoAction,
  alternarHitoAction,
  crearHitoAction,
  crearNovedadAction,
  eliminarDocumentoAction,
  eliminarHitoAction,
  eliminarNovedadAction,
} from "@/app/proyectos-acciones";

export const PESTANAS = [
  { valor: "resumen", etiqueta: "Resumen" },
  { valor: "mensajes", etiqueta: "Mensajes" },
  { valor: "hitos", etiqueta: "Hitos" },
  { valor: "documentos", etiqueta: "Documentos" },
  { valor: "bitacora", etiqueta: "Bitácora" },
  { valor: "equipo", etiqueta: "Equipo" },
] as const;

export type Pestana = (typeof PESTANAS)[number]["valor"];

export function pestanaValida(valor?: string): Pestana {
  return PESTANAS.some((p) => p.valor === valor) ? (valor as Pestana) : "resumen";
}

export type IntegranteProyecto = { nombre: string; cargo: string };

export type ClienteResumen = {
  nombre: string;
  tipo: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  comuna: string | null;
} | null;

const tarjeta = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6";

export default function ProyectoWorkspace({
  base,
  rol,
  pestana,
  proyecto,
  hitos,
  novedades,
  documentos,
  urls,
  equipo,
  cliente,
  mensajes,
  extraResumen,
  extraEquipo,
}: {
  base: "/admin/proyectos" | "/equipo/proyectos";
  rol: RolEnProyecto;
  pestana: Pestana;
  proyecto: Proyecto;
  hitos: Hito[];
  novedades: Novedad[];
  documentos: Documento[];
  urls: Record<string, string>;
  equipo: IntegranteProyecto[];
  cliente: ClienteResumen;
  mensajes: DatosMensajes;
  // Contenido solo del super usuario (formulario de datos, gestión de equipo).
  extraResumen?: ReactNode;
  extraEquipo?: ReactNode;
}) {
  const href = (p: Pestana) => `${base}/${proyecto.id}?tab=${p}`;
  const completados = hitos.filter((h) => h.completado_at).length;
  const sugerido = hitos.length > 0 ? Math.round((completados / hitos.length) * 100) : null;
  const conteo: Partial<Record<Pestana, number>> = {
    hitos: hitos.length,
    documentos: documentos.length,
    bitacora: novedades.length,
    equipo: equipo.length,
  };

  return (
    <>
      {/* Pestañas: en móvil se deslizan horizontalmente */}
      <nav aria-label="Secciones del proyecto" className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-1 rounded-xl bg-white p-1 ring-1 ring-slate-200 sm:w-auto">
          {PESTANAS.map((p) => {
            const activa = p.valor === pestana;
            return (
              <Link
                key={p.valor}
                href={href(p.valor)}
                aria-current={activa ? "page" : undefined}
                scroll={false}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                  activa ? "bg-navy text-white" : "text-muted hover:bg-slate-50 hover:text-ink"
                }`}
              >
                {p.etiqueta}
                {p.valor === "mensajes" && !activa && mensajes.sinLeer > 0 && (
                  <span
                    className="rounded-full bg-brand-orange px-1.5 text-xs text-white"
                    aria-label={`${mensajes.sinLeer} sin leer`}
                  >
                    {mensajes.sinLeer}
                  </span>
                )}
                {conteo[p.valor] !== undefined && (
                  <span
                    className={`rounded-full px-1.5 text-xs ${activa ? "bg-white/20" : "bg-slate-100 text-muted"}`}
                  >
                    {conteo[p.valor]}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-6 space-y-6">
        {pestana === "resumen" && (
          <>
            <ResumenProyecto proyecto={proyecto} />

            {puede(rol, "avance_editar") && (
              <section className={tarjeta}>
                <h2 className="text-lg font-semibold text-ink">Etapa y avance</h2>
                <p className="mt-1 text-sm text-muted">Es lo primero que ve el cliente al abrir su proyecto.</p>
                <form
                  action={actualizarAvanceAction.bind(null, base, proyecto.id)}
                  className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                >
                  <div>
                    <label htmlFor="etapa" className={labelClase}>
                      Etapa
                    </label>
                    <select id="etapa" name="etapa" defaultValue={proyecto.etapa} className={inputClase}>
                      {ETAPAS.map((e) => (
                        <option key={e.valor} value={e.valor}>
                          {e.etiqueta}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="avance" className={labelClase}>
                      Avance (%)
                    </label>
                    <input
                      id="avance"
                      name="avance"
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={proyecto.avance}
                      className={inputClase}
                    />
                  </div>
                  <BotonEnviar>Guardar</BotonEnviar>
                </form>
                {sugerido !== null && sugerido !== proyecto.avance && (
                  <form action={actualizarAvanceAction.bind(null, base, proyecto.id)} className="mt-3">
                    <input type="hidden" name="etapa" value={proyecto.etapa} />
                    <input type="hidden" name="avance" value={sugerido} />
                    <p className="flex flex-wrap items-center gap-2 rounded-lg bg-brand-blue/5 px-3 py-2 text-sm text-ink">
                      <span>
                        Según los hitos ({completados} de {hitos.length} completados) el avance sería{" "}
                        <strong>{sugerido}%</strong>.
                      </span>
                      <button type="submit" className="font-semibold text-brand-blue hover:underline">
                        Usar {sugerido}%
                      </button>
                    </p>
                  </form>
                )}
              </section>
            )}

            {cliente && (
              <section className={tarjeta}>
                <h2 className="text-lg font-semibold text-ink">Cliente</h2>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted">{cliente.tipo === "persona" ? "Nombre" : "Empresa"}</dt>
                    <dd className="font-medium text-ink">{cliente.nombre}</dd>
                  </div>
                  {(cliente.direccion || cliente.comuna) && (
                    <div>
                      <dt className="text-muted">Dirección</dt>
                      <dd className="font-medium text-ink">
                        {[cliente.direccion, cliente.comuna].filter(Boolean).join(", ")}
                      </dd>
                    </div>
                  )}
                  {cliente.telefono && (
                    <div>
                      <dt className="text-muted">Teléfono</dt>
                      <dd>
                        <a href={`tel:${cliente.telefono}`} className="font-medium text-brand-blue hover:underline">
                          {cliente.telefono}
                        </a>
                      </dd>
                    </div>
                  )}
                  {cliente.email && (
                    <div>
                      <dt className="text-muted">Correo</dt>
                      <dd>
                        <a href={`mailto:${cliente.email}`} className="font-medium text-brand-blue hover:underline">
                          {cliente.email}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {extraResumen}
          </>
        )}

        {pestana === "mensajes" && (
          <ConversacionProyecto proyectoId={proyecto.id} datos={mensajes} vista="equipo" puedeEliminar={rol === "admin"} />
        )}

        {pestana === "hitos" && (
          <section className={tarjeta}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-ink">Hitos</h2>
              {hitos.length > 0 && (
                <span className="text-sm text-muted">
                  {completados} de {hitos.length} completados
                </span>
              )}
            </div>

            {hitos.length === 0 ? (
              <p className="mt-3 text-muted">Sin hitos todavía.</p>
            ) : (
              <ol className="mt-4 divide-y divide-slate-100">
                {hitos.map((h) => (
                  <li key={h.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        {puede(rol, "hito_completar") ? (
                          <form action={alternarHitoAction.bind(null, base, proyecto.id, h.id, !!h.completado_at)}>
                            <button
                              type="submit"
                              aria-label={h.completado_at ? `Marcar "${h.titulo}" como pendiente` : `Completar "${h.titulo}"`}
                              title={h.completado_at ? "Marcar pendiente" : "Marcar completado"}
                              className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                            >
                              <CheckHito completado={!!h.completado_at} />
                            </button>
                          </form>
                        ) : (
                          <CheckHito completado={!!h.completado_at} />
                        )}
                        <TextoHito hito={h} />
                      </div>
                      {puede(rol, "eliminar") && (
                        <form action={eliminarHitoAction.bind(null, base, proyecto.id, h.id)}>
                          <BotonEnviar variante="peligro" confirmar={`¿Eliminar el hito "${h.titulo}"?`}>
                            Eliminar
                          </BotonEnviar>
                        </form>
                      )}
                    </div>

                    {puede(rol, "hito_editar") && (
                      <details className="group ml-8 mt-2">
                        <summary className="cursor-pointer list-none text-sm font-medium text-brand-blue hover:underline">
                          Editar
                        </summary>
                        <form
                          action={actualizarHitoAction.bind(null, base, proyecto.id, h.id)}
                          className="mt-3 grid gap-3 rounded-xl bg-surface p-3 sm:grid-cols-[1fr_auto]"
                        >
                          <input name="titulo" required defaultValue={h.titulo} aria-label="Título" className={inputClase} />
                          <input
                            name="fecha_estimada"
                            type="date"
                            defaultValue={h.fecha_estimada ?? ""}
                            aria-label="Fecha estimada"
                            className={inputClase}
                          />
                          <input
                            name="descripcion"
                            defaultValue={h.descripcion ?? ""}
                            placeholder="Detalle opcional"
                            aria-label="Detalle"
                            className={`${inputClase} sm:col-span-2`}
                          />
                          <div>
                            <BotonEnviar>Guardar hito</BotonEnviar>
                          </div>
                        </form>
                      </details>
                    )}
                  </li>
                ))}
              </ol>
            )}

            {puede(rol, "hito_editar") && (
              <form
                action={crearHitoAction.bind(null, base, proyecto.id)}
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
            )}
          </section>
        )}

        {pestana === "documentos" && (
          <section className={tarjeta}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-ink">Documentos</h2>
              {puede(rol, "documento_subir") && <SubirDocumento proyectoId={proyecto.id} />}
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
                      {puede(rol, "eliminar") && (
                        <form action={eliminarDocumentoAction.bind(null, base, proyecto.id, d.id)}>
                          <BotonEnviar variante="peligro" confirmar={`¿Eliminar "${d.nombre}"?`}>
                            Eliminar
                          </BotonEnviar>
                        </form>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {pestana === "bitacora" && (
          <section className={tarjeta}>
            <h2 className="text-lg font-semibold text-ink">Bitácora</h2>
            <p className="mt-1 text-sm text-muted">El cliente ve estas novedades en su portal.</p>
            {puede(rol, "novedad_publicar") && (
              <form action={crearNovedadAction.bind(null, base, proyecto.id)} className="mt-4 space-y-3">
                <textarea
                  name="contenido"
                  required
                  rows={3}
                  maxLength={4000}
                  placeholder="Ej: Se completó el cableado del sector B. Mañana instalamos los equipos."
                  className={inputClase}
                  aria-label="Nueva novedad"
                />
                <BotonEnviar>Publicar novedad</BotonEnviar>
              </form>
            )}
            {novedades.length === 0 ? (
              <p className="mt-4 text-muted">Sin novedades todavía.</p>
            ) : (
              <ul className="mt-6 space-y-5">
                {novedades.map((n) => (
                  <li key={n.id} className="flex items-start justify-between gap-3">
                    <TextoNovedad novedad={n} />
                    {puede(rol, "eliminar") && (
                      <form action={eliminarNovedadAction.bind(null, base, proyecto.id, n.id)}>
                        <BotonEnviar variante="peligro" confirmar="¿Eliminar esta novedad?">
                          Eliminar
                        </BotonEnviar>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {pestana === "equipo" && (
          <>
            <section className={tarjeta}>
              <h2 className="text-lg font-semibold text-ink">Equipo del proyecto</h2>
              <p className="mt-1 text-sm text-muted">El cliente ve el nombre y cargo de cada persona.</p>
              {equipo.length === 0 ? (
                <p className="mt-3 text-muted">Nadie asignado todavía.</p>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {equipo.map((e) => (
                    <li key={e.nombre + e.cargo} className="flex items-center gap-3 rounded-xl p-3 ring-1 ring-slate-200">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/5 text-sm font-bold text-navy">
                        {e.nombre.charAt(0).toUpperCase()}
                      </span>
                      <span>
                        <span className="block font-medium text-ink">{e.nombre}</span>
                        <span className="block text-xs text-muted">{etiquetaCargo(e.cargo)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            {extraEquipo}
          </>
        )}
      </div>
    </>
  );
}
