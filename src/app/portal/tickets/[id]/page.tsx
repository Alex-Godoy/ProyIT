import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth";
import { numeroTicket } from "@/lib/tickets";
import { Avisos } from "@/components/admin/avisos";
import { VistaTicket, cargarTicket } from "@/components/tickets/detalle";

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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/portal/tickets" className="text-sm font-medium text-brand-blue hover:underline">
        ← Mis tickets
      </Link>
      <span className="sr-only">Ticket {numeroTicket(datos.ticket.numero)}</span>
      <Avisos ok={ok} error={error} />
      <VistaTicket datos={datos} vista="cliente" />
    </main>
  );
}
