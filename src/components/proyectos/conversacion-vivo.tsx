"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MAX_MENSAJE } from "@/lib/proyectos";
import { enviarMensajeAction, marcarMensajesLeidosAction } from "@/app/proyectos-acciones";
import { inputClase } from "@/components/admin/ui";

// Contenedor del hilo: baja al primer mensaje nuevo (o al final), marca lo
// visto como leído y recarga cuando llega un mensaje (Realtime) o cuando la
// pestaña vuelve a estar visible.
export function HiloEnVivo({
  proyectoId,
  ultimo,
  children,
}: {
  proyectoId: string;
  // created_at del último mensaje en pantalla.
  ultimo: string | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = caja.current;
    if (el) {
      const nuevos = el.querySelector<HTMLElement>("[data-nuevos]");
      // El contenedor es `relative`: offsetTop ya es relativo a él.
      el.scrollTop = nuevos ? nuevos.offsetTop - 8 : el.scrollHeight;
    }
    if (ultimo) void marcarMensajesLeidosAction(proyectoId, ultimo);
  }, [proyectoId, ultimo]);

  useEffect(() => {
    const supabase = createClient();
    const canal = supabase
      .channel(`proyecto-mensajes-${proyectoId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "proyecto_mensajes", filter: `proyecto_id=eq.${proyectoId}` },
        () => router.refresh(),
      )
      .subscribe();
    const alVolver = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      document.removeEventListener("visibilitychange", alVolver);
      void supabase.removeChannel(canal);
    };
  }, [proyectoId, router]);

  return (
    <div ref={caja} className="relative max-h-[28rem] overflow-y-auto overscroll-contain px-1 py-2">
      {children}
    </div>
  );
}

export function MensajeForm({ proyectoId, placeholder }: { proyectoId: string; placeholder: string }) {
  const router = useRouter();
  const [contenido, setContenido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar() {
    if (!contenido.trim() || enviando) return;
    setError(null);
    setEnviando(true);
    const res = await enviarMensajeAction(proyectoId, contenido);
    setEnviando(false);
    if (res.error) return setError(res.error);
    setContenido("");
    router.refresh();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void enviar();
      }}
      className="mt-3 border-t border-slate-100 pt-4"
    >
      <textarea
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            void enviar();
          }
        }}
        rows={3}
        maxLength={MAX_MENSAJE}
        placeholder={placeholder}
        aria-label="Mensaje"
        className={inputClase}
      />
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="hidden text-xs text-muted sm:block">Ctrl + Enter para enviar</p>
        <button
          type="submit"
          disabled={enviando || !contenido.trim()}
          className="ml-auto rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark disabled:opacity-60"
        >
          {enviando ? "Enviando…" : "Enviar"}
        </button>
      </div>
    </form>
  );
}
