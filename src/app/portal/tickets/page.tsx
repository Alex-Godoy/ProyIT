import Link from "next/link";
import { requireUsuario } from "@/lib/auth";
import { COLUMNAS_TICKET, ESTADOS_ABIERTOS } from "@/lib/tickets";
import ListaTickets, { type FilaTicket } from "@/components/tickets/lista";

export const metadata = { title: "Tickets de soporte · ProyIT" };

export default async function MisTicketsPage() {
  const { supabase } = await requireUsuario();

  // RLS: solo los tickets de los clientes a los que el usuario tiene acceso.
  const [{ data }, { count: clientes }] = await Promise.all([
    supabase
      .from("tickets")
      .select(`${COLUMNAS_TICKET}, proyecto:proyectos(nombre)`)
      .order("updated_at", { ascending: false }),
    supabase.from("clientes").select("id", { count: "exact", head: true }),
  ]);
  const tickets = (data ?? []) as unknown as FilaTicket[];
  const abiertos = tickets.filter((t) => ESTADOS_ABIERTOS.includes(t.estado));
  const cerrados = tickets.filter((t) => !ESTADOS_ABIERTOS.includes(t.estado));
  const esperanRespuesta = abiertos.filter((t) => t.estado === "esperando_cliente").length;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/portal" className="text-sm font-medium text-brand-blue hover:underline">
        ← Volver al portal
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy sm:text-3xl">Tickets de soporte</h1>
          <p className="mt-1 text-muted">Pide ayuda y sigue cada solicitud hasta que quede resuelta.</p>
        </div>
        {(clientes ?? 0) > 0 && (
          <Link
            href="/portal/tickets/nuevo"
            className="rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 hover:bg-brand-orange-dark"
          >
            + Nuevo ticket
          </Link>
        )}
      </div>

      {(clientes ?? 0) === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
          <p className="font-semibold text-ink">Tu cuenta aún no está vinculada a un cliente de ProyIT.</p>
          <p className="mt-2 text-muted">Cuando lo esté, podrás crear tickets de soporte aquí.</p>
        </div>
      ) : (
        <>
          {esperanRespuesta > 0 && (
            <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
              Tienes {esperanRespuesta} {esperanRespuesta === 1 ? "ticket esperando" : "tickets esperando"} tu respuesta.
            </p>
          )}
          <h2 className="mt-8 text-lg font-semibold text-ink">Abiertos ({abiertos.length})</h2>
          <ListaTickets tickets={abiertos} base="/portal/tickets" vista="cliente" vacio="No tienes tickets abiertos." />
          {cerrados.length > 0 && (
            <>
              <h2 className="mt-10 text-lg font-semibold text-ink">Resueltos y cerrados ({cerrados.length})</h2>
              <ListaTickets tickets={cerrados} base="/portal/tickets" vista="cliente" vacio="" />
            </>
          )}
        </>
      )}
    </main>
  );
}
