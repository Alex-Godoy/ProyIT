export const ETAPAS = [
  { valor: "planificacion", etiqueta: "Planificación", clase: "bg-slate-100 text-slate-700" },
  { valor: "en_ejecucion", etiqueta: "En ejecución", clase: "bg-brand-blue/10 text-navy" },
  { valor: "en_pruebas", etiqueta: "En pruebas", clase: "bg-amber-100 text-amber-800" },
  { valor: "entregado", etiqueta: "Entregado", clase: "bg-emerald-100 text-emerald-800" },
  { valor: "pausado", etiqueta: "Pausado", clase: "bg-brand-orange/10 text-brand-orange-dark" },
] as const;

export type Etapa = (typeof ETAPAS)[number]["valor"];

export function etapaInfo(valor: string) {
  return ETAPAS.find((e) => e.valor === valor) ?? ETAPAS[0];
}

export type Proyecto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  etapa: Etapa;
  avance: number;
  fecha_inicio: string | null;
  fecha_termino_estimada: string | null;
  cliente_id: string;
  updated_at: string;
};

export const COLUMNAS_PROYECTO =
  "id, nombre, descripcion, etapa, avance, fecha_inicio, fecha_termino_estimada, cliente_id, updated_at";

export type Hito = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_estimada: string | null;
  completado_at: string | null;
  orden: number;
};

export type Novedad = {
  id: string;
  contenido: string;
  created_at: string;
};

export type Documento = {
  id: string;
  nombre: string;
  storage_path: string;
  tamano_bytes: number | null;
  created_at: string;
};

export const BUCKET_DOCUMENTOS = "proyecto-documentos";

// Las columnas `date` llegan como "2026-10-15"; se formatean sin pasar por la
// zona horaria para que no se corran un día.
export function formatearFecha(fecha: string | null) {
  if (!fecha) return "Sin fecha";
  const [a, m, d] = fecha.slice(0, 10).split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatearFechaHora(fecha: string) {
  return new Date(fecha).toLocaleString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });
}

export function formatearTamano(bytes: number | null) {
  if (bytes == null) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
