import Link from "next/link";
import { requireUsuario } from "@/lib/auth";
import { RESPONSABLE } from "@/lib/empresa";
import { formatearFecha, formatearFechaHora } from "@/lib/proyectos";
import {
  COLUMNAS_SOLICITUD,
  ESTADOS_SOLICITUD,
  TIPOS_SOLICITUD,
  etiquetaTipo,
  type Solicitud,
} from "@/lib/derechos";
import { BotonEnviar, inputClase, labelClase } from "@/components/admin/ui";
import { actualizarMisDatosAction, crearSolicitudAction } from "./actions";
import { CabeceraPagina, CuerpoPagina } from "@/components/portal/ui";

export const metadata = { title: "Mis datos · Portal ProyIT" };

// Mensajes por código: la URL nunca trae texto libre que se muestre en pantalla.
const AVISOS: Record<string, { ok: boolean; texto: string }> = {
  datos_guardados: { ok: true, texto: "Tus datos se actualizaron." },
  solicitud_enviada: { ok: true, texto: "Recibimos tu solicitud. Te responderemos dentro de 30 días corridos." },
  nombre_vacio: { ok: false, texto: "El nombre no puede quedar vacío." },
  tipo_invalido: { ok: false, texto: "Elige qué derecho quieres ejercer." },
  error: { ok: false, texto: "No pudimos guardar el cambio. Inténtalo de nuevo." },
};

type AccesoPropio = {
  email: string;
  cargo: string | null;
  cliente: { tipo: string; nombre: string } | null;
};

const tarjeta = "rounded-[18px] bg-white p-5 shadow-sm ring-1 ring-linea sm:p-6";

export default async function MisDatosPage({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  const { aviso } = await searchParams;
  const mensaje = aviso ? AVISOS[aviso] : undefined;
  const { supabase, user, perfil } = await requireUsuario();

  const [{ data: accesosData }, { data: solicitudesData }] = await Promise.all([
    supabase.from("cliente_accesos").select("email, cargo, cliente:clientes(tipo, nombre)").eq("user_id", user.id),
    supabase
      .from("solicitudes_derechos")
      .select(COLUMNAS_SOLICITUD)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);
  const accesos = (accesosData ?? []) as unknown as AccesoPropio[];
  const solicitudes = (solicitudesData ?? []) as Solicitud[];

  return (
    <main>
      <CabeceraPagina
        ancho="medio"
        cejaTexto="Tu cuenta y privacidad"
        bajada="Revisa qué datos personales tenemos sobre ti, corrígelos, descárgalos o ejerce tus derechos según la Ley 21.719."
      >
        Mis datos
      </CabeceraPagina>
      <CuerpoPagina ancho="medio">
        {mensaje && (
          <div
            role={mensaje.ok ? "status" : "alert"}
            className={`mt-5 rounded-lg px-4 py-3 text-sm ${
              mensaje.ok ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {mensaje.texto}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Datos de la cuenta (rectificación) */}
          <section className={tarjeta}>
            <h2 className="font-display text-xl font-bold text-tinta">Tu cuenta</h2>
            <form action={actualizarMisDatosAction} className="mt-4 space-y-4">
              <div>
                <label htmlFor="full_name" className={labelClase}>
                  Nombre
                </label>
                <input id="full_name" name="full_name" required maxLength={120} defaultValue={perfil?.full_name ?? ""} className={inputClase} />
              </div>
              <div>
                <label htmlFor="company" className={labelClase}>
                  Empresa
                </label>
                <input id="company" name="company" maxLength={120} defaultValue={perfil?.company ?? ""} className={inputClase} />
              </div>
              <div>
                <span className={labelClase}>Correo</span>
                <p className="rounded-lg bg-fondo px-3 py-2 text-sm text-ink">{user.email}</p>
                <p className="mt-1 text-xs text-muted">Para cambiar tu correo, solicita una rectificación.</p>
              </div>
              <BotonEnviar>Guardar cambios</BotonEnviar>
            </form>

            <dl className="mt-6 grid gap-3 border-t border-linea/70 pt-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">Cuenta creada</dt>
                <dd className="font-medium text-ink">{perfil ? formatearFechaHora(perfil.created_at) : "—"}</dd>
              </div>
              <div>
                <dt className="text-muted">Política de privacidad aceptada</dt>
                <dd className="font-medium text-ink">
                  {perfil?.privacidad_aceptada_at ? formatearFechaHora(perfil.privacidad_aceptada_at) : "—"}
                </dd>
              </div>
            </dl>
          </section>

          <div className="space-y-6">
            {/* Accesos */}
            <section className={tarjeta}>
              <h2 className="font-display text-xl font-bold text-tinta">Clientes a los que tienes acceso</h2>
              {accesos.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Tu cuenta aún no está vinculada a ningún cliente.</p>
              ) : (
                <ul className="mt-3 divide-y divide-linea/70 text-sm">
                  {accesos.map((a, i) => (
                    <li key={i} className="py-2">
                      <p className="font-medium text-ink">{a.cliente?.nombre ?? "Cliente"}</p>
                      <p className="text-muted">
                        {a.cliente?.tipo === "persona" ? "Persona" : "Empresa"}
                        {a.cargo ? ` · ${a.cargo}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Descarga (acceso y portabilidad) */}
            <section className={tarjeta}>
              <h2 className="font-display text-xl font-bold text-tinta">Descargar mis datos</h2>
              <p className="mt-1 text-sm text-muted">
                Obtén una copia de tus datos en formato JSON, legible por personas y por otros sistemas.
              </p>
              <a
                href="/portal/mis-datos/exportar"
                className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-navy/20 px-4 py-2 text-sm font-semibold text-navy hover:bg-slate-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                </svg>
                Descargar (JSON)
              </a>
            </section>
          </div>
        </div>

        {/* Ejercer derechos */}
        <section id="solicitudes" className={`mt-6 scroll-mt-24 ${tarjeta}`}>
          <h2 className="font-display text-xl font-bold text-tinta">Ejercer mis derechos</h2>
          <p className="mt-1 text-sm text-muted">
            Es gratuito. Respondemos dentro de 30 días corridos. También puedes escribir a {RESPONSABLE.emailPrivacidad}.
          </p>

          <form action={crearSolicitudAction} className="mt-5 space-y-4">
            <fieldset>
              <legend className={labelClase}>¿Qué quieres solicitar?</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {TIPOS_SOLICITUD.map((t) => (
                  <label
                    key={t.valor}
                    className="flex cursor-pointer gap-3 rounded-xl p-3 ring-1 ring-linea transition hover:ring-brand-blue has-[:checked]:bg-brand-blue/5 has-[:checked]:ring-2 has-[:checked]:ring-brand-blue"
                  >
                    <input type="radio" name="tipo" value={t.valor} required className="mt-1 accent-navy" />
                    <span>
                      <span className="block text-sm font-semibold text-ink">{t.etiqueta}</span>
                      <span className="block text-xs text-muted">{t.texto}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="detalle" className={labelClase}>
                Detalle (opcional)
              </label>
              <textarea
                id="detalle"
                name="detalle"
                rows={3}
                maxLength={2000}
                placeholder="Cuéntanos qué necesitas, por ejemplo qué dato corregir."
                className={inputClase}
              />
            </div>
            <BotonEnviar>Enviar solicitud</BotonEnviar>
          </form>

          {solicitudes.length > 0 && (
            <div className="mt-8 border-t border-linea/70 pt-5">
              <h3 className="text-sm font-semibold text-ink">Tus solicitudes</h3>
              <ul className="mt-3 space-y-3">
                {solicitudes.map((s) => (
                  <li key={s.id} className="rounded-xl p-4 ring-1 ring-linea">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-ink">{etiquetaTipo(s.tipo)}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADOS_SOLICITUD[s.estado].clase}`}>
                        {ESTADOS_SOLICITUD[s.estado].etiqueta}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      Enviada {formatearFechaHora(s.created_at)} · Plazo de respuesta {formatearFecha(s.plazo_respuesta)}
                    </p>
                    {s.detalle && <p className="mt-2 whitespace-pre-line text-sm text-ink">{s.detalle}</p>}
                    {s.respuesta && (
                      <div className="mt-3 rounded-lg bg-fondo p-3 text-sm">
                        <p className="text-xs font-semibold text-muted">Respuesta de ProyIT</p>
                        <p className="mt-1 whitespace-pre-line text-ink">{s.respuesta}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <p className="mt-6 text-sm text-muted">
          Más detalles en nuestra{" "}
          <Link href="/privacidad" className="font-medium text-acento hover:underline">
            Política de Privacidad
          </Link>
          . Si no estás conforme con nuestra respuesta, puedes reclamar ante la Agencia de Protección de Datos Personales.
        </p>
      </CuerpoPagina>
    </main>
  );
}
