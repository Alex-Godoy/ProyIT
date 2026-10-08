"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// Cloudflare Turnstile: captcha que Supabase Auth valida en el servidor
// (Authentication → Attack Protection). Si no hay site key configurada, no se
// muestra nada y el formulario funciona sin captcha (útil en desarrollo).
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type Turnstile = {
  render: (el: HTMLElement, opciones: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
    onTurnstileListo?: () => void;
  }
}

const SCRIPT_ID = "cf-turnstile";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileListo";

export type CaptchaHandle = { reset: () => void };

// Si Cloudflare no logra verificar a la persona (VPN, bloqueadores, navegador
// antiguo) o su script no carga, se avisa con onError para ofrecer otra salida.
const ESPERA_CARGA_MS = 15_000;

type Props = {
  onToken: (token: string | null) => void;
  onError?: () => void;
};

const Captcha = forwardRef<CaptchaHandle, Props>(function Captcha({ onToken, onError }, ref) {
  const contenedor = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Guarda los callbacks más recientes sin volver a montar el widget.
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useImperativeHandle(ref, () => ({
    // Cada token sirve una sola vez: se renueva después de cada intento.
    reset() {
      onTokenRef.current(null);
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;

    function montar() {
      if (!contenedor.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(contenedor.current, {
        sitekey: TURNSTILE_SITE_KEY,
        language: "es",
        theme: "light",
        // "flexible" exige 300 px de ancho; en pantallas angostas se usa el compacto
        // para que el formulario no se desborde.
        size: contenedor.current.clientWidth < 300 ? "compact" : "flexible",
        callback: (token: string) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(null),
        "error-callback": () => {
          onTokenRef.current(null);
          onErrorRef.current?.();
        },
        "unsupported-callback": () => onErrorRef.current?.(),
      });
    }

    // El script no cargó a tiempo (bloqueado o sin conexión con Cloudflare).
    const espera = window.setTimeout(() => {
      if (!window.turnstile) onErrorRef.current?.();
    }, ESPERA_CARGA_MS);

    if (window.turnstile) {
      montar();
    } else {
      window.onTurnstileListo = montar;
      if (!document.getElementById(SCRIPT_ID)) {
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.onerror = () => onErrorRef.current?.();
        document.head.appendChild(script);
      }
    }

    return () => {
      window.clearTimeout(espera);
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={contenedor} className="min-h-[65px]" aria-label="Verificación de seguridad" />;
});

export default Captcha;
