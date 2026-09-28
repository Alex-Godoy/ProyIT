import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { COLUMNAS_CLIENTE, nombreVisible, type Acceso, type Cliente } from "@/lib/clientes";
import { COLUMNAS_PROYECTO, formatearFechaHora, type Proyecto } from "@/lib/proyectos";
import ClienteForm from "@/components/admin/cliente-form";
import { TipoBadge } from "@/components/admin/tipo-badge";
import { Avisos } from "@/components/admin/avisos";
import { BotonEnviar, inputClase, labelClase } from "@/components/admin/ui";
import { BarraAvance, EtapaBadge } from "@/components/proyectos/ui";
import {
  actualizarClienteAction,
  agregarAccesoAction,
  eliminarClienteAction,
  quitarAccesoAction,
} from "../../actions";

const tarjeta = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6";

export default async function AdminClientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { id } = await params;
  const { error, ok } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: cliente } = await supabase.from("clientes").select(COLUMNAS_CLIENTE).eq("id", id).maybeSingle<Cliente>();
  if (!cliente) notFound();

  const [{ data: accesosData }, { data: proyectosData }, { data: notaData }] = await Promise.all([
    supabase
      .from("cliente_accesos")
      .select("id, email, nombre_contacto, cargo, user_id")
      .eq("cliente_id", id)
      .order("created_at"),
    supabase.from("proyectos").select(COLUMNAS_PROYECTO).eq("cliente_id", id).order("updated_at", { ascending: false }),
    supabase.from("cliente_notas").select("notas").eq("cliente_id", id).maybeSingle<{ notas: string | null }>(),
  ]);
  const accesos = (accesosData ?? []) as Acceso[];
  const proyectos = (proyectosData ?? []) as Proyecto[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/admin/clientes" className="text-sm font-medium text-brand-blue hover:underline">
        ← Clientes
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-navy">{nombreVisible(cliente)}</h1>
        <TipoBadge tipo={cliente.tipo} />
        {!cliente.activo && (
          <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">Inactivo</span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">
        {[cliente.rut, cliente.email, cliente.telefono].filter(Boolean).join(" · ")}
      </p>
      <Avisos error={error} ok={ok} />

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Columna principal: datos */}
        <section className={`${tarjeta} lg:col-span-3`}>
          <h2 className="mb-5 text-lg font-semibold text-ink">Datos del cliente</h2>
          <ClienteForm
            action={actualizarClienteAction.bind(null, cliente.id)}
            cliente={cliente}
            notas={notaData?.notas}
            textoBoton="Guardar cambios"
          />
        </section>

        {/* Columna lateral: accesos y proyectos */}
        <div className="space-y-6 lg:col-span-2">
          <section className={tarjeta}>
            <h2 className="text-lg font-semibold text-ink">Acceso al portal</h2>
            <p className="mt-1 text-sm text-muted">
              Correos que pueden ver los proyectos de este cliente. Se activan cuando la persona se registra y confirma
              su correo en el portal.
            </p>

            {accesos.length === 0 ? (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Nadie tiene acceso todavía.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {accesos.map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{a.email}</p>
                      {(a.nombre_contacto || a.cargo) && (
                        <p className="truncate text-xs text-muted">
                          {[a.nombre_contacto, a.cargo].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          a.user_id ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {a.user_id ? "Activo" : "Pendiente de registro"}
                      </span>
                    </div>
                    <form action={quitarAccesoAction.bind(null, cliente.id, a.id)}>
                      <BotonEnviar variante="peligro" confirmar={`¿Quitar el acceso de ${a.email}?`}>
                        Quitar
                      </BotonEnviar>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            <form action={agregarAccesoAction.bind(null, cliente.id)} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
              <div>
                <label htmlFor="acceso-email" className={labelClase}>
                  Agregar correo
                </label>
                <input
                  id="acceso-email"
                  name="email"
                  type="email"
                  required
                  placeholder="persona@cliente.cl"
                  className={inputClase}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="nombre_contacto" placeholder="Nombre (opcional)" aria-label="Nombre del contacto" className={inputClase} />
                <input name="cargo" placeholder="Cargo (opcional)" aria-label="Cargo del contacto" className={inputClase} />
              </div>
              <BotonEnviar variante="secundario">Dar acceso</BotonEnviar>
            </form>
          </section>

          <section className={tarjeta}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-ink">Proyectos</h2>
              <Link
                href={`/admin/proyectos/nuevo?cliente=${cliente.id}`}
                className="rounded-lg bg-navy px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy-dark"
              >
                + Nuevo
              </Link>
            </div>
            {proyectos.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Sin proyectos todavía.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {proyectos.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/proyectos/${p.id}`}
                      className="block rounded-xl p-3 ring-1 ring-slate-200 transition hover:ring-brand-blue"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-navy">{p.nombre}</p>
                        <EtapaBadge etapa={p.etapa} />
                      </div>
                      <div className="mt-2">
                        <BarraAvance avance={p.avance} />
                      </div>
                      <p className="mt-1 text-xs text-muted">Actualizado {formatearFechaHora(p.updated_at)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-red-200 p-5 sm:p-6">
            <h2 className="font-semibold text-red-700">Eliminar cliente</h2>
            <p className="mt-1 text-sm text-muted">
              Solo se puede eliminar si no tiene proyectos. Si ya no trabajas con él, mejor márcalo como inactivo.
            </p>
            <form action={eliminarClienteAction.bind(null, cliente.id)} className="mt-4">
              <BotonEnviar variante="peligro" confirmar={`¿Eliminar definitivamente a "${cliente.nombre}"?`}>
                Eliminar cliente
              </BotonEnviar>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
