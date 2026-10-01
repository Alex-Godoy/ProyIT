"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { registrarAdjuntosAction, responderTicketAction } from "@/app/tickets-acciones";
import { subirArchivosTicket, validarArchivos } from "@/components/tickets/adjuntos";
import SelectorArchivos from "@/components/tickets/selector-archivos";
import { inputClase } from "@/components/admin/ui";

export default function ResponderForm({ ticketId, puedeNotaInterna }: { ticketId: string; puedeNotaInterna: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [contenido, setContenido] = useState("");
  const [interno, setInterno] = useState(false);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const errorArchivos = validarArchivos(archivos);
    if (errorArchivos) return setError(errorArchivos);

    setEnviando(true);
    const res = await responderTicketAction(ticketId, contenido, interno);
    if ("error" in res) {
      setError(res.error);
      setEnviando(false);
      return;
    }
    if (archivos.length > 0) {
      const { subidos, fallidos } = await subirArchivosTicket(ticketId, archivos);
      const reg = await registrarAdjuntosAction(ticketId, res.mensajeId, subidos);
      if (fallidos.length > 0 || reg.error) setError("El mensaje se envió, pero algunos archivos no se pudieron adjuntar.");
    }
    setContenido("");
    setArchivos([]);
    setInterno(false);
    setEnviando(false);
    router.replace(`${pathname}?ok=mensaje_enviado`, { scroll: false });
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-3 rounded-2xl p-4 ring-1 sm:p-5 ${interno ? "bg-amber-50 ring-amber-200" : "bg-white ring-slate-200"}`}
    >
      {puedeNotaInterna && (
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-sm sm:inline-grid sm:w-80" role="tablist">
          {[
            { v: false, t: "Responder al cliente" },
            { v: true, t: "Nota interna" },
          ].map((o) => (
            <button
              key={o.t}
              type="button"
              role="tab"
              aria-selected={interno === o.v}
              onClick={() => setInterno(o.v)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                interno === o.v ? (o.v ? "bg-amber-400 text-ink" : "bg-white text-navy shadow-sm") : "text-muted"
              }`}
            >
              {o.t}
            </button>
          ))}
        </div>
      )}
      <textarea
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        required
        rows={4}
        maxLength={8000}
        placeholder={interno ? "Solo la ve el equipo de ProyIT." : "Escribe tu mensaje…"}
        aria-label={interno ? "Nota interna" : "Mensaje"}
        className={inputClase}
      />
      <SelectorArchivos archivos={archivos} onChange={setArchivos} disabled={enviando} />
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">{interno ? "🔒 El cliente no verá esta nota." : ""}</p>
        <button
          type="submit"
          disabled={enviando || !contenido.trim()}
          className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark disabled:opacity-60"
        >
          {enviando ? "Enviando…" : interno ? "Guardar nota" : "Enviar"}
        </button>
      </div>
    </form>
  );
}
