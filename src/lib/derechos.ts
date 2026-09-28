export const TIPOS_SOLICITUD = [
  { valor: "acceso", etiqueta: "Acceso", texto: "Saber qué datos tuyos tratamos y con quién los compartimos." },
  { valor: "rectificacion", etiqueta: "Rectificación", texto: "Corregir datos inexactos o incompletos." },
  { valor: "supresion", etiqueta: "Supresión", texto: "Eliminar tus datos y tu cuenta del portal." },
  { valor: "oposicion", etiqueta: "Oposición", texto: "Oponerte a un uso específico de tus datos." },
  { valor: "portabilidad", etiqueta: "Portabilidad", texto: "Recibir tus datos para llevarlos a otro proveedor." },
  { valor: "bloqueo", etiqueta: "Bloqueo", texto: "Suspender temporalmente el uso de tus datos." },
] as const;

export type TipoSolicitud = (typeof TIPOS_SOLICITUD)[number]["valor"];

export const ESTADOS_SOLICITUD = {
  recibida: { etiqueta: "Recibida", clase: "bg-amber-100 text-amber-800" },
  en_proceso: { etiqueta: "En proceso", clase: "bg-brand-blue/10 text-navy" },
  respondida: { etiqueta: "Respondida", clase: "bg-emerald-100 text-emerald-800" },
  rechazada: { etiqueta: "Rechazada", clase: "bg-slate-200 text-slate-700" },
} as const;

export type EstadoSolicitud = keyof typeof ESTADOS_SOLICITUD;

export type Solicitud = {
  id: string;
  email: string;
  tipo: TipoSolicitud;
  detalle: string | null;
  estado: EstadoSolicitud;
  respuesta: string | null;
  plazo_respuesta: string;
  respondida_at: string | null;
  created_at: string;
};

export const COLUMNAS_SOLICITUD =
  "id, email, tipo, detalle, estado, respuesta, plazo_respuesta, respondida_at, created_at";

export function etiquetaTipo(tipo: string) {
  return TIPOS_SOLICITUD.find((t) => t.valor === tipo)?.etiqueta ?? tipo;
}
