import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUsuario } from "@/lib/auth";
import NuevoTicketForm from "@/components/tickets/nuevo-ticket-form";

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
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/portal/tickets" className="text-sm font-medium text-brand-blue hover:underline">
        ← Mis tickets
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-navy sm:text-3xl">Nuevo ticket de soporte</h1>
      <p className="mt-1 text-muted">Mientras más detalles nos des, más rápido lo resolvemos.</p>
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <NuevoTicketForm
          base="/portal/tickets"
          clientes={clientes.map((c) => ({ id: c.id, nombre: c.nombre_fantasia ?? c.nombre }))}
          proyectos={(proyectos ?? []) as { id: string; nombre: string; cliente_id: string }[]}
        />
      </div>
    </main>
  );
}
