import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { nombreVisible } from "@/lib/clientes";
import NuevoTicketForm from "@/components/tickets/nuevo-ticket-form";
import { CabeceraPagina, CuerpoPagina } from "@/components/portal/ui";

export default async function AdminNuevoTicketPage() {
  const { supabase } = await requireAdmin();
  const [{ data: clientes }, { data: proyectos }] = await Promise.all([
    supabase.from("clientes").select("id, nombre, nombre_fantasia").eq("activo", true).order("nombre"),
    supabase.from("proyectos").select("id, nombre, cliente_id").order("nombre"),
  ]);

  return (
    <main>
      <CabeceraPagina
        ancho="angosto"
        volver={{ href: "/admin/tickets", label: "Tickets" }}
        cejaTexto="Soporte"
        bajada="Para solicitudes que llegan por teléfono o correo. El cliente lo verá en su portal."
      >
        Registrar ticket
      </CabeceraPagina>
      <CuerpoPagina ancho="angosto">
        <div className="mt-6 rounded-[18px] bg-white p-5 shadow-sm ring-1 ring-linea sm:p-6">
          {(clientes ?? []).length === 0 ? (
            <p className="text-muted">
              Primero necesitas un cliente.{" "}
              <Link href="/admin/clientes/nuevo" className="text-acento hover:underline">
                Crear cliente
              </Link>
            </p>
          ) : (
            <NuevoTicketForm
              base="/admin/tickets"
              clientes={(clientes ?? []).map((c) => ({ id: c.id, nombre: nombreVisible(c) }))}
              proyectos={(proyectos ?? []) as { id: string; nombre: string; cliente_id: string }[]}
            />
          )}
        </div>
      </CuerpoPagina>
    </main>
  );
}
