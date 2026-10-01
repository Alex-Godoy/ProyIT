import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Avisos } from "@/components/admin/avisos";
import { VistaTicket, cargarTicket } from "@/components/tickets/detalle";
import PanelGestionTicket, { type OpcionResponsable } from "@/components/tickets/gestion";

export default async function AdminTicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const { ok, error } = await searchParams;
  const { supabase } = await requireAdmin();

  const datos = await cargarTicket(supabase, id);
  if (!datos) notFound();

  // Se sugiere primero al equipo asignado al proyecto del ticket.
  const [{ data: equipo }, { data: delProyecto }] = await Promise.all([
    supabase.from("equipo").select("id, nombre, cargo").eq("activo", true).order("nombre"),
    datos.ticket.proyecto_id
      ? supabase.from("proyecto_equipo").select("equipo_id").eq("proyecto_id", datos.ticket.proyecto_id)
      : Promise.resolve({ data: [] as { equipo_id: string }[] }),
  ]);
  const sugeridos = new Set((delProyecto ?? []).map((p) => p.equipo_id));
  const responsables: OpcionResponsable[] = (equipo ?? []).map((e) => ({ ...e, sugerido: sugeridos.has(e.id) }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/admin/tickets" className="text-sm font-medium text-brand-blue hover:underline">
        ← Tickets
      </Link>
      <Avisos ok={ok} error={error} />
      <VistaTicket
        datos={datos}
        vista="equipo"
        panelGestion={
          responsables.length === 0 ? (
            <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
              Aún no tienes equipo para asignar.{" "}
              <Link href="/admin/equipo" className="font-semibold underline">
                Agrega a alguien
              </Link>{" "}
              o atiéndelo tú directamente.
            </p>
          ) : (
            <PanelGestionTicket ticket={datos.ticket} base="/admin/tickets" responsables={responsables} />
          )
        }
      />
    </main>
  );
}
