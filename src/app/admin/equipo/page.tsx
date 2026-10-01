import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { CARGOS, etiquetaCargo } from "@/lib/permisos";
import { Avisos } from "@/components/admin/avisos";
import { BotonEnviar, inputClase, labelClase } from "@/components/admin/ui";
import { actualizarMiembroAction, invitarMiembroAction } from "../actions";

export const metadata = { title: "Equipo · Administración ProyIT" };

type Miembro = {
  id: string;
  email: string;
  nombre: string;
  cargo: string;
  telefono: string | null;
  activo: boolean;
  user_id: string | null;
  proyectos: { proyecto: { id: string; nombre: string } | null }[];
};

const tarjeta = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6";

const PERMISOS_POR_CARGO: Record<string, string> = {
  jefe_proyecto: "Todo en sus proyectos: hitos, documentos, bitácora, etapa y avance, y eliminar.",
  ingeniero: "Crea y edita hitos, sube documentos y publica en la bitácora.",
  tecnico: "Marca hitos como completados y sube documentos (actas, fotos).",
  soporte: "Ve sus proyectos; atenderá tickets de soporte.",
};

export default async function AdminEquipoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("equipo")
    .select("id, email, nombre, cargo, telefono, activo, user_id, proyectos:proyecto_equipo(proyecto:proyectos(id, nombre))")
    .order("activo", { ascending: false })
    .order("nombre");
  const miembros = (data ?? []) as unknown as Miembro[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-bold text-navy">Equipo ProyIT</h1>
      <p className="mt-1 max-w-2xl text-muted">
        Ingenieros, técnicos y soporte. Cada persona ve solo los proyectos a los que la asignes, con los permisos de su
        cargo.
      </p>
      <Avisos error={error} ok={ok} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className={`${tarjeta} h-fit lg:order-2`}>
          <h2 className="text-lg font-semibold text-ink">Agregar integrante</h2>
          <form action={invitarMiembroAction} className="mt-4 space-y-4">
            <div>
              <label htmlFor="nombre" className={labelClase}>
                Nombre *
              </label>
              <input id="nombre" name="nombre" required className={inputClase} />
            </div>
            <div>
              <label htmlFor="email" className={labelClase}>
                Correo *
              </label>
              <input id="email" name="email" type="email" required placeholder="nombre@proyit.tech" className={inputClase} />
              <p className="mt-1 text-xs text-muted">Con este correo se registrará en el portal.</p>
            </div>
            <div>
              <label htmlFor="cargo" className={labelClase}>
                Cargo *
              </label>
              <select id="cargo" name="cargo" required defaultValue="" className={inputClase}>
                <option value="" disabled>
                  Elige un cargo…
                </option>
                {CARGOS.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.etiqueta}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="telefono" className={labelClase}>
                Teléfono
              </label>
              <input id="telefono" name="telefono" type="tel" placeholder="+56 9 1234 5678" className={inputClase} />
            </div>
            <BotonEnviar>Agregar al equipo</BotonEnviar>
          </form>

          <details className="mt-6 border-t border-slate-100 pt-4 text-sm">
            <summary className="cursor-pointer font-medium text-brand-blue">¿Qué puede hacer cada cargo?</summary>
            <dl className="mt-3 space-y-2">
              {CARGOS.map((c) => (
                <div key={c.valor}>
                  <dt className="font-semibold text-ink">{c.etiqueta}</dt>
                  <dd className="text-muted">{PERMISOS_POR_CARGO[c.valor]}</dd>
                </div>
              ))}
            </dl>
          </details>
        </section>

        <section className="space-y-3 lg:order-1 lg:col-span-2">
          {miembros.length === 0 ? (
            <div className={`${tarjeta} text-center`}>
              <p className="font-semibold text-ink">Aún no tienes equipo registrado.</p>
              <p className="mt-2 text-muted">Agrega a tu primer ingeniero o técnico con el formulario.</p>
            </div>
          ) : (
            miembros.map((m) => {
              const proyectos = m.proyectos.map((p) => p.proyecto).filter((p) => p !== null);
              return (
                <article key={m.id} className={`${tarjeta} ${m.activo ? "" : "opacity-70"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/5 font-bold text-navy">
                        {m.nombre.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{m.nombre}</p>
                        <p className="truncate text-sm text-muted">
                          {etiquetaCargo(m.cargo)} · {m.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        !m.activo
                          ? "bg-slate-200 text-slate-700"
                          : m.user_id
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {!m.activo ? "Inactivo" : m.user_id ? "Activo" : "Pendiente de registro"}
                    </span>
                  </div>

                  <div className="mt-3 text-sm">
                    <span className="text-muted">Proyectos: </span>
                    {proyectos.length === 0 ? (
                      <span className="text-muted">ninguno asignado</span>
                    ) : (
                      proyectos.map((p, i) => (
                        <span key={p.id}>
                          {i > 0 && ", "}
                          <Link href={`/admin/proyectos/${p.id}?tab=equipo`} className="text-brand-blue hover:underline">
                            {p.nombre}
                          </Link>
                        </span>
                      ))
                    )}
                  </div>

                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-brand-blue hover:underline">Editar</summary>
                    <form
                      action={actualizarMiembroAction.bind(null, m.id)}
                      className="mt-3 grid gap-3 rounded-xl bg-surface p-3 sm:grid-cols-3"
                    >
                      <input name="nombre" required defaultValue={m.nombre} aria-label="Nombre" className={inputClase} />
                      <select name="cargo" defaultValue={m.cargo} aria-label="Cargo" className={inputClase}>
                        {CARGOS.map((c) => (
                          <option key={c.valor} value={c.valor}>
                            {c.etiqueta}
                          </option>
                        ))}
                      </select>
                      <input
                        name="telefono"
                        type="tel"
                        defaultValue={m.telefono ?? ""}
                        placeholder="Teléfono"
                        aria-label="Teléfono"
                        className={inputClase}
                      />
                      <label className="flex items-center gap-2 text-sm sm:col-span-2">
                        <input type="checkbox" name="activo" defaultChecked={m.activo} className="h-4 w-4 accent-navy" />
                        <span className="text-ink">Activo (si lo desactivas, pierde el acceso a todos sus proyectos)</span>
                      </label>
                      <div className="sm:text-right">
                        <BotonEnviar>Guardar</BotonEnviar>
                      </div>
                    </form>
                  </details>
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
