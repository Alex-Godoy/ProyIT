import type { SupabaseClient } from "@supabase/supabase-js";
import { formatearFechaHora, type MensajeProyecto } from "@/lib/proyectos";
import { etiquetaCargo } from "@/lib/permisos";
import { HiloEnVivo, MensajeForm } from "@/components/proyectos/conversacion-vivo";
import { BotonEnviar } from "@/components/admin/ui";
import { eliminarMensajeAction } from "@/app/proyectos-acciones";

// Últimos mensajes del proyecto y hasta dónde los leyó este usuario.
export async function cargarMensajes(supabase: SupabaseClient, proyectoId: string, userId: string) {
  const [{ data }, { data: lectura }] = await Promise.all([
    supabase
      .from("proyecto_mensajes")
      .select("id, autor_id, autor_tipo, autor_nombre, autor_cargo, contenido, created_at")
      .eq("proyecto_id", proyectoId)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("proyecto_lecturas")
      .select("leido_at")
      .eq("proyecto_id", proyectoId)
      .eq("user_id", userId)
      .maybeSingle<{ leido_at: string }>(),
  ]);
  const mensajes = ((data ?? []) as MensajeProyecto[]).reverse();
  const leidoAt = lectura?.leido_at ?? null;
  const esNuevo = (m: MensajeProyecto) =>
    m.autor_id !== userId && (!leidoAt || Date.parse(m.created_at) > Date.parse(leidoAt));
  return {
    mensajes,
    userId,
    sinLeer: mensajes.filter(esNuevo).length,
    primerNuevoId: mensajes.find(esNuevo)?.id ?? null,
  };
}

export type DatosMensajes = Awaited<ReturnType<typeof cargarMensajes>>;

function etiquetaAutor(m: MensajeProyecto, vista: "cliente" | "equipo") {
  if (m.autor_tipo === "cliente") return vista === "equipo" ? `${m.autor_nombre} · Cliente` : m.autor_nombre;
  const cargo = !m.autor_cargo || m.autor_cargo === "admin" ? "ProyIT" : etiquetaCargo(m.autor_cargo);
  return m.autor_nombre === cargo ? cargo : `${m.autor_nombre} · ${cargo}`;
}

export function ConversacionProyecto({
  proyectoId,
  datos,
  vista,
  puedeEliminar = false,
}: {
  proyectoId: string;
  datos: DatosMensajes;
  vista: "cliente" | "equipo";
  puedeEliminar?: boolean;
}) {
  const { mensajes, userId, primerNuevoId } = datos;
  const ultimo = mensajes.at(-1)?.created_at ?? null;

  return (
    <section id="mensajes" className="scroll-mt-24 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <h2 className="text-lg font-semibold text-ink">{vista === "cliente" ? "Mensajes con tu equipo" : "Mensajes con el cliente"}</h2>
      <p className="mt-1 text-sm text-muted">
        {vista === "cliente"
          ? "Escríbele directamente a las personas que trabajan en tu proyecto."
          : "Lo ven el cliente y todas las personas asignadas al proyecto."}
      </p>

      <HiloEnVivo proyectoId={proyectoId} ultimo={ultimo}>
        {mensajes.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            {vista === "cliente"
              ? "Aún no hay mensajes. ¿Tienes una duda o un comentario? Escríbenos aquí."
              : "Aún no hay mensajes en este proyecto."}
          </p>
        ) : (
          <ol className="space-y-3" aria-label="Mensajes del proyecto">
            {mensajes.map((m) => {
              const propio = m.autor_id === userId;
              // Del mismo lado que quien mira (p. ej. un compañero de equipo).
              const mismoLado = !propio && (m.autor_tipo === "cliente") === (vista === "cliente");
              return (
                <li key={m.id}>
                  {m.id === primerNuevoId && (
                    <div data-nuevos className="my-3 flex items-center gap-3 text-xs font-semibold text-brand-orange-dark">
                      <span className="h-px flex-1 bg-brand-orange/30" />
                      Nuevos
                      <span className="h-px flex-1 bg-brand-orange/30" />
                    </div>
                  )}
                  <div className={`flex items-end gap-2 ${propio ? "justify-end" : "justify-start"}`}>
                    {!propio && (
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/5 text-xs font-bold text-navy"
                        aria-hidden
                      >
                        {m.autor_nombre.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[75%] ${
                        propio
                          ? "rounded-br-md bg-navy text-white"
                          : mismoLado
                            ? "rounded-bl-md bg-brand-blue/5 ring-1 ring-brand-blue/20"
                            : "rounded-bl-md bg-white ring-1 ring-slate-200"
                      }`}
                    >
                      <p className={`text-xs font-semibold ${propio ? "text-white/70" : "text-muted"}`}>
                        {propio ? "Tú" : etiquetaAutor(m, vista)} · {formatearFechaHora(m.created_at)}
                      </p>
                      <p className={`mt-0.5 whitespace-pre-line break-words ${propio ? "text-white" : "text-ink"}`}>
                        {m.contenido}
                      </p>
                    </div>
                    {puedeEliminar && (
                      <form action={eliminarMensajeAction.bind(null, proyectoId, m.id)} className="shrink-0">
                        <BotonEnviar variante="peligro" confirmar="¿Eliminar este mensaje? Nadie lo volverá a ver.">
                          <span aria-label="Eliminar mensaje">✕</span>
                        </BotonEnviar>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </HiloEnVivo>

      <MensajeForm
        proyectoId={proyectoId}
        placeholder={vista === "cliente" ? "Escribe tu mensaje al equipo…" : "Escribe tu mensaje al cliente…"}
      />
    </section>
  );
}
