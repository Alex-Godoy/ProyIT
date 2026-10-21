import Link from "next/link";
import { requireUsuario } from "@/lib/auth";
import { COLUMNAS_TICKET, ESTADOS_ABIERTOS } from "@/lib/tickets";
import ListaTickets, { type FilaTicket } from "@/components/tickets/lista";
import { CONTACTO_EMAIL } from "@/lib/sitio";
import { CabeceraPagina, CuerpoPagina, botonNaranjo } from "@/components/portal/ui";

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
    <main>
      <CabeceraPagina
        ancho="medio"
        cejaTexto="Soporte"
        bajada="Pide ayuda y sigue cada solicitud hasta que quede resuelta."
        acciones={
          (clientes ?? 0) > 0 && (
            <Link href="/portal/tickets/nuevo" className={botonNaranjo}>
              + Nuevo ticket
            </Link>
          )
        }
      >
        Tickets de soporte
      </CabeceraPagina>
      <CuerpoPagina ancho="medio">
        {(clientes ?? 0) === 0 ? (
          <div className="mt-8 rounded-[18px] bg-white p-8 text-center ring-1 ring-linea">
            <p className="font-semibold text-ink">Tu cuenta aún no está vinculada a un cliente de ProyIT.</p>
            <p className="mt-2 text-muted">
              Cuando lo esté, podrás crear tickets de soporte aquí. Si te suscribiste hace poco, lo activamos en
              cuanto confirmemos tu plan.
            </p>
            {/* No dejar a nadie sin salida si tiene algo que no puede esperar. */}
            <p className="mt-6 text-sm font-semibold text-ink">¿Necesitas ayuda ahora?</p>
            <div className="mt-3 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/#urgencia"
                className="rounded-full bg-brand-orange px-5 py-2.5 text-sm font-bold text-marino hover:bg-[#ff8c3a]"
              >
                Pedir atención urgente
              </Link>
              <a href={`mailto:${CONTACTO_EMAIL}`} className="text-sm font-semibold text-navy hover:underline">
                Escribir a {CONTACTO_EMAIL}
              </a>
            </div>
          </div>
        ) : (
          <>
            {esperanRespuesta > 0 && (
              <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
                Tienes {esperanRespuesta} {esperanRespuesta === 1 ? "ticket esperando" : "tickets esperando"} tu respuesta.
              </p>
            )}
            <h2 className="mt-8 font-display text-xl font-bold text-tinta">Abiertos ({abiertos.length})</h2>
            <ListaTickets tickets={abiertos} base="/portal/tickets" vista="cliente" vacio="No tienes tickets abiertos." />
            {cerrados.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-xl font-bold text-tinta">Resueltos y cerrados ({cerrados.length})</h2>
                <ListaTickets tickets={cerrados} base="/portal/tickets" vista="cliente" vacio="" />
              </>
            )}
          </>
        )}
      </CuerpoPagina>
    </main>
  );
}
