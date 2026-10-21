import { redirect } from "next/navigation";
import { requireUsuario } from "@/lib/auth";
import NuevoTicketForm from "@/components/tickets/nuevo-ticket-form";
import { CabeceraPagina, CuerpoPagina } from "@/components/portal/ui";

export const metadata = { title: "Nuevo ticket · ProyIT" };

export default async function NuevoTicketPage() {
  // Se llega aquí desde "Pedir soporte" del home: si primero debe aceptar la
  // política de privacidad, vuelve a este formulario y no al inicio del portal.
  const { supabase } = await requireUsuario({ volverA: "/portal/tickets/nuevo" });

  // RLS: solo clientes y proyectos a los que la persona tiene acceso.
  const [{ data: clientes }, { data: proyectos }] = await Promise.all([
    supabase.from("clientes").select("id, nombre, nombre_fantasia").order("nombre"),
    supabase.from("proyectos").select("id, nombre, cliente_id").neq("etapa", "pausado").order("nombre"),
  ]);
  if (!clientes || clientes.length === 0) redirect("/portal/tickets");

  return (
    <main>
      <CabeceraPagina
        ancho="angosto"
        volver={{ href: "/portal/tickets", label: "Mis tickets" }}
        cejaTexto="Soporte"
        bajada="Mientras más detalles nos des, más rápido lo resolvemos."
      >
        Nuevo ticket de soporte
      </CabeceraPagina>
      <CuerpoPagina ancho="angosto">
        <div className="mt-6 rounded-[18px] bg-white p-5 shadow-sm ring-1 ring-linea sm:p-6">
          <NuevoTicketForm
            base="/portal/tickets"
            clientes={clientes.map((c) => ({ id: c.id, nombre: c.nombre_fantasia ?? c.nombre }))}
            proyectos={(proyectos ?? []) as { id: string; nombre: string; cliente_id: string }[]}
          />
        </div>
      </CuerpoPagina>
    </main>
  );
}
