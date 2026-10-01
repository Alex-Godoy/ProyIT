import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { nombreVisible } from "@/lib/clientes";
import NuevoTicketForm from "@/components/tickets/nuevo-ticket-form";

export default async function AdminNuevoTicketPage() {
  const { supabase } = await requireAdmin();
  const [{ data: clientes }, { data: proyectos }] = await Promise.all([
    supabase.from("clientes").select("id, nombre, nombre_fantasia").eq("activo", true).order("nombre"),
    supabase.from("proyectos").select("id, nombre, cliente_id").order("nombre"),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/admin/tickets" className="text-sm font-medium text-brand-blue hover:underline">
        ← Tickets
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-navy">Registrar ticket</h1>
      <p className="mt-1 text-muted">
        Para solicitudes que llegan por teléfono o correo. El cliente lo verá en su portal.
      </p>
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        {(clientes ?? []).length === 0 ? (
          <p className="text-muted">
            Primero necesitas un cliente.{" "}
            <Link href="/admin/clientes/nuevo" className="text-brand-blue hover:underline">
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
    </main>
  );
}
