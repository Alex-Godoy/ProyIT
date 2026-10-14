// Textos comerciales del home público que cambian seguido. Se editan aquí y
// se reflejan en todo el sitio.

import { INTERES_URGENCIA, PLANES_SOPORTE, interesPlan } from "./soporte";

// Número de WhatsApp comercial en formato internacional sin "+" ni espacios
// (ej. "56912345678"), y cómo se muestra en el pie del home.
export const WHATSAPP_NUMERO = "56942874145";
export const WHATSAPP_VISIBLE = "+56 9 4287 4145";
// Mensaje con que parten los botones generales de WhatsApp.
export const MENSAJE_WHATSAPP = "Hola, vengo del sitio de ProyIT y quiero conversar sobre mi empresa.";

// Agenda pública para la primera conversación de 30 minutos.
export const AGENDA_URL = "https://cal.com/proyit/30min";

// Correo público de contacto: se ofrece cuando el formulario no se puede
// enviar (por ejemplo, si falla la verificación de seguridad).
export const CONTACTO_EMAIL = "contacto@proyit.tech";

// Quién recibe el aviso por correo de cada solicitud de diagnóstico. Se puede
// reemplazar sin tocar el código con la variable AVISOS_DIAGNOSTICO_PARA
// (varios correos separados por coma).
export const AVISOS_DIAGNOSTICO_PARA = ["alex.godoy@proyit.tech"];

// Quién recibe el aviso de cada ticket de soporte que abre un cliente. Se puede
// reemplazar con la variable AVISOS_SOPORTE_PARA (separados por coma).
export const AVISOS_SOPORTE_PARA = AVISOS_DIAGNOSTICO_PARA;

export function destinatarios(lista: string[], variable: string | undefined) {
  return (variable?.split(",") ?? lista).map((c) => c.trim()).filter(Boolean);
}

// Dirección pública del portal para los enlaces de los correos. Es fija (no se
// toma de la petición) para que nadie pueda colar un enlace a otro dominio.
export const PORTAL_URL = process.env.PORTAL_URL || "https://portal-proyit.vercel.app";

export function enlaceWhatsApp(mensaje: string) {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

// Botones de WhatsApp del sitio: la clave se guarda con cada clic y la
// etiqueta es lo que se ve en /admin/diagnosticos.
export const BOTONES_WHATSAPP = {
  menu: "Menú",
  "menu-movil": "Menú móvil",
  hero: "Hero",
  soporte: "Tarjeta Soporte TI",
  fundador: "Cupos fundadores",
  "problema-agente-ia": "Qué resolvemos · Agente de IA",
  "problema-soporte-ti": "Qué resolvemos · Soporte TI",
  "problema-automatizacion": "Qué resolvemos · Automatización",
  "problema-dashboard": "Qué resolvemos · Dashboard",
  "problema-portal-clientes": "Qué resolvemos · Portal de clientes",
  "problema-auditoria": "Qué resolvemos · Auditoría de seguridad",
  cierre: "Cierre",
  pie: "Pie de página",
  "soporte-empresas": "Soporte TI · empresas",
  "soporte-datos": "Soporte TI · protección de datos",
  reparaciones: "Reparaciones · personas",
} as const;
export type BotonWhatsApp = keyof typeof BOTONES_WHATSAPP;

// Planes, urgencias y reparaciones de soporte viven en lib/soporte.ts.
export { INTERES_URGENCIA, PLANES_SOPORTE, esInteresPlan, interesPlan } from "./soporte";

// Temas que el visitante puede elegir al pedir el diagnóstico. Los enlaces de
// "Qué resolvemos" abren el formulario con el tema ya seleccionado.
export const INTERESES = [
  INTERES_URGENCIA,
  ...PLANES_SOPORTE.map(interesPlan),
  "Agente de IA para WhatsApp",
  "Portal de clientes",
  "ProyContable",
  "Sitio o tienda online",
  "Dashboard operacional",
  "Auditoría de seguridad",
  "Soporte y continuidad",
  "Automatización a medida",
  "Aún no lo sé",
];


export const HORARIOS = [
  { valor: "manana", etiqueta: "Mañana" },
  { valor: "tarde", etiqueta: "Tarde" },
  { valor: "indistinto", etiqueta: "Me da igual" },
] as const;

export const ESTADOS_DIAGNOSTICO = [
  { valor: "nueva", etiqueta: "Nueva" },
  { valor: "contactada", etiqueta: "Contactada" },
  { valor: "agendada", etiqueta: "Agendada" },
  { valor: "descartada", etiqueta: "Descartada" },
] as const;
