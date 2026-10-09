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

// Plantilla de los avisos de tickets: todo lo variable se escapa aquí, así
// cada aviso solo arma sus textos.
export type Aviso = {
  ceja: string;
  titulo: string;
  parrafos: string[];
  filas?: [string, string][];
  cita?: { etiqueta: string; texto: string };
  boton: { texto: string; url: string };
  pie: string;
  urgente?: boolean;
};

export function armarAviso(a: Aviso): { html: string; texto: string } {
  const e = escaparHtml;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#0f1c2e;max-width:560px">
  <p style="margin:0 0 4px;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${a.urgente ? "#b34700" : "#1f6aa8"}">${e(a.ceja)}</p>
  <h1 style="margin:0 0 16px;font-size:20px">${e(a.titulo)}</h1>
  ${a.parrafos.map((p) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.6">${e(p)}</p>`).join("")}
  ${
    a.filas?.length
      ? `<table style="border-collapse:collapse;width:100%;font-size:14px">${a.filas
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 12px 6px 0;color:#5b6b80;white-space:nowrap;vertical-align:top">${e(k)}</td><td style="padding:6px 0">${e(v)}</td></tr>`,
          )
          .join("")}</table>`
      : ""
  }
  ${a.cita ? `<p style="margin:16px 0 4px;color:#5b6b80;font-size:13px">${e(a.cita.etiqueta)}</p><p style="margin:0;padding:12px;background:#f4f7fb;border-radius:8px;font-size:14px;white-space:pre-line">${e(a.cita.texto)}</p>` : ""}
  <p style="margin:24px 0"><a href="${e(a.boton.url)}" style="display:inline-block;background:#061e4a;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px;font-weight:bold">${e(a.boton.texto)}</a></p>
  <p style="margin:0;color:#5b6b80;font-size:12px">${e(a.pie)}</p>
</div>`;
  const texto = [
    a.ceja,
    "",
    a.titulo,
    "",
    ...a.parrafos,
    ...(a.filas?.length ? ["", ...a.filas.map(([k, v]) => `${k}: ${v}`)] : []),
    ...(a.cita ? ["", `${a.cita.etiqueta}:`, a.cita.texto] : []),
    "",
    `${a.boton.texto}: ${a.boton.url}`,
    "",
    a.pie,
  ].join("\n");
  return { html, texto };
}
