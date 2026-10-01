"use client";

import { createClient } from "@/lib/supabase/client";
import { BUCKET_TICKETS, MAX_ADJUNTOS, MAX_BYTES_ADJUNTO } from "@/lib/tickets";

export type ArchivoSubido = { nombre: string; storagePath: string; tamanoBytes: number; mimeType: string };

// Nombre seguro para la ruta en Storage; el nombre original se guarda aparte.
function nombreSeguro(nombre: string) {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(-100);
}

export function validarArchivos(archivos: File[]): string | null {
  if (archivos.length > MAX_ADJUNTOS) return `Puedes adjuntar hasta ${MAX_ADJUNTOS} archivos.`;
  const grande = archivos.find((a) => a.size > MAX_BYTES_ADJUNTO);
  if (grande) return `"${grande.name}" supera los 20 MB.`;
  return null;
}

// Sube los archivos directo desde el navegador al bucket privado del ticket.
// RLS de Storage solo deja subir a quien puede ver el ticket.
export async function subirArchivosTicket(ticketId: string, archivos: File[]) {
  const supabase = createClient();
  const subidos: ArchivoSubido[] = [];
  const fallidos: string[] = [];

  for (const archivo of archivos) {
    const ruta = `${ticketId}/${crypto.randomUUID()}-${nombreSeguro(archivo.name)}`;
    const { error } = await supabase.storage
      .from(BUCKET_TICKETS)
      .upload(ruta, archivo, { contentType: archivo.type || undefined });
    if (error) fallidos.push(archivo.name);
    else subidos.push({ nombre: archivo.name, storagePath: ruta, tamanoBytes: archivo.size, mimeType: archivo.type });
  }
  return { subidos, fallidos };
}
