import Link from "next/link";
import { requireUsuario } from "@/lib/auth";
import { COLUMNAS_PROYECTO, formatearFecha, type Proyecto } from "@/lib/proyectos";
import { BarraAvance, EtapaBadge } from "@/components/proyectos/ui";
import { ChipSinLeer, cargarSinLeer } from "@/components/proyectos/sin-leer";
import { CabeceraPagina, CuerpoPagina } from "@/components/portal/ui";

export const metadata = { title: "Mis proyectos · ProyIT" };

export default async function MisProyectosPage() {
  const { supabase } = await requireUsuario();

  // RLS ya filtra: solo llegan los proyectos del usuario o de su empresa.
  const [{ data }, sinLeer] = await Promise.all([
    supabase.from("proyectos").select(COLUMNAS_PROYECTO).order("updated_at", { ascending: false }),
    cargarSinLeer(supabase),
  ]);
  const proyectos = (data ?? []) as Proyecto[];

  return (
    <main>
      <CabeceraPagina cejaTexto="Proyectos" bajada="En qué etapa está cada solución que implementamos contigo.">
        Mis proyectos y avance
      </CabeceraPagina>
      <CuerpoPagina>
        {proyectos.length === 0 ? (
          <div className="mt-10 rounded-[18px] bg-white p-10 text-center shadow-sm ring-1 ring-linea">
            <p className="font-semibold text-ink">Aún no tienes proyectos activos.</p>
            <p className="mt-2 text-muted">Cuando iniciemos un proyecto contigo, lo verás aquí con su avance.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {proyectos.map((p) => (
              <Link
                key={p.id}
                href={`/portal/proyectos/${p.id}${sinLeer[p.id] ? "#mensajes" : ""}`}
                className="flex flex-col gap-4 rounded-[18px] bg-white p-6 shadow-sm ring-1 ring-linea transition hover:shadow-md hover:ring-brand-blue"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl font-bold text-tinta">{p.nombre}</h2>
                  <EtapaBadge etapa={p.etapa} />
                </div>
                {p.descripcion && <p className="line-clamp-2 text-muted">{p.descripcion}</p>}
                <BarraAvance avance={p.avance} />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-muted">Término estimado: {formatearFecha(p.fecha_termino_estimada)}</p>
                  <ChipSinLeer cantidad={sinLeer[p.id]} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CuerpoPagina>
    </main>
  );
}
