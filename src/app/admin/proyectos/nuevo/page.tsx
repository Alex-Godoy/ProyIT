import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { cargarOpcionesClientes } from "@/lib/admin-datos";
import ProyectoForm from "@/components/admin/proyecto-form";
import { Avisos } from "@/components/admin/avisos";
import { crearProyectoAction } from "../../actions";
import { CabeceraPagina, CuerpoPagina } from "@/components/portal/ui";

export default async function NuevoProyectoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; cliente?: string }>;
}) {
  const { error, cliente } = await searchParams;
  const { supabase } = await requireAdmin();
  const clientes = await cargarOpcionesClientes(supabase);

  return (
    <main>
      <CabeceraPagina
        ancho="angosto"
        volver={cliente ? { href: `/admin/clientes/${cliente}`, label: "Volver al cliente" } : { href: "/admin/proyectos", label: "Proyectos" }}
        cejaTexto="Entregas"
        bajada="Con etapa, avance e hitos. El cliente lo verá en su portal."
      >
        Nuevo proyecto
      </CabeceraPagina>
      <CuerpoPagina ancho="angosto">
        <Avisos error={error} />

        {clientes.length === 0 ? (
          <div className="mt-6 rounded-[18px] bg-white p-8 text-center shadow-sm ring-1 ring-linea">
            <p className="font-semibold text-ink">Primero necesitas un cliente.</p>
            <p className="mt-2 text-muted">Cada proyecto pertenece a una empresa o a una persona.</p>
            <Link
              href="/admin/clientes/nuevo"
              className="mt-5 inline-flex rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-marino"
            >
              + Crear cliente
            </Link>
          </div>
        ) : (
          <div className="mt-6 rounded-[18px] bg-white p-5 shadow-sm ring-1 ring-linea sm:p-6">
            <ProyectoForm
              action={crearProyectoAction}
              clientes={clientes}
              clienteInicial={cliente}
              textoBoton="Crear proyecto"
            />
          </div>
        )}
      </CuerpoPagina>
    </main>
  );
}
