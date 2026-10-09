"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Captcha, { TURNSTILE_SITE_KEY, type CaptchaHandle } from "@/components/captcha";
import { solicitarDiagnosticoAction, type EstadoEnvio } from "@/app/diagnostico-acciones";
import { SERVICIOS_SOPORTE, type ServicioSoporte } from "@/lib/soporte";
import { CONTACTO_EMAIL } from "@/lib/sitio";

// Formulario de /soporte. Usa el mismo flujo que el formulario del home
// (solicitarDiagnosticoAction): la solicitud llega a "Contactos web" del panel
// y por correo, con el servicio elegido como tema.

const EVENTO = "proyit:servicio";

// Los botones de la página ("Solicitar este plan", "Solicitar diagnóstico")
// eligen el servicio y bajan al formulario.
export function BotonServicio({
  servicio,
  children,
  className,
}: {
  servicio: string;
  children: React.ReactNode;
  className: string;
}) {
  return (
    <a
      href="#solicitar"
      onClick={() => window.dispatchEvent(new CustomEvent<string>(EVENTO, { detail: servicio }))}
      className={className}
    >
      {children}
    </a>
  );
}

const GRUPOS: { grupo: ServicioSoporte["grupo"]; etiqueta: string }[] = [
  { grupo: "urgencia", etiqueta: "Urgencias" },
  { grupo: "personas", etiqueta: "Personas · IVA incluido" },
  { grupo: "empresas", etiqueta: "Empresas · IVA incluido" },
];

function etiquetaOpcion(s: ServicioSoporte) {
  if (s.grupo === "urgencia") return `${s.nombre} — ${s.precio.toLowerCase()}`;
  const precio = s.precio === "Según modelo" ? "precio según modelo" : s.precio;
  return `${s.nombre} — ${precio}${s.unidad.startsWith("/ mes") ? " al mes" : ""}`;
}

const campo =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-acento focus:ring-2 focus:ring-acento/20";
const etiqueta = "mb-1.5 block text-sm font-semibold text-titulo";

function BotonEnviar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-full bg-noche px-6 py-3.5 text-base font-semibold text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Enviando…" : "Enviar solicitud"}
    </button>
  );
}

export default function SolicitarServicio() {
  const [servicioId, setServicioId] = useState("");
  const [vez, setVez] = useState(0);
  const [estado, enviar] = useActionState<EstadoEnvio, FormData>(solicitarDiagnosticoAction, null);
  const [respuestaEn, setRespuestaEn] = useState<number | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [pideCaptcha, setPideCaptcha] = useState(false);
  const captcha = useRef<CaptchaHandle>(null);
  const select = useRef<HTMLSelectElement>(null);

  const servicio = SERVICIOS_SOPORTE.find((s) => s.id === servicioId) ?? null;

  useEffect(() => {
    const alElegir = (e: Event) => {
      setServicioId((e as CustomEvent<string>).detail);
      // Después de bajar a la sección, el foco queda en el formulario.
      setTimeout(() => select.current?.focus({ preventScroll: true }), 400);
    };
    window.addEventListener(EVENTO, alElegir);
    return () => window.removeEventListener(EVENTO, alElegir);
  }, []);

  useEffect(() => {
    if (!estado) return;
    setRespuestaEn(vez);
    if (!estado.ok) captcha.current?.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  const actual = respuestaEn === vez ? estado : null;
  const enviado = actual?.ok === true;
  const error = actual && !actual.ok ? actual.error : null;

  function otraSolicitud() {
    setServicioId("");
    setCaptchaToken(null);
    setPideCaptcha(false);
    setVez((v) => v + 1);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">
      <div>
        {enviado ? (
          <div role="status" className="rounded-2xl bg-[#e6f1fb] p-6 sm:p-7">
            <p className="font-display text-xl font-bold text-titulo sm:text-2xl">¡Gracias! Recibimos tu solicitud.</p>
            <p className="mt-2 leading-relaxed text-ink">
              {servicio ? `Servicio: ${servicio.nombre}. ` : ""}Te escribiremos por WhatsApp para coordinar. También te
              enviamos una confirmación por correo.
            </p>
            <button
              type="button"
              onClick={otraSolicitud}
              className="mt-5 inline-flex rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-titulo transition hover:border-noche"
            >
              Hacer otra solicitud
            </button>
          </div>
        ) : (
          <form
            key={vez}
            action={enviar}
            onSubmit={(e) => {
              if (TURNSTILE_SITE_KEY && !captchaToken) {
                e.preventDefault();
                setPideCaptcha(true);
              }
            }}
            className="space-y-5"
          >
            <input type="hidden" name="origen" value="pagina-soporte" />
            <input type="hidden" name="interes" value={servicio?.interes ?? ""} />
            <input type="hidden" name="captcha" value={captchaToken ?? ""} />
            {/* Campo trampa para bots: oculto a personas y lectores de pantalla. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Sitio web
                <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div>
              <label htmlFor="sp-servicio" className={etiqueta}>
                Servicio *
              </label>
              <select
                ref={select}
                id="sp-servicio"
                required
                value={servicioId}
                onChange={(e) => setServicioId(e.target.value)}
                className={campo}
              >
                <option value="">Selecciona un servicio</option>
                {GRUPOS.map((g) => (
                  <optgroup key={g.grupo} label={g.etiqueta}>
                    {SERVICIOS_SOPORTE.filter((s) => s.grupo === g.grupo).map((s) => (
                      <option key={s.id} value={s.id}>
                        {etiquetaOpcion(s)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="sp-nombre" className={etiqueta}>
                  Nombre *
                </label>
                <input id="sp-nombre" name="nombre" required minLength={2} maxLength={120} autoComplete="name" className={campo} />
              </div>
              <div>
                <label htmlFor="sp-telefono" className={etiqueta}>
                  WhatsApp *
                </label>
                <input
                  id="sp-telefono"
                  name="telefono"
                  type="tel"
                  inputMode="tel"
                  required
                  minLength={9}
                  maxLength={40}
                  autoComplete="tel"
                  placeholder="+56 9 1234 5678"
                  className={campo}
                />
              </div>
              <div>
                <label htmlFor="sp-email" className={etiqueta}>
                  Correo *
                </label>
                <input
                  id="sp-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                  placeholder="nombre@correo.cl"
                  className={campo}
                />
              </div>
              <div>
                <label htmlFor="sp-comuna" className={etiqueta}>
                  Comuna
                </label>
                <input id="sp-comuna" name="comuna" maxLength={80} autoComplete="address-level2" className={campo} />
              </div>
            </div>

            <div>
              <label htmlFor="sp-mensaje" className={etiqueta}>
                Cuéntanos qué pasa
              </label>
              <textarea
                id="sp-mensaje"
                name="mensaje"
                rows={4}
                maxLength={2000}
                placeholder="Ej.: mi notebook se apaga solo después de unos minutos"
                className={`${campo} resize-y`}
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-snug text-ink">
              <input type="checkbox" name="privacidad" required className="mt-0.5 h-5 w-5 shrink-0 accent-[#061e4a]" />
              <span>
                Acepto que ProyIT use mis datos solo para responder esta solicitud, según la{" "}
                <Link href="/privacidad" target="_blank" className="font-medium text-navy underline">
                  política de privacidad
                </Link>
                . *
              </span>
            </label>

            <div>
              <Captcha
                ref={captcha}
                onToken={(t) => {
                  setCaptchaToken(t);
                  if (t) setPideCaptcha(false);
                }}
              />
              {pideCaptcha && (
                <p role="alert" className="mt-2 text-sm text-red-700">
                  Completa la verificación de seguridad para enviar.
                </p>
              )}
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error} Si el problema sigue, escríbenos a{" "}
                <a href={`mailto:${CONTACTO_EMAIL}`} className="font-semibold underline">
                  {CONTACTO_EMAIL}
                </a>
                .
              </p>
            )}

            <BotonEnviar />
          </form>
        )}
      </div>

      <aside className="rounded-2xl border border-[#d5dfee] bg-surface p-6 sm:p-7" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Tu solicitud</p>
        {servicio ? (
          <div className="mt-4 space-y-4">
            <p className="text-lg font-bold leading-snug text-titulo">{servicio.nombre}</p>
            <p className="flex flex-wrap items-baseline gap-x-2 text-titulo">
              <span className="font-display text-3xl font-extrabold tracking-tight">{servicio.precio}</span>
              {servicio.unidad && <span className="text-sm text-muted">{servicio.unidad}</span>}
            </p>
            <div className="rounded-xl bg-noche p-4 text-white">
              <p className="font-bold">{servicio.grupo === "urgencia" ? "Cómo se cobra" : "Diagnóstico gratis al aceptar"}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/80">{servicio.diagnostico}</p>
            </div>
            <p className="text-sm leading-relaxed text-muted">{servicio.nota}</p>
          </div>
        ) : (
          <p className="mt-4 leading-relaxed text-ink">
            Elige un servicio y aquí verás su precio con IVA incluido y cómo se descuenta el diagnóstico.
          </p>
        )}
      </aside>
    </div>
  );
}
