"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Captcha, { TURNSTILE_SITE_KEY, type CaptchaHandle } from "@/components/captcha";
import { solicitarDiagnosticoAction, type EstadoEnvio } from "@/app/diagnostico-acciones";
import { HORARIOS, INTERESES } from "@/lib/sitio";

type Modo = "diagnostico" | "conversacion";
type Apertura = { modo: Modo; origen: string; interes?: string };

const EVENTO = "proyit:agendar";

// Cualquier botón del home abre el formulario con este evento, así no hace
// falta envolver la página en un contexto de cliente.
export function abrirAgendar(detalle: Apertura) {
  window.dispatchEvent(new CustomEvent<Apertura>(EVENTO, { detail: detalle }));
}

const VARIANTES = {
  naranjo:
    "bg-brand-orange text-titulo hover:bg-[#ff8c3a] focus-visible:outline-brand-orange",
  contorno:
    "border border-white/25 text-white hover:border-white/50 hover:bg-white/5 focus-visible:outline-white",
} as const;

export function BotonAgendar({
  children,
  modo = "diagnostico",
  origen,
  interes,
  variante = "naranjo",
  className = "",
}: {
  children: React.ReactNode;
  modo?: Modo;
  origen: string;
  interes?: string;
  variante?: keyof typeof VARIANTES;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => abrirAgendar({ modo, origen, interes })}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 ${VARIANTES[variante]} ${className}`}
    >
      {children}
    </button>
  );
}

// Enlace de texto ("Portal de clientes →") que abre el formulario con el tema elegido.
export function EnlaceAgendar({ interes, children }: { interes: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => abrirAgendar({ modo: "diagnostico", origen: "que-resolvemos", interes })}
      className="text-left text-sm font-semibold text-navy hover:underline"
    >
      {children}
    </button>
  );
}

const campo =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-slate-400 focus:border-acento focus:ring-2 focus:ring-acento/20";
const etiqueta = "mb-1.5 block text-sm font-medium text-titulo";

function BotonEnviar({ bloqueado }: { bloqueado: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || bloqueado}
      className="inline-flex w-full items-center justify-center rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-titulo transition hover:bg-[#ff8c3a] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Enviando…" : "Enviar solicitud"}
    </button>
  );
}

export default function AgendarDialogo() {
  const dialogo = useRef<HTMLDialogElement>(null);
  const formulario = useRef<HTMLFormElement>(null);
  const captcha = useRef<CaptchaHandle>(null);
  const [apertura, setApertura] = useState<Apertura | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // Cambia en cada apertura para volver a montar el formulario limpio.
  const [vez, setVez] = useState(0);
  const [estado, enviar] = useActionState<EstadoEnvio, FormData>(solicitarDiagnosticoAction, null);
  // A qué apertura corresponde la última respuesta (evita mostrar una vieja).
  const [respuestaEn, setRespuestaEn] = useState<number | null>(null);

  useEffect(() => {
    function abrir(detalle: Apertura) {
      setApertura(detalle);
      setVez((v) => v + 1);
      dialogo.current?.showModal();
      document.documentElement.style.overflow = "hidden";
    }
    const alEvento = (e: Event) => abrir((e as CustomEvent<Apertura>).detail);
    // proyit.tech/#agendar abre el formulario directo (útil para compartir el enlace).
    const alHash = () => {
      if (window.location.hash === "#agendar") abrir({ modo: "diagnostico", origen: "enlace" });
    };
    window.addEventListener(EVENTO, alEvento);
    window.addEventListener("hashchange", alHash);
    alHash();
    return () => {
      window.removeEventListener(EVENTO, alEvento);
      window.removeEventListener("hashchange", alHash);
    };
  }, []);

  // Respuesta del servidor: éxito → confirmación; error → nuevo captcha.
  useEffect(() => {
    if (!estado) return;
    setRespuestaEn(vez);
    if (!estado.ok) captcha.current?.reset();
    // Solo reacciona a respuestas nuevas, no a cambios de apertura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  function cerrar() {
    dialogo.current?.close();
  }

  function alCerrar() {
    document.documentElement.style.overflow = "";
    setApertura(null);
    if (window.location.hash === "#agendar") history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  const actual = respuestaEn === vez ? estado : null;
  const enviado = actual?.ok === true;
  const errorVisible = actual && !actual.ok ? actual.error : null;
  const conversacion = apertura?.modo === "conversacion";

  return (
    <dialog
      ref={dialogo}
      onClose={alCerrar}
      onClick={(e) => {
        // Clic en el fondo oscuro (fuera de la tarjeta) cierra.
        if (e.target === dialogo.current) cerrar();
      }}
      aria-labelledby="agendar-titulo"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl bg-white p-0 text-ink shadow-2xl backdrop:bg-noche/70 backdrop:backdrop-blur-sm"
    >
      {apertura && (
        <div className="p-6 sm:p-8" key={vez}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-acento">
                {conversacion ? "Primera conversación · 30 min · sin costo" : "Diagnóstico ProyIT"}
              </p>
              <h2 id="agendar-titulo" className="mt-2 font-display text-2xl font-bold leading-tight text-titulo sm:text-3xl">
                {enviado
                  ? "¡Recibimos tu solicitud!"
                  : conversacion
                    ? "Partamos por entender qué te duele"
                    : "Agenda tu diagnóstico"}
              </h2>
            </div>
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar"
              className="-mr-2 -mt-1 rounded-full p-2 text-muted transition hover:bg-slate-100 hover:text-ink"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>

          {enviado ? (
            <div className="mt-4">
              <p className="text-muted">
                Te escribiremos a la brevedad para coordinar el día y la hora. Si vemos que podemos ayudarte, te
                proponemos el diagnóstico. Si no, te lo decimos.
              </p>
              <button
                type="button"
                onClick={cerrar}
                autoFocus
                className="mt-6 inline-flex rounded-full bg-noche px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy"
              >
                Volver al sitio
              </button>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted">
                Déjanos tus datos y te contactamos para coordinar. Toma menos de un minuto.
              </p>
              <form ref={formulario} action={enviar} className="mt-6 space-y-4">
                <input type="hidden" name="origen" value={apertura.origen} />
                <input type="hidden" name="captcha" value={captchaToken ?? ""} />
                {/* Campo trampa para bots: oculto a personas y lectores de pantalla. */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>
                    Sitio web
                    <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ag-nombre" className={etiqueta}>Nombre</label>
                    <input id="ag-nombre" name="nombre" required minLength={2} maxLength={120} autoComplete="name" autoFocus className={campo} />
                  </div>
                  <div>
                    <label htmlFor="ag-empresa" className={etiqueta}>
                      Empresa <span className="font-normal text-muted">(opcional)</span>
                    </label>
                    <input id="ag-empresa" name="empresa" maxLength={120} autoComplete="organization" className={campo} />
                  </div>
                  <div>
                    <label htmlFor="ag-email" className={etiqueta}>Correo</label>
                    <input id="ag-email" name="email" type="email" inputMode="email" required maxLength={200} autoComplete="email" placeholder="nombre@empresa.cl" className={campo} />
                  </div>
                  <div>
                    <label htmlFor="ag-telefono" className={etiqueta}>
                      WhatsApp o teléfono <span className="font-normal text-muted">(opcional)</span>
                    </label>
                    <input id="ag-telefono" name="telefono" type="tel" inputMode="tel" maxLength={40} autoComplete="tel" placeholder="+56 9 1234 5678" className={campo} />
                  </div>
                </div>

                <div>
                  <label htmlFor="ag-interes" className={etiqueta}>¿Qué te gustaría resolver?</label>
                  <select id="ag-interes" name="interes" defaultValue={apertura.interes ?? ""} className={campo}>
                    <option value="">Elige una opción</option>
                    {INTERESES.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="ag-mensaje" className={etiqueta}>
                    Cuéntanos qué te duele hoy <span className="font-normal text-muted">(opcional)</span>
                  </label>
                  <textarea
                    id="ag-mensaje"
                    name="mensaje"
                    rows={3}
                    maxLength={2000}
                    placeholder="Ej.: los pedidos llegan por WhatsApp y los anotamos a mano en una planilla."
                    className={`${campo} resize-y`}
                  />
                </div>

                <fieldset>
                  <legend className={etiqueta}>¿Cuándo te acomoda que conversemos?</legend>
                  <div className="flex flex-wrap gap-2">
                    {HORARIOS.map((h, i) => (
                      <label key={h.valor} className="cursor-pointer">
                        <input type="radio" name="horario" value={h.valor} defaultChecked={i === 2} className="peer sr-only" />
                        <span className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm text-ink transition peer-checked:border-noche peer-checked:bg-noche peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-acento/40">
                          {h.etiqueta}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="flex items-start gap-3 text-sm text-ink">
                  <input type="checkbox" name="privacidad" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#061e4a]" />
                  <span>
                    Acepto que ProyIT use estos datos solo para contactarme por esta solicitud, según la{" "}
                    <Link href="/privacidad" target="_blank" className="font-medium text-navy underline">
                      política de privacidad
                    </Link>
                    .
                  </span>
                </label>

                <Captcha ref={captcha} onToken={setCaptchaToken} />

                {errorVisible && (
                  <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorVisible}
                  </p>
                )}

                {TURNSTILE_SITE_KEY && !captchaToken && (
                  <p className="text-xs text-muted">Completa la verificación de seguridad para enviar.</p>
                )}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={cerrar}
                    className="rounded-full px-5 py-3 text-sm font-semibold text-muted transition hover:bg-slate-100 hover:text-ink"
                  >
                    Cancelar
                  </button>
                  <BotonEnviar bloqueado={Boolean(TURNSTILE_SITE_KEY) && !captchaToken} />
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}
