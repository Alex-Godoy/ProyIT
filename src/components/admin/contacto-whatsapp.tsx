"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { registrarContactoWhatsAppAction } from "@/app/diagnostico-acciones";
import { INTERESES } from "@/lib/sitio";
import { BotonEnviar, inputClase, labelClase } from "./ui";

// Formulario plegable para cargar en segundos a quien escribió por WhatsApp.
export default function ContactoWhatsApp() {
  const [estado, enviar] = useActionState(registrarContactoWhatsAppAction, null);
  const [abierto, setAbierto] = useState(false);
  const formulario = useRef<HTMLFormElement>(null);

  // Tras guardar, se limpia para cargar el siguiente.
  useEffect(() => {
    if (estado?.ok) formulario.current?.reset();
  }, [estado]);

  return (
    <details
      open={abierto}
      onToggle={(e) => setAbierto(e.currentTarget.open)}
      className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6"
    >
      <summary className="cursor-pointer font-semibold text-navy">+ Registrar contacto de WhatsApp</summary>
      <form ref={formulario} action={enviar} className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="wa-nombre" className={labelClase}>
            Nombre *
          </label>
          <input id="wa-nombre" name="nombre" required minLength={2} maxLength={120} className={inputClase} />
        </div>
        <div>
          <label htmlFor="wa-telefono" className={labelClase}>
            WhatsApp *
          </label>
          <input
            id="wa-telefono"
            name="telefono"
            type="tel"
            required
            maxLength={40}
            placeholder="+56 9 1234 5678"
            className={inputClase}
          />
        </div>
        <div>
          <label htmlFor="wa-empresa" className={labelClase}>
            Empresa
          </label>
          <input id="wa-empresa" name="empresa" maxLength={120} className={inputClase} />
        </div>
        <div>
          <label htmlFor="wa-email" className={labelClase}>
            Correo
          </label>
          <input id="wa-email" name="email" type="email" maxLength={200} className={inputClase} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="wa-interes" className={labelClase}>
            Le interesa
          </label>
          <select id="wa-interes" name="interes" defaultValue="" className={inputClase}>
            <option value="">Sin definir</option>
            {INTERESES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="wa-mensaje" className={labelClase}>
            Qué escribió
          </label>
          <textarea id="wa-mensaje" name="mensaje" rows={3} maxLength={2000} className={inputClase} />
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <BotonEnviar>Guardar contacto</BotonEnviar>
          {estado?.ok && <p className="text-sm font-medium text-emerald-700">Contacto guardado.</p>}
          {estado?.error && (
            <p role="alert" className="text-sm text-red-700">
              {estado.error}
            </p>
          )}
        </div>
      </form>
    </details>
  );
}
