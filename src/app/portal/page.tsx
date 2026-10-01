import Link from "next/link";
import { redirect } from "next/navigation";
import { inicioSegunRol, requireUsuario } from "@/lib/auth";
import { MODULOS } from "@/components/brand";
import { ESTADOS_ABIERTOS } from "@/lib/tickets";

export const metadata = { title: "Mi portal · ProyIT" };

// Módulos que ya tienen pantalla propia; el resto se muestra como "Próximamente".
const MODULOS_ACTIVOS: Record<string, string> = {
  proyectos: "/portal/proyectos",
  soporte: "/portal/tickets",
};

export default async function PortalPage() {
  const { supabase, user, perfil } = await requireUsuario();
  // Super usuario y equipo tienen su propio inicio; el de cliente no les sirve.
  if (perfil?.role === "admin" || perfil?.role === "equipo") redirect(inicioSegunRol(perfil.role));

  // RLS filtra: solo llegan los clientes y proyectos a los que el usuario tiene acceso.
  const [{ count: totalProyectos }, { data: clientes }, { data: ticketsAbiertos }] = await Promise.all([
    supabase.from("proyectos").select("id", { count: "exact", head: true }),
    supabase.from("clientes").select("nombre, nombre_fantasia").order("nombre"),
    supabase.from("tickets").select("estado").in("estado", ESTADOS_ABIERTOS),
  ]);
  const nTickets = ticketsAbiertos?.length ?? 0;
  const esperandome = ticketsAbiertos?.filter((t) => t.estado === "esperando_cliente").length ?? 0;
  const contadores: Record<string, { texto: string; alerta?: boolean }> = {
    proyectos: { texto: `${totalProyectos ?? 0} ${totalProyectos === 1 ? "proyecto" : "proyectos"}` },
    soporte:
      esperandome > 0
        ? { texto: `${esperandome} esperando tu respuesta`, alerta: true }
        : { texto: nTickets === 0 ? "Sin tickets abiertos" : `${nTickets} ${nTickets === 1 ? "abierto" : "abiertos"}` },
  };

  const nombre = perfil?.full_name?.split(" ")[0] ?? user.email?.split("@")[0];
  const empresa =
    clientes && clientes.length > 0
      ? clientes.map((c) => c.nombre_fantasia ?? c.nombre).join(", ")
      : perfil?.company;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-bold text-navy sm:text-3xl">Hola, {nombre}</h1>
      <p className="mt-2 text-muted">
        {empresa ? `${empresa} · ` : ""}
        Aquí tienes todo lo que hacemos contigo, en un solo lugar.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {MODULOS.map((m) => {
          const href = MODULOS_ACTIVOS[m.key];
          const contenido = (
            <>
              {href ? (
                <span
                  className={`absolute right-5 top-5 rounded-full px-3 py-1 text-xs font-semibold ${
                    contadores[m.key]?.alerta ? "bg-amber-100 text-amber-800" : "bg-navy/5 text-navy"
                  }`}
                >
                  {contadores[m.key]?.texto}
                </span>
              ) : (
                <span className="absolute right-5 top-5 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange-dark">
                  Próximamente
                </span>
              )}
              <div className="mb-4 inline-flex rounded-lg bg-navy/5 p-2.5 text-navy">{m.icon}</div>
              <h2 className="text-lg font-semibold text-ink">{m.titulo}</h2>
              <p className="mt-2 text-muted">{m.texto}</p>
            </>
          );

          return href ? (
            <Link
              key={m.key}
              href={href}
              className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md hover:ring-brand-blue"
            >
              {contenido}
            </Link>
          ) : (
            <article key={m.key} className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              {contenido}
            </article>
          );
        })}
      </div>
    </main>
  );
}
