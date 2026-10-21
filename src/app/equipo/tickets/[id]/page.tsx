import { notFound } from "next/navigation";
import { requireEquipo } from "@/lib/auth";
import { Avisos } from "@/components/admin/avisos";
import { VistaTicket, cargarTicket } from "@/components/tickets/detalle";
import PanelGestionTicket from "@/components/tickets/gestion";
import { numeroTicket } from "@/lib/tickets";
import { CabeceraPagina, CuerpoPagina } from "@/components/portal/ui";

export default async function EquipoTicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const { ok, error } = await searchParams;
  const { supabase } = await requireEquipo();

  // RLS devuelve el ticket solo si esta persona es su responsable.
  const datos = await cargarTicket(supabase, id);
  if (!datos) notFound();

  return (
    <main>
      <CabeceraPagina
        volver={{ href: "/equipo/tickets", label: "Mis tickets" }}
        cejaTexto={`Ticket ${numeroTicket(datos.ticket.numero)}`}
      >
        {datos.ticket.asunto}
      </CabeceraPagina>
      <CuerpoPagina>
        <Avisos ok={ok} error={error} />
        <VistaTicket
          datos={datos}
          vista="equipo"
          panelGestion={<PanelGestionTicket ticket={datos.ticket} base="/equipo/tickets" />}
        />
      </CuerpoPagina>
    </main>
  );
}
