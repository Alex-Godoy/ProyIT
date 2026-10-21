import { notFound } from "next/navigation";
import { requireEquipo, rolEnProyecto } from "@/lib/auth";
import { etiquetaCargo } from "@/lib/permisos";
import { cargarContextoProyecto, cargarProyecto } from "@/components/proyectos/detalle";
import { cargarMensajes } from "@/components/proyectos/mensajes";
import ProyectoWorkspace, { pestanaValida } from "@/components/proyectos/workspace";
import { Avisos } from "@/components/admin/avisos";
import { CabeceraPagina, CuerpoPagina } from "@/components/portal/ui";

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
  const [contexto, mensajes] = await Promise.all([
    cargarContextoProyecto(supabase, datos.proyecto),
    cargarMensajes(supabase, id, user.id),
  ]);

  return (
    <main>
      <CabeceraPagina
        ancho="medio"
        volver={{ href: "/equipo", label: "Mis proyectos" }}
        cejaTexto={`Tu rol: ${rol === "admin" ? "Super usuario" : etiquetaCargo(rol)}`}
      >
        {datos.proyecto.nombre}
      </CabeceraPagina>
      <CuerpoPagina ancho="medio">
        <Avisos error={error} ok={ok} />

        <ProyectoWorkspace
          base="/equipo/proyectos"
          rol={rol}
          pestana={pestanaValida(tab)}
          {...datos}
          equipo={contexto.equipo}
          cliente={contexto.cliente}
          mensajes={mensajes}
        />
      </CuerpoPagina>
    </main>
  );
}
