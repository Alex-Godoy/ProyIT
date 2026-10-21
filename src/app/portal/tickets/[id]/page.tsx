import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth";
import { numeroTicket } from "@/lib/tickets";
import { Avisos } from "@/components/admin/avisos";
import { VistaTicket, cargarTicket } from "@/components/tickets/detalle";
import { CabeceraPagina, CuerpoPagina } from "@/components/portal/ui";

export default async function TicketClientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const { ok, error } = await searchParams;
  const { supabase } = await requireUsuario();

  const datos = await cargarTicket(supabase, id);
  if (!datos) notFound();

  return (
    <main>
      <CabeceraPagina
        volver={{ href: "/portal/tickets", label: "Mis tickets" }}
        cejaTexto={`Ticket ${numeroTicket(datos.ticket.numero)}`}
      >
        {datos.ticket.asunto}
      </CabeceraPagina>
      <CuerpoPagina>
        <Avisos ok={ok} error={error} />
        <VistaTicket datos={datos} vista="cliente" />
      </CuerpoPagina>
    </main>
  );
}
