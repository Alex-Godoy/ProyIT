import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEquipo, rolEnProyecto } from "@/lib/auth";
import { etiquetaCargo } from "@/lib/permisos";
import { cargarContextoProyecto, cargarProyecto } from "@/components/proyectos/detalle";
import ProyectoWorkspace, { pestanaValida } from "@/components/proyectos/workspace";
import { Avisos } from "@/components/admin/avisos";

export default async function EquipoProyectoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string; tab?: string }>;
}) {
  const { id } = await params;
  const { error, ok, tab } = await searchParams;
  const { supabase, user, perfil } = await requireEquipo();

  const rol = await rolEnProyecto(supabase, user.id, perfil, id);
  if (!rol) notFound();
  const datos = await cargarProyecto(supabase, id);
  if (!datos) notFound();
  const contexto = await cargarContextoProyecto(supabase, datos.proyecto);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/equipo" className="text-sm font-medium text-brand-blue hover:underline">
        ← Mis proyectos
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-navy">{datos.proyecto.nombre}</h1>
        <span className="rounded-full bg-navy/5 px-2.5 py-0.5 text-xs font-semibold text-navy">
          Tu rol: {rol === "admin" ? "Super usuario" : etiquetaCargo(rol)}
        </span>
      </div>
      <Avisos error={error} ok={ok} />

      <ProyectoWorkspace
        base="/equipo/proyectos"
        rol={rol}
        pestana={pestanaValida(tab)}
        {...datos}
        equipo={contexto.equipo}
        cliente={contexto.cliente}
      />
    </main>
  );
}
