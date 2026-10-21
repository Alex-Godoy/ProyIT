import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { COLUMNAS_CLIENTE, nombreVisible, type Cliente, type TipoCliente } from "@/lib/clientes";
import { TipoBadge } from "@/components/admin/tipo-badge";
import { inputClase } from "@/components/admin/ui";
import { CabeceraPagina, CuerpoPagina, botonNaranjo } from "@/components/portal/ui";

type FilaCliente = Cliente & {
  proyectos: { count: number }[];
  accesos: { user_id: string | null }[];
};

const FILTROS: { valor: "" | TipoCliente; etiqueta: string }[] = [
  { valor: "", etiqueta: "Todos" },
  { valor: "empresa", etiqueta: "Empresas" },
  { valor: "persona", etiqueta: "Personas" },
];

export default async function AdminClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; q?: string }>;
}) {
  const { tipo: tipoParam, q: qParam } = await searchParams;
  const tipo = tipoParam === "empresa" || tipoParam === "persona" ? tipoParam : "";
  const q = qParam?.trim() ?? "";
  const { supabase } = await requireAdmin();

  let consulta = supabase
    .from("clientes")
    .select(`${COLUMNAS_CLIENTE}, proyectos(count), accesos:cliente_accesos(user_id)`)
    .order("activo", { ascending: false })
    .order("nombre");
  if (tipo) consulta = consulta.eq("tipo", tipo);
  if (q) {
    // Quita caracteres que rompen la sintaxis del filtro .or() de PostgREST.
    const termino = q.replace(/[,()*%]/g, " ");
    consulta = consulta.or(
      `nombre.ilike.%${termino}%,nombre_fantasia.ilike.%${termino}%,rut.ilike.%${termino}%,email.ilike.%${termino}%`,
    );
  }
  const { data } = await consulta;
  const clientes = (data ?? []) as unknown as FilaCliente[];

  const hrefFiltro = (valor: string) => {
    const p = new URLSearchParams();
    if (valor) p.set("tipo", valor);
    if (q) p.set("q", q);
    const s = p.toString();
    return `/admin/clientes${s ? `?${s}` : ""}`;
  };

  return (
    <main>
      <CabeceraPagina
        cejaTexto="Cartera"
        bajada="Empresas y personas con las que trabajas."
        acciones={
          <Link href="/admin/clientes/nuevo" className={botonNaranjo}>
            + Nuevo cliente
          </Link>
        }
      >
        Clientes
      </CabeceraPagina>
      <CuerpoPagina>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-3 gap-1 rounded-full border border-linea bg-white p-1 sm:inline-grid">
            {FILTROS.map((f) => (
              <Link
                key={f.valor}
                href={hrefFiltro(f.valor)}
                className={`flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-center text-sm font-semibold transition ${
                  tipo === f.valor ? "bg-marino text-white" : "text-gris hover:bg-fondo hover:text-tinta"
                }`}
              >
                {f.etiqueta}
              </Link>
            ))}
          </div>
          <form className="flex gap-2 sm:w-80">
            {tipo && <input type="hidden" name="tipo" value={tipo} />}
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Buscar por nombre, RUT o correo"
              aria-label="Buscar clientes"
              className={inputClase}
            />
          </form>
        </div>

        {clientes.length === 0 ? (
          <div className="mt-6 rounded-[18px] bg-white p-10 text-center shadow-sm ring-1 ring-linea">
            <p className="font-semibold text-ink">{q || tipo ? "No hay clientes con ese filtro." : "Aún no tienes clientes."}</p>
            {!q && !tipo && (
              <p className="mt-2 text-muted">Crea tu primer cliente: una empresa o una persona.</p>
            )}
          </div>
        ) : (
          <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {clientes.map((c) => {
              const nProyectos = c.proyectos[0]?.count ?? 0;
              const conectados = c.accesos.filter((a) => a.user_id).length;
              return (
                <li key={c.id}>
                  <Link
                    href={`/admin/clientes/${c.id}`}
                    className={`flex h-full flex-col rounded-[18px] bg-white p-5 shadow-sm ring-1 ring-linea transition hover:shadow-md hover:ring-brand-blue ${
                      c.activo ? "" : "opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-ink">{nombreVisible(c)}</p>
                      <TipoBadge tipo={c.tipo} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {[c.rut, c.comuna].filter(Boolean).join(" · ") || "Sin RUT"}
                      {!c.activo && " · Inactivo"}
                    </p>
                    <div className="mt-auto flex gap-4 pt-4 text-sm">
                      <span className="text-ink">
                        <strong>{nProyectos}</strong> {nProyectos === 1 ? "proyecto" : "proyectos"}
                      </span>
                      <span className="text-ink">
                        <strong>{conectados}</strong>/{c.accesos.length} con acceso activo
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CuerpoPagina>
    </main>
  );
}
