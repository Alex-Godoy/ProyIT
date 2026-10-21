import { requireAdmin } from "@/lib/auth";
import ClienteForm from "@/components/admin/cliente-form";
import { Avisos } from "@/components/admin/avisos";
import { crearClienteAction } from "../../actions";
import { CabeceraPagina, CuerpoPagina } from "@/components/portal/ui";

export default async function NuevoClientePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  await requireAdmin();

  return (
    <main>
      <CabeceraPagina
        ancho="angosto"
        volver={{ href: "/admin/clientes", label: "Clientes" }}
        cejaTexto="Cartera"
        bajada="Una empresa o una persona. Después podrás darle acceso al portal y crear sus proyectos."
      >
        Nuevo cliente
      </CabeceraPagina>
      <CuerpoPagina ancho="angosto">
        <Avisos error={error} />
        <div className="mt-6 rounded-[18px] bg-white p-5 shadow-sm ring-1 ring-linea sm:p-6">
          <ClienteForm action={crearClienteAction} textoBoton="Crear cliente" />
        </div>
      </CuerpoPagina>
    </main>
  );
}
