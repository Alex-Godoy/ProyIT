import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { cargarOpcionesClientes } from "@/lib/admin-datos";
import ProyectoForm from "@/components/admin/proyecto-form";
import { Avisos } from "@/components/admin/avisos";
import { crearProyectoAction } from "../../actions";

export default async function NuevoProyectoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; cliente?: string }>;
}) {
  const { error, cliente } = await searchParams;
  const { supabase } = await requireAdmin();
  const clientes = await cargarOpcionesClientes(supabase);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href={cliente ? `/admin/clientes/${cliente}` : "/admin/proyectos"}
        className="text-sm font-medium text-brand-blue hover:underline"
      >
        ← Volver
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-navy">Nuevo proyecto</h1>
      <Avisos error={error} />

      {clientes.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <p className="font-semibold text-ink">Primero necesitas un cliente.</p>
          <p className="mt-2 text-muted">Cada proyecto pertenece a una empresa o a una persona.</p>
          <Link
            href="/admin/clientes/nuevo"
            className="mt-5 inline-flex rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-dark"
          >
            + Crear cliente
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <ProyectoForm
            action={crearProyectoAction}
            clientes={clientes}
            clienteInicial={cliente}
            textoBoton="Crear proyecto"
          />
        </div>
      )}
    </main>
  );
}
