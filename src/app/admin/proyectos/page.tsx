import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { COLUMNAS_PROYECTO, formatearFechaHora, type Proyecto } from "@/lib/proyectos";
import { nombreVisible } from "@/lib/clientes";
import { BarraAvance, EtapaBadge } from "@/components/proyectos/ui";
import { ChipSinLeer, cargarSinLeer } from "@/components/proyectos/sin-leer";

type FilaProyecto = Proyecto & {
  cliente: { nombre: string; nombre_fantasia: string | null; tipo: string } | null;
};

export default async function AdminProyectosPage() {
  const { supabase } = await requireAdmin();

  const [{ data }, sinLeer] = await Promise.all([
    supabase
      .from("proyectos")
      .select(`${COLUMNAS_PROYECTO}, cliente:clientes(nombre, nombre_fantasia, tipo)`)
      .order("updated_at", { ascending: false }),
    cargarSinLeer(supabase),
  ]);
  const enlace = (id: string) => `/admin/proyectos/${id}${sinLeer[id] ? "?tab=mensajes" : ""}`;
  const proyectos = (data ?? []) as unknown as FilaProyecto[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Proyectos</h1>
          <p className="mt-1 text-muted">Crea proyectos y mantén al día su avance para tus clientes.</p>
        </div>
        <Link
          href="/admin/proyectos/nuevo"
          className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-dark"
        >
          + Nuevo proyecto
        </Link>
      </div>

      {proyectos.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <p className="font-semibold text-ink">Aún no hay proyectos.</p>
          <p className="mt-2 text-muted">Crea el primero y asígnalo a uno de tus clientes.</p>
        </div>
      ) : (
        <>
        {/* Móvil: tarjetas */}
        <ul className="mt-6 space-y-3 md:hidden">
          {proyectos.map((p) => (
            <li key={p.id}>
              <Link
                href={enlace(p.id)}
                className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 active:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-navy">{p.nombre}</p>
                  <EtapaBadge etapa={p.etapa} />
                </div>
                <p className="mt-1 text-sm text-ink">
                  {p.cliente ? nombreVisible(p.cliente) : "—"}
                </p>
                {sinLeer[p.id] ? (
                  <div className="mt-2">
                    <ChipSinLeer cantidad={sinLeer[p.id]} />
                  </div>
                ) : null}
                <div className="mt-3">
                  <BarraAvance avance={p.avance} />
                </div>
                <p className="mt-2 text-xs text-muted">Actualizado {formatearFechaHora(p.updated_at)}</p>
              </Link>
            </li>
          ))}
        </ul>

        {/* Tablet y notebook: tabla */}
        <div className="mt-8 hidden overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Proyecto</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Etapa</th>
                <th className="px-5 py-3 font-medium">Avance</th>
                <th className="px-5 py-3 font-medium">Actualizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proyectos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link href={enlace(p.id)} className="font-semibold text-navy hover:underline">
                      {p.nombre}
                    </Link>
                    {sinLeer[p.id] ? (
                      <div className="mt-1">
                        <ChipSinLeer cantidad={sinLeer[p.id]} />
                      </div>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 text-ink">
                    {p.cliente ? nombreVisible(p.cliente) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <EtapaBadge etapa={p.etapa} />
                  </td>
                  <td className="px-5 py-3 font-medium text-ink">{p.avance}%</td>
                  <td className="px-5 py-3 text-muted">{formatearFechaHora(p.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </main>
  );
}
