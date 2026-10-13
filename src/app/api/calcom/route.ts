import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

// Webhook de Cal.com: cada reserva, cambio de hora o cancelación de la
// "Reunión de 30 min" queda en /admin/diagnosticos. Se configura en Cal.com
// (Configuración → Desarrollador → Webhooks) con esta URL y el mismo secreto
// que la variable CALCOM_WEBHOOK_SECRET.

const EVENTOS = new Set(["BOOKING_CREATED", "BOOKING_RESCHEDULED", "BOOKING_CANCELLED"]);

type Respuesta = { value?: unknown } | undefined;
type Reserva = {
  uid?: string;
  rescheduleUid?: string;
  startTime?: string;
  additionalNotes?: string;
  attendees?: { name?: string; email?: string; phoneNumber?: string | null }[];
  responses?: Record<string, Respuesta>;
};

function firmaValida(cuerpo: string, firma: string | null, secreto: string) {
  if (!firma) return false;
  const esperada = createHmac("sha256", secreto).update(cuerpo).digest();
  const recibida = Buffer.from(firma, /^[0-9a-f]+$/i.test(firma) ? "hex" : "base64");
  return recibida.length === esperada.length && timingSafeEqual(recibida, esperada);
}

function respuesta(r: Reserva, campo: string) {
  const v = r.responses?.[campo]?.value;
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

export async function POST(request: Request) {
  const secreto = process.env.CALCOM_WEBHOOK_SECRET;
  if (!secreto) return Response.json({ error: "Webhook sin configurar" }, { status: 503 });

  const cuerpo = await request.text();
  if (!firmaValida(cuerpo, request.headers.get("x-cal-signature-256"), secreto))
    return Response.json({ error: "Firma inválida" }, { status: 401 });

  let evento: { triggerEvent?: string; payload?: Reserva };
  try {
    evento = JSON.parse(cuerpo);
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }
  // El "ping" de prueba de Cal.com y los eventos que no usamos se aceptan sin más.
  const tipo = evento.triggerEvent ?? "";
  const reserva = evento.payload;
  if (!EVENTOS.has(tipo) || !reserva?.uid) return Response.json({ ok: true });

  const asistente = reserva.attendees?.[0];
  const notas = respuesta(reserva, "notes") ?? reserva.additionalNotes?.trim() ?? null;
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { error } = await supabase.rpc("registrar_reserva_calcom", {
    p_secreto: secreto,
    p_evento: tipo,
    p_uid: reserva.uid,
    p_uid_anterior: reserva.rescheduleUid ?? null,
    p_nombre: respuesta(reserva, "name") ?? asistente?.name ?? null,
    p_email: respuesta(reserva, "email") ?? asistente?.email ?? null,
    p_telefono: respuesta(reserva, "attendeePhoneNumber") ?? asistente?.phoneNumber ?? null,
    p_mensaje: notas || null,
    p_inicio: reserva.startTime ?? null,
  });
  if (error) {
    console.error("Webhook Cal.com:", error.message);
    return Response.json({ error: "No se pudo registrar" }, { status: 500 });
  }

  revalidatePath("/admin/diagnosticos");
  return Response.json({ ok: true });
}
