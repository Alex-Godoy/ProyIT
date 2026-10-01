import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { COLUMNAS_TICKET, ESTADOS_ABIERTOS, estadoSla } from "@/lib/tickets";
import ListaTickets, { type FilaTicket } from "@/components/tickets/lista";

export const metadata = { title: "Tickets · Administración ProyIT" };

const FILTROS = [
  { valor: "pendientes", etiqueta: "Por atender" },
  { valor: "sin_asignar", etiqueta: "Sin asignar" },
  { valor: "vencidos", etiqueta: "Plazo vencido" },
  { valor: "cerrados", etiqueta: "Resueltos y cerrados" },
  { valor: "todos", etiqueta: "Todos" },
] as const;

type Filtro = (typeof FILTROS)[number]["valor"];

export default async function AdminTicketsPage({ searchParams }: { searchParams: Promise<{ filtro?: string }> }) {
  const { filtro: f } = await searchParams;
  const filtro: Filtro = FILTROS.some((x) => x.valor === f) ? (f as Filtro) : "pendientes";
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("tickets")
    .select(`${COLUMNAS_TICKET}, cliente:clientes(nombre, nombre_fantasia), proyecto:proyectos(nombre)`)
    .order("updated_at", { ascending: false });
  const todos = (data ?? []) as unknown as FilaTicket[];

  const abiertos = todos.filter((t) => ESTADOS_ABIERTOS.includes(t.estado));
  const grupos: Record<Filtro, FilaTicket[]> = {
    // Sin asignar primero, luego los de plazo más próximo a vencer.
    pendientes: [...abiertos].sort(
      (a, b) =>
        Number(!!a.responsable_id) - Number(!!b.responsable_id) || Date.parse(a.vence_at) - Date.parse(b.vence_at),
    ),
    sin_asignar: abiertos.filter((t) => !t.responsable_id),
    vencidos: abiertos.filter((t) => estadoSla(t).tipo === "vencido"),
    cerrados: todos.filter((t) => !ESTADOS_ABIERTOS.includes(t.estado)),
    todos,
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Tickets de soporte</h1>
          <p className="mt-1 text-muted">Asigna cada ticket a un responsable y vigila los plazos de respuesta.</p>
        </div>
        <Link
          href="/admin/tickets/nuevo"
          className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-dark"
        >
          + Registrar ticket
        </Link>
      </div>

      <nav aria-label="Filtros" className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-1 rounded-xl bg-white p-1 ring-1 ring-slate-200">
          {FILTROS.map((x) => {
            const activo = x.valor === filtro;
            const n = grupos[x.valor].length;
            const alerta = (x.valor === "sin_asignar" || x.valor === "vencidos") && n > 0;
            return (
              <Link
                key={x.valor}
                href={`/admin/tickets?filtro=${x.valor}`}
                aria-current={activo ? "page" : undefined}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                  activo ? "bg-navy text-white" : "text-muted hover:bg-slate-50 hover:text-ink"
                }`}
              >
                {x.etiqueta}
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    activo ? "bg-white/20" : alerta ? "bg-red-100 text-red-700" : "bg-slate-100 text-muted"
                  }`}
                >
                  {n}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <ListaTickets
        tickets={grupos[filtro]}
        base="/admin/tickets"
        vista="equipo"
        vacio={filtro === "pendientes" ? "No hay tickets por atender. ¡Todo al día!" : "No hay tickets en este filtro."}
      />
    </main>
  );
}
