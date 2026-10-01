import { requireEquipo } from "@/lib/auth";
import { COLUMNAS_TICKET, ESTADOS_ABIERTOS } from "@/lib/tickets";
import ListaTickets, { type FilaTicket } from "@/components/tickets/lista";

export const metadata = { title: "Mis tickets · ProyIT" };

export default async function EquipoTicketsPage() {
  const { supabase } = await requireEquipo();

  // RLS: solo los tickets en que la persona es responsable.
  const { data } = await supabase
    .from("tickets")
    .select(`${COLUMNAS_TICKET}, cliente:clientes(nombre, nombre_fantasia), proyecto:proyectos(nombre)`)
    .order("vence_at", { ascending: true });
  const tickets = (data ?? []) as unknown as FilaTicket[];
  const abiertos = tickets.filter((t) => ESTADOS_ABIERTOS.includes(t.estado));
  const cerrados = tickets.filter((t) => !ESTADOS_ABIERTOS.includes(t.estado));

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-bold text-navy sm:text-3xl">Mis tickets</h1>
      <p className="mt-1 text-muted">Tickets de soporte que te asignaron, ordenados por plazo de respuesta.</p>

      <h2 className="mt-8 text-lg font-semibold text-ink">Por atender ({abiertos.length})</h2>
      <ListaTickets tickets={abiertos} base="/equipo/tickets" vista="equipo" vacio="No tienes tickets pendientes." />

      {cerrados.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-semibold text-ink">Resueltos y cerrados ({cerrados.length})</h2>
          <ListaTickets tickets={cerrados} base="/equipo/tickets" vista="equipo" vacio="" />
        </>
      )}
    </main>
  );
}
