import { ETAPAS, type Proyecto } from "@/lib/proyectos";
import { TIPOS_CLIENTE, nombreVisible, type Cliente } from "@/lib/clientes";
import { BotonEnviar, inputClase, labelClase } from "@/components/admin/ui";

export type OpcionCliente = Pick<Cliente, "id" | "tipo" | "nombre" | "nombre_fantasia" | "activo">;

export default function ProyectoForm({
  action,
  proyecto,
  clientes,
  clienteInicial,
  textoBoton,
}: {
  action: (fd: FormData) => Promise<void>;
  proyecto?: Proyecto;
  clientes: OpcionCliente[];
  clienteInicial?: string;
  textoBoton: string;
}) {
  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="nombre" className={labelClase}>
          Nombre del proyecto *
        </label>
        <input id="nombre" name="nombre" required defaultValue={proyecto?.nombre} className={inputClase} />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="descripcion" className={labelClase}>
          Descripción (la ve el cliente)
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          defaultValue={proyecto?.descripcion ?? ""}
          className={inputClase}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="cliente_id" className={labelClase}>
          Cliente *
        </label>
        <select
          id="cliente_id"
          name="cliente_id"
          required
          defaultValue={proyecto?.cliente_id ?? clienteInicial ?? ""}
          className={inputClase}
        >
          <option value="" disabled>
            Elige un cliente…
          </option>
          {TIPOS_CLIENTE.map((t) => {
            const grupo = clientes.filter((c) => c.tipo === t.valor);
            return (
              grupo.length > 0 && (
                <optgroup key={t.valor} label={t.valor === "empresa" ? "Empresas" : "Personas"}>
                  {grupo.map((c) => (
                    <option key={c.id} value={c.id}>
                      {nombreVisible(c)}
                      {c.activo ? "" : " (inactivo)"}
                    </option>
                  ))}
                </optgroup>
              )
            );
          })}
        </select>
        <p className="mt-1 text-xs text-muted">Todas las personas con acceso a este cliente verán el proyecto.</p>
      </div>

      <div>
        <label htmlFor="etapa" className={labelClase}>
          Etapa
        </label>
        <select id="etapa" name="etapa" defaultValue={proyecto?.etapa ?? "planificacion"} className={inputClase}>
          {ETAPAS.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="avance" className={labelClase}>
          Avance (%)
        </label>
        <input
          id="avance"
          name="avance"
          type="number"
          min={0}
          max={100}
          step={5}
          defaultValue={proyecto?.avance ?? 0}
          className={inputClase}
        />
      </div>

      <div>
        <label htmlFor="fecha_inicio" className={labelClase}>
          Fecha de inicio
        </label>
        <input
          id="fecha_inicio"
          name="fecha_inicio"
          type="date"
          defaultValue={proyecto?.fecha_inicio ?? ""}
          className={inputClase}
        />
      </div>

      <div>
        <label htmlFor="fecha_termino_estimada" className={labelClase}>
          Término estimado
        </label>
        <input
          id="fecha_termino_estimada"
          name="fecha_termino_estimada"
          type="date"
          defaultValue={proyecto?.fecha_termino_estimada ?? ""}
          className={inputClase}
        />
      </div>

      <div className="sm:col-span-2">
        <BotonEnviar>{textoBoton}</BotonEnviar>
      </div>
    </form>
  );
}
