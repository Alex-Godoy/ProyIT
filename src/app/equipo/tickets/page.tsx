import { requireEquipo } from "@/lib/auth";
import { COLUMNAS_TICKET, ESTADOS_ABIERTOS } from "@/lib/tickets";
import ListaTickets, { type FilaTicket } from "@/components/tickets/lista";
import { CabeceraPagina, CuerpoPagina } from "@/components/portal/ui";

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
    <main>
      <CabeceraPagina
        ancho="medio"
        cejaTexto="Soporte"
        bajada="Tickets de soporte que te asignaron, ordenados por plazo de respuesta."
      >
        Mis tickets
      </CabeceraPagina>
      <CuerpoPagina ancho="medio">
        <h2 className="mt-8 font-display text-xl font-bold text-tinta">Por atender ({abiertos.length})</h2>
        <ListaTickets tickets={abiertos} base="/equipo/tickets" vista="equipo" vacio="No tienes tickets pendientes." />

        {cerrados.length > 0 && (
          <>
            <h2 className="mt-10 font-display text-xl font-bold text-tinta">Resueltos y cerrados ({cerrados.length})</h2>
            <ListaTickets tickets={cerrados} base="/equipo/tickets" vista="equipo" vacio="" />
          </>
        )}
      </CuerpoPagina>
    </main>
  );
}
