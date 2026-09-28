"use client";

import { useState } from "react";
import { REGIONES, normalizarRut, type Cliente, type TipoCliente } from "@/lib/clientes";
import { BotonEnviar, inputClase, labelClase } from "@/components/admin/ui";

export default function ClienteForm({
  action,
  cliente,
  notas,
  textoBoton,
}: {
  action: (fd: FormData) => Promise<void>;
  cliente?: Cliente;
  notas?: string | null;
  textoBoton: string;
}) {
  const [tipo, setTipo] = useState<TipoCliente>(cliente?.tipo ?? "empresa");
  const [rutError, setRutError] = useState<string | null>(null);
  const esEmpresa = tipo === "empresa";

  function revisarRut(e: React.FocusEvent<HTMLInputElement>) {
    const valor = e.target.value.trim();
    if (!valor) return setRutError(null);
    const rut = normalizarRut(valor);
    if (rut) {
      e.target.value = rut;
      setRutError(null);
    } else {
      setRutError("RUT inválido: revisa el dígito verificador.");
    }
  }

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="tipo" value={tipo} />

      {/* Tipo de cliente */}
      <fieldset>
        <legend className={labelClase}>Tipo de cliente</legend>
        <div className="mt-1 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 sm:inline-grid sm:w-72">
          {(["empresa", "persona"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              aria-pressed={tipo === t}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tipo === t ? "bg-white text-navy shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {t === "empresa" ? "Empresa" : "Persona"}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Identificación */}
      <section className="grid gap-5 sm:grid-cols-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted sm:col-span-2">Identificación</h3>
        <div className="sm:col-span-2">
          <label htmlFor="nombre" className={labelClase}>
            {esEmpresa ? "Razón social *" : "Nombre completo *"}
          </label>
          <input
            id="nombre"
            name="nombre"
            required
            defaultValue={cliente?.nombre}
            placeholder={esEmpresa ? "Ej: Inversiones del Sur SpA" : "Ej: María González Rojas"}
            className={inputClase}
          />
        </div>
        {esEmpresa && (
          <div>
            <label htmlFor="nombre_fantasia" className={labelClase}>
              Nombre de fantasía
            </label>
            <input
              id="nombre_fantasia"
              name="nombre_fantasia"
              defaultValue={cliente?.nombre_fantasia ?? ""}
              className={inputClase}
            />
          </div>
        )}
        <div>
          <label htmlFor="rut" className={labelClase}>
            RUT
          </label>
          <input
            id="rut"
            name="rut"
            defaultValue={cliente?.rut ?? ""}
            placeholder={esEmpresa ? "76.123.456-7" : "12.345.678-9"}
            onBlur={revisarRut}
            aria-invalid={!!rutError}
            aria-describedby="rut-ayuda"
            className={`${inputClase} ${rutError ? "border-red-400" : ""}`}
          />
          <p id="rut-ayuda" className={`mt-1 text-xs ${rutError ? "text-red-600" : "text-muted"}`}>
            {rutError ?? "Con o sin puntos; se valida el dígito verificador."}
          </p>
        </div>
        {esEmpresa && (
          <div className="sm:col-span-2">
            <label htmlFor="giro" className={labelClase}>
              Giro
            </label>
            <input id="giro" name="giro" defaultValue={cliente?.giro ?? ""} className={inputClase} />
          </div>
        )}
      </section>

      {/* Contacto */}
      <section className="grid gap-5 sm:grid-cols-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted sm:col-span-2">Contacto</h3>
        <div>
          <label htmlFor="email" className={labelClase}>
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={cliente?.email ?? ""}
            placeholder={esEmpresa ? "contacto@empresa.cl" : "persona@correo.cl"}
            className={inputClase}
          />
        </div>
        <div>
          <label htmlFor="telefono" className={labelClase}>
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            defaultValue={cliente?.telefono ?? ""}
            placeholder="+56 9 1234 5678"
            className={inputClase}
          />
        </div>
        {!cliente && (
          <label className="flex items-start gap-3 rounded-lg bg-surface p-3 text-sm sm:col-span-2">
            <input type="checkbox" name="dar_acceso" defaultChecked className="mt-0.5 h-4 w-4 accent-navy" />
            <span>
              <span className="font-medium text-ink">Dar acceso al portal con este correo</span>
              <span className="block text-muted">
                Cuando se registre con este correo, verá los proyectos de este cliente. Puedes agregar más correos después.
              </span>
            </span>
          </label>
        )}
      </section>

      {/* Dirección */}
      <section className="grid gap-5 sm:grid-cols-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted sm:col-span-2">Dirección</h3>
        <div className="sm:col-span-2">
          <label htmlFor="direccion" className={labelClase}>
            Dirección
          </label>
          <input id="direccion" name="direccion" defaultValue={cliente?.direccion ?? ""} className={inputClase} />
        </div>
        <div>
          <label htmlFor="comuna" className={labelClase}>
            Comuna
          </label>
          <input id="comuna" name="comuna" defaultValue={cliente?.comuna ?? ""} className={inputClase} />
        </div>
        <div>
          <label htmlFor="region" className={labelClase}>
            Región
          </label>
          <select id="region" name="region" defaultValue={cliente?.region ?? ""} className={inputClase}>
            <option value="">— Selecciona —</option>
            {REGIONES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Interno */}
      <section className="grid gap-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Uso interno</h3>
        <div>
          <label htmlFor="notas" className={labelClase}>
            Notas (solo las ves tú)
          </label>
          <textarea id="notas" name="notas" rows={3} defaultValue={notas ?? ""} className={inputClase} />
          <p className="mt-1 text-xs text-muted">
            Solo lo necesario para la relación comercial. No registres datos sensibles (salud, creencias, etc.).
          </p>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={cliente?.activo ?? true}
            className="h-4 w-4 accent-navy"
          />
          <span className="font-medium text-ink">Cliente activo</span>
        </label>
      </section>

      <div className="flex justify-end border-t border-slate-100 pt-5">
        <BotonEnviar>{textoBoton}</BotonEnviar>
      </div>
    </form>
  );
}
