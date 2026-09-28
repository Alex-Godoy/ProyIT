"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Tiempo total de inactividad antes de cerrar sesión, y cuánto antes se
// muestra el aviso "¿Sigues ahí?". El panel admin usa un límite más corto.
const WARNING_DURATION_MS = 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;
const STORAGE_KEY = "proyit:lastActivity";
// No escribir en localStorage más de una vez cada 5 s (mousemove dispara mucho).
const THROTTLE_MS = 5000;

export default function InactivityLogout({ minutos }: { minutos: number }) {
  const limiteMs = minutos * 60 * 1000;
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const ultimaEscritura = useRef(0);

  const recordActivity = useCallback((forzar = false) => {
    const ahora = Date.now();
    if (!forzar && ahora - ultimaEscritura.current < THROTTLE_MS) return;
    ultimaEscritura.current = ahora;
    try {
      localStorage.setItem(STORAGE_KEY, String(ahora));
    } catch {
      // localStorage puede fallar en modo privado; el timer sigue
      // funcionando solo dentro de esta pestaña.
    }
    setSecondsLeft(null);
  }, []);

  useEffect(() => {
    let loggedOut = false;
    recordActivity(true);
    const onActivity = () => recordActivity();

    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }));

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setSecondsLeft(null);
    }
    window.addEventListener("storage", handleStorage);

    const interval = setInterval(() => {
      if (loggedOut) return;

      let lastActivity = ultimaEscritura.current || Date.now();
      try {
        lastActivity = Number(localStorage.getItem(STORAGE_KEY)) || lastActivity;
      } catch {
        // sin localStorage se usa la actividad de esta pestaña
      }

      const remaining = limiteMs - (Date.now() - lastActivity);

      if (remaining <= 0) {
        loggedOut = true;
        setSecondsLeft(null);
        fetch("/auth/signout", { method: "POST", redirect: "manual" }).finally(() => {
          window.location.href = "/login?motivo=inactividad";
        });
      } else if (remaining <= WARNING_DURATION_MS) {
        setSecondsLeft(Math.ceil(remaining / 1000));
      } else {
        setSecondsLeft(null);
      }
    }, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity));
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [recordActivity, limiteMs]);

  if (secondsLeft === null) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="inactividad-titulo"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="inactividad-titulo" className="text-lg font-semibold text-navy">
          ¿Sigues ahí?
        </h2>
        <p className="mt-2 text-sm text-muted">
          Por seguridad, tu sesión se cerrará en {secondsLeft} {secondsLeft === 1 ? "segundo" : "segundos"} por
          inactividad.
        </p>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => recordActivity(true)}
            autoFocus
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-dark"
          >
            Seguir conectado
          </button>
        </div>
      </div>
    </div>
  );
}
