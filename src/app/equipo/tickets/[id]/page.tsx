import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEquipo } from "@/lib/auth";
import { Avisos } from "@/components/admin/avisos";
import { VistaTicket, cargarTicket } from "@/components/tickets/detalle";
import PanelGestionTicket from "@/components/tickets/gestion";

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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/equipo/tickets" className="text-sm font-medium text-brand-blue hover:underline">
        ← Mis tickets
      </Link>
      <Avisos ok={ok} error={error} />
      <VistaTicket
        datos={datos}
        vista="equipo"
        panelGestion={<PanelGestionTicket ticket={datos.ticket} base="/equipo/tickets" />}
      />
    </main>
  );
}
