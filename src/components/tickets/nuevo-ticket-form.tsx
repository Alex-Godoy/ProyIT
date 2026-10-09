"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRIORIDADES } from "@/lib/tickets";
import { crearTicketAction, registrarAdjuntosAction } from "@/app/tickets-acciones";
import { subirArchivosTicket, validarArchivos } from "@/components/tickets/adjuntos";
import SelectorArchivos from "@/components/tickets/selector-archivos";
import { inputClase, labelClase } from "@/components/admin/ui";

type Opcion = { id: string; nombre: string };

export default function NuevoTicketForm({
  clientes,
  proyectos,
  base,
}: {
  // Si el usuario tiene acceso a más de un cliente, elige a cuál corresponde.
  clientes: Opcion[];
  proyectos: (Opcion & { cliente_id: string })[];
  base: "/portal/tickets" | "/admin/tickets";
}) {
  const router = useRouter();
  const [clienteId, setClienteId] = useState(clientes.length === 1 ? clientes[0].id : "");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [prioridad, setPrioridad] = useState<string>("media");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proyectosDelCliente = proyectos.filter((p) => p.cliente_id === clienteId);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const errorArchivos = validarArchivos(archivos);
    if (errorArchivos) return setError(errorArchivos);

    setEnviando(true);
    const res = await crearTicketAction(new FormData(e.currentTarget));
    if ("error" in res) {
      setError(res.error);
      setEnviando(false);
      return;
    }

    // El ticket ya existe: si algún archivo falla, se puede volver a adjuntar
    // desde la conversación, así que igual se continúa.
    if (archivos.length > 0) {
      const { subidos } = await subirArchivosTicket(res.id, archivos);
      await registrarAdjuntosAction(res.id, null, subidos);
    }
    router.push(`${base}/${res.id}?ok=ticket_creado`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {clientes.length > 1 ? (
        <div>
          <label htmlFor="cliente_id" className={labelClase}>
            Cliente *
          </label>
          <select
            id="cliente_id"
            name="cliente_id"
            required
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className={inputClase}
          >
            <option value="" disabled>
              Elige el cliente…
            </option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input type="hidden" name="cliente_id" value={clienteId} />
      )}

      <div>
        <label htmlFor="asunto" className={labelClase}>
          Asunto *
        </label>
        <input
          id="asunto"
          name="asunto"
          required
          minLength={3}
          maxLength={200}
          placeholder="Ej: La cámara del acceso norte no graba"
          className={inputClase}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="proyecto_id" className={labelClase}>
            ¿Sobre qué proyecto?
          </label>
          <select id="proyecto_id" name="proyecto_id" defaultValue="" className={inputClase} disabled={!clienteId}>
            <option value="">Otro / soporte general</option>
            {proyectosDelCliente.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="prioridad" className={labelClase}>
            Urgencia
          </label>
          <select
            id="prioridad"
            name="prioridad"
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value)}
            aria-describedby="plazo-prioridad"
            className={inputClase}
          >
            {PRIORIDADES.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.etiqueta}
                {p.valor === "urgente" ? " — está detenida mi operación" : ""}
              </option>
            ))}
          </select>
          <p id="plazo-prioridad" className="mt-1.5 text-xs text-muted">
            Te responderemos en menos de {PRIORIDADES.find((p) => p.valor === prioridad)?.horas ?? 24} horas.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="descripcion" className={labelClase}>
          ¿Qué está pasando? *
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          required
          rows={6}
          maxLength={8000}
          placeholder="Cuéntanos qué ocurre, desde cuándo y qué intentaste. Si puedes, adjunta una foto o captura."
          className={inputClase}
        />
      </div>

      <SelectorArchivos archivos={archivos} onChange={setArchivos} disabled={enviando} />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end border-t border-slate-100 pt-5">
        <button
          type="submit"
          disabled={enviando || !clienteId}
          className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark disabled:opacity-60"
        >
          {enviando ? (archivos.length > 0 ? "Enviando y subiendo archivos…" : "Enviando…") : "Enviar ticket"}
        </button>
      </div>
    </form>
  );
}
