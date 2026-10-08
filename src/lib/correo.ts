// Envío de correos transaccionales con Resend (https://resend.com) por su API
// HTTPS, sin dependencias. Solo se usa en el servidor: RESEND_API_KEY no lleva
// el prefijo NEXT_PUBLIC_, así que nunca llega al navegador.
//
// Variables de entorno (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY    API key con permiso "Sending access" limitada a proyit.tech.
//   CORREO_REMITENTE  Opcional. Por defecto "ProyIT <avisos@proyit.tech>".
// Sin RESEND_API_KEY no se envía nada (útil en desarrollo).

const REMITENTE_POR_DEFECTO = "ProyIT <avisos@proyit.tech>";

type Correo = {
  para: string[];
  asunto: string;
  html: string;
  texto: string;
  responderA?: string;
  // Evita duplicados si el mismo aviso se intenta enviar dos veces.
  idempotencia?: string;
};

export async function enviarCorreo(correo: Correo): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[correo] RESEND_API_KEY no está configurada: no se envió", correo.asunto);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(correo.idempotencia ? { "Idempotency-Key": correo.idempotencia } : {}),
      },
      body: JSON.stringify({
        from: process.env.CORREO_REMITENTE || REMITENTE_POR_DEFECTO,
        to: correo.para,
        // Sin saltos de línea: el asunto incluye texto escrito por el visitante.
        subject: correo.asunto.replace(/[\r\n]+/g, " ").slice(0, 200),
        html: correo.html,
        text: correo.texto,
        ...(correo.responderA ? { reply_to: correo.responderA } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      // Solo el código y el mensaje del proveedor; nunca la API key ni el contenido.
      const detalle = await res.text().catch(() => "");
      console.error(`[correo] Resend respondió ${res.status}: ${detalle.slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[correo] No se pudo contactar a Resend:", e instanceof Error ? e.message : e);
    return false;
  }
}

// Todo texto que venga de un formulario pasa por aquí antes de ir al HTML.
export function escaparHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
