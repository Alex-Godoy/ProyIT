// Textos comerciales del home público que cambian seguido. Se editan aquí y
// se reflejan en todo el sitio.

import { INTERES_URGENCIA, PLANES_SOPORTE, interesPlan } from "./soporte";

export const DIAGNOSTICO = {
  // Lo que cuesta el diagnóstico, tal como se muestra ("$490.000 + IVA").
  precio: "[PRECIO]",
  // Duración del diagnóstico en semanas ("2", "2 a 3").
  semanas: "[X]",
};

// Número de WhatsApp comercial en formato internacional sin "+" ni espacios
// (ej. "56912345678"). Vacío = el botón "Escribir por WhatsApp" no se muestra.
export const WHATSAPP_NUMERO = "";

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
