import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { cargarOpcionesClientes } from "@/lib/admin-datos";
import { etiquetaCargo } from "@/lib/permisos";
import { cargarContextoProyecto, cargarProyecto } from "@/components/proyectos/detalle";
import ProyectoWorkspace, { pestanaValida } from "@/components/proyectos/workspace";
import { cargarMensajes } from "@/components/proyectos/mensajes";
import ProyectoForm from "@/components/admin/proyecto-form";
import { Avisos } from "@/components/admin/avisos";
import { BotonEnviar, inputClase, labelClase } from "@/components/admin/ui";
import {
  actualizarProyectoAction,
  asignarMiembroAction,
  eliminarProyectoAction,
  quitarMiembroAction,
} from "../../actions";

const tarjeta = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6";

type Miembro = { id: string; nombre: string; cargo: string; activo: boolean; user_id: string | null };

export default async function AdminProyectoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string; tab?: string }>;
}) {
  const { id } = await params;
  const { error, ok, tab } = await searchParams;
  const pestana = pestanaValida(tab);
  const { supabase, user } = await requireAdmin();

  const datos = await cargarProyecto(supabase, id);
  if (!datos) notFound();
  const { proyecto } = datos;

  const [contexto, mensajes, clientes, { data: miembrosData }, { data: asignadosData }] = await Promise.all([
    cargarContextoProyecto(supabase, proyecto),
    cargarMensajes(supabase, id, user.id),
    pestana === "resumen" ? cargarOpcionesClientes(supabase) : Promise.resolve([]),
    supabase.from("equipo").select("id, nombre, cargo, activo, user_id").order("nombre"),
    supabase.from("proyecto_equipo").select("equipo_id").eq("proyecto_id", id),
  ]);
  const miembros = (miembrosData ?? []) as Miembro[];
  const asignadosIds = new Set((asignadosData ?? []).map((a) => a.equipo_id as string));
  const asignados = miembros.filter((m) => asignadosIds.has(m.id));
  const disponibles = miembros.filter((m) => m.activo && !asignadosIds.has(m.id));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/proyectos" className="text-sm font-medium text-brand-blue hover:underline">
          ← Proyectos
        </Link>
        <Link href={`/portal/proyectos/${proyecto.id}`} className="text-sm font-medium text-brand-blue hover:underline">
          Ver como cliente →
        </Link>
      </div>
      <h1 className="mt-3 text-2xl font-bold text-navy">{proyecto.nombre}</h1>
      <Avisos error={error} ok={ok} />

      <ProyectoWorkspace
        base="/admin/proyectos"
        rol="admin"
        pestana={pestana}
        {...datos}
        equipo={contexto.equipo}
        cliente={contexto.cliente}
        mensajes={mensajes}
        extraResumen={
          <>
            <section className={tarjeta}>
              <h2 className="mb-5 text-lg font-semibold text-ink">Datos del proyecto</h2>
              <ProyectoForm
                action={actualizarProyectoAction.bind(null, proyecto.id)}
                proyecto={proyecto}
                clientes={clientes}
                textoBoton="Guardar cambios"
              />
            </section>
            <section className="rounded-2xl border border-red-200 p-5 sm:p-6">
              <h2 className="font-semibold text-red-700">Eliminar proyecto</h2>
              <p className="mt-1 text-sm text-muted">
                Borra el proyecto con sus hitos, bitácora, mensajes y documentos. No se puede deshacer.
              </p>
              <form action={eliminarProyectoAction.bind(null, proyecto.id)} className="mt-4">
                <BotonEnviar variante="peligro" confirmar={`¿Eliminar definitivamente "${proyecto.nombre}"?`}>
                  Eliminar proyecto
                </BotonEnviar>
              </form>
            </section>
          </>
        }
        extraEquipo={
          <section className={tarjeta}>
            <h2 className="text-lg font-semibold text-ink">Asignar equipo</h2>
            {asignados.length > 0 && (
              <ul className="mt-4 divide-y divide-slate-100">
                {asignados.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ink">{m.nombre}</span>
                      <span className="block text-xs text-muted">
                        {etiquetaCargo(m.cargo)}
                        {!m.activo && " · inactivo"}
                        {m.activo && !m.user_id && " · aún no se registra"}
                      </span>
                    </span>
                    <form action={quitarMiembroAction.bind(null, proyecto.id, m.id, "proyecto")}>
                      <BotonEnviar variante="peligro" confirmar={`¿Quitar a ${m.nombre} de este proyecto?`}>
                        Quitar
                      </BotonEnviar>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            {disponibles.length > 0 ? (
              <form
                action={asignarMiembroAction.bind(null, proyecto.id)}
                className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end"
              >
                <div className="flex-1">
                  <label htmlFor="equipo_id" className={labelClase}>
                    Agregar persona
                  </label>
                  <select id="equipo_id" name="equipo_id" required defaultValue="" className={inputClase}>
                    <option value="" disabled>
                      Elige a alguien del equipo…
                    </option>
                    {disponibles.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre} — {etiquetaCargo(m.cargo)}
                      </option>
                    ))}
                  </select>
                </div>
                <BotonEnviar>Asignar</BotonEnviar>
              </form>
            ) : (
              <p className="mt-4 text-sm text-muted">
                {miembros.length === 0 ? "Todavía no tienes equipo registrado. " : "Todo el equipo activo ya está asignado. "}
                <Link href="/admin/equipo" className="font-medium text-brand-blue hover:underline">
                  Gestionar equipo
                </Link>
              </p>
            )}
          </section>
        }
      />
    </main>
  );
}
