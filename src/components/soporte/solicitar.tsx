"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Captcha, { TURNSTILE_SITE_KEY, type CaptchaHandle } from "@/components/captcha";
import { solicitarDiagnosticoAction, type EstadoEnvio } from "@/app/diagnostico-acciones";
import { SERVICIOS_SOPORTE, type ServicioSoporte } from "@/lib/soporte";
import { CONTACTO_EMAIL } from "@/lib/sitio";

// Formulario de /soporte (empresas) y /reparaciones (personas). Usa el mismo
// flujo que el formulario del home (solicitarDiagnosticoAction): la solicitud
// llega a "Contactos web" del panel y por correo, con el servicio como tema.

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

type Grupo = ServicioSoporte["grupo"];

const GRUPOS: { grupo: Grupo; etiqueta: string }[] = [
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
  "w-full rounded-xl border border-linea bg-white px-3.5 py-3 text-base text-tinta outline-none transition placeholder:text-slate-400 focus:border-navy focus:ring-2 focus:ring-navy/20";
const etiqueta = "mb-1.5 block text-sm font-semibold text-tinta";

function BotonEnviar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-full bg-navy px-7 py-4 text-base font-bold text-white transition hover:bg-marino disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Enviando…" : "Enviar solicitud"}
    </button>
  );
}

export default function SolicitarServicio({
  grupos,
  origen,
  ejemplo,
}: {
  grupos: Grupo[];
  origen: string;
  ejemplo: string; // placeholder de "Cuéntanos qué pasa"
}) {
  const paraEmpresas = grupos.includes("empresas");
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
          <div role="status" className="rounded-[18px] bg-niebla/60 p-6 sm:p-7">
            <p className="font-display text-xl font-bold text-tinta sm:text-2xl">¡Gracias! Recibimos tu solicitud.</p>
            <p className="mt-2 leading-relaxed text-gris">
              {servicio ? `Servicio: ${servicio.nombre}. ` : ""}Te escribiremos por WhatsApp para coordinar. También te
              enviamos una confirmación por correo.
            </p>
            <button
              type="button"
              onClick={otraSolicitud}
              className="mt-5 inline-flex rounded-full border-2 border-navy bg-white px-5 py-2.5 text-sm font-bold text-navy transition hover:bg-navy hover:text-white"
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
            <input type="hidden" name="origen" value={origen} />
            <input type="hidden" name="interes" value={servicio?.interes ?? ""} />
            <input type="hidden" name="captcha" value={captchaToken ?? ""} />
            {/* Campo trampa para bots: oculto a personas y lectores de pantalla. El
                estilo va en línea para que no se vea aunque la hoja de estilos
                no cargue. */}
            <div
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}
            >
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
                {GRUPOS.filter((g) => grupos.includes(g.grupo)).map((g) => (
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
              {paraEmpresas && (
                <div>
                  <label htmlFor="sp-empresa" className={etiqueta}>
                    Empresa
                  </label>
                  <input id="sp-empresa" name="empresa" maxLength={120} autoComplete="organization" className={campo} />
                </div>
              )}
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
                placeholder={ejemplo}
                className={`${campo} resize-y`}
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-snug text-gris">
              <input type="checkbox" name="privacidad" required className="mt-0.5 h-5 w-5 shrink-0 accent-[#06347a]" />
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

      <aside className="rounded-[18px] border border-linea bg-white p-6 sm:p-7" aria-live="polite">
        <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-ceja">Tu solicitud</p>
        {servicio ? (
          <div className="mt-4 space-y-4">
            <p className="text-lg font-bold leading-snug text-tinta">{servicio.nombre}</p>
            <p className="flex flex-wrap items-baseline gap-x-2 text-tinta">
              <span className="font-display text-3xl font-extrabold tracking-tight">{servicio.precio}</span>
              {servicio.unidad && <span className="text-sm text-gris">{servicio.unidad}</span>}
            </p>
            <div className="rounded-xl bg-marino p-4 text-white">
              <p className="font-bold">{servicio.grupo === "urgencia" ? "Cómo se cobra" : "Cómo se abona el diagnóstico"}</p>
              <p className="mt-1 text-sm leading-relaxed text-niebla">{servicio.diagnostico}</p>
            </div>
            <p className="text-sm leading-relaxed text-gris">{servicio.nota}</p>
          </div>
        ) : (
          <p className="mt-4 leading-relaxed text-gris">
            Elige un servicio y aquí verás su precio con IVA incluido y cómo se abona el diagnóstico.
          </p>
        )}
      </aside>
    </div>
  );
}
