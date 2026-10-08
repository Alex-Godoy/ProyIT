// Textos comerciales del home público que cambian seguido. Se editan aquí y
// se reflejan en todo el sitio.

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

// Dirección pública del portal para los enlaces de los correos. Es fija (no se
// toma de la petición) para que nadie pueda colar un enlace a otro dominio.
export const PORTAL_URL = process.env.PORTAL_URL || "https://portal-proyit.vercel.app";

export function enlaceWhatsApp(mensaje: string) {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

// Temas que el visitante puede elegir al pedir el diagnóstico. Los enlaces de
// "Qué resolvemos" abren el formulario con el tema ya seleccionado.
export const INTERESES = [
  "Agente de IA para WhatsApp",
  "Portal de clientes",
  "ProyContable",
  "Sitio o tienda online",
  "Dashboard operacional",
  "Auditoría de seguridad",
  "Soporte y continuidad",
  "Automatización a medida",
  "Aún no lo sé",
] as const;

export type Interes = (typeof INTERESES)[number];

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
