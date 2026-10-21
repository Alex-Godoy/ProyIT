import Link from "next/link";
import { redirect } from "next/navigation";
import { inicioSegunRol, requireUsuario } from "@/lib/auth";
import { MODULOS } from "@/components/brand";
import { ESTADOS_ABIERTOS } from "@/lib/tickets";
import { textoSinLeer } from "@/lib/proyectos";
import { cargarSinLeer } from "@/components/proyectos/sin-leer";
import {
  CabeceraPagina,
  CuerpoPagina,
  botonContornoClaro,
  botonNaranjo,
  tarjeta,
  tarjetaEnlace,
} from "@/components/portal/ui";

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
  const [{ count: totalProyectos }, { data: clientes }, { data: ticketsAbiertos }, sinLeer] = await Promise.all([
    supabase.from("proyectos").select("id", { count: "exact", head: true }),
    supabase.from("clientes").select("nombre, nombre_fantasia").order("nombre"),
    supabase.from("tickets").select("estado").in("estado", ESTADOS_ABIERTOS),
    cargarSinLeer(supabase),
  ]);
  const mensajesNuevos = Object.values(sinLeer).reduce((a, b) => a + b, 0);
  const nTickets = ticketsAbiertos?.length ?? 0;
  const esperandome = ticketsAbiertos?.filter((t) => t.estado === "esperando_cliente").length ?? 0;
  const contadores: Record<string, { texto: string; alerta?: boolean }> = {
    proyectos:
      mensajesNuevos > 0
        ? { texto: textoSinLeer(mensajesNuevos), alerta: true }
        : { texto: `${totalProyectos ?? 0} ${totalProyectos === 1 ? "proyecto" : "proyectos"}` },
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
    <main>
      <CabeceraPagina
        solapa
        cejaTexto={empresa || "Tu espacio con ProyIT"}
        bajada="Aquí tienes todo lo que hacemos contigo, en un solo lugar."
        acciones={
          // Lo más urgente que viene a hacer un socio: pedir ayuda, a un toque.
          clientes && clientes.length > 0 ? (
            <>
              <Link href="/portal/tickets/nuevo" className={botonNaranjo}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                Pedir soporte
              </Link>
              {nTickets > 0 && (
                <Link href="/portal/tickets" className={botonContornoClaro}>
                  Ver mis tickets ({nTickets} {nTickets === 1 ? "abierto" : "abiertos"})
                </Link>
              )}
            </>
          ) : undefined
        }
      >
        Hola, {nombre}
      </CabeceraPagina>

      <CuerpoPagina solapa>
        <div className="grid gap-5 sm:grid-cols-2">
          {MODULOS.map((m) => {
            const href = MODULOS_ACTIVOS[m.key];
            const contador = contadores[m.key];
            const contenido = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span className={`inline-flex rounded-xl p-3 ${href ? "bg-celeste text-navy" : "bg-fondo text-gris"}`}>
                    {m.icon}
                  </span>
                  {href ? (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        contador?.alerta ? "bg-durazno text-[#8a4a12]" : "bg-fondo text-navy"
                      }`}
                    >
                      {contador?.texto}
                    </span>
                  ) : (
                    <span className="rounded-full border border-linea px-3 py-1 text-xs font-bold uppercase tracking-[0.06em] text-gris">
                      Próximamente
                    </span>
                  )}
                </div>
                <h2 className="mt-5 font-display text-[22px] font-bold leading-tight text-tinta">{m.titulo}</h2>
                <p className="mt-2 flex-grow text-[15px] text-gris">{m.texto}</p>
                {href && (
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-bold text-navy">
                    Abrir
                    <span aria-hidden="true" className="transition group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                )}
              </>
            );

            return href ? (
              <Link key={m.key} href={href} className={`${tarjetaEnlace} group flex flex-col p-6 sm:p-7`}>
                {contenido}
              </Link>
            ) : (
              <article key={m.key} className={`${tarjeta} flex flex-col p-6 sm:p-7`}>
                {contenido}
              </article>
            );
          })}
        </div>
      </CuerpoPagina>
    </main>
  );
}
