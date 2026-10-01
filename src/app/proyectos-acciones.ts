"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermiso } from "@/lib/auth";
import { BUCKET_DOCUMENTOS, ETAPAS } from "@/lib/proyectos";
import type { CodigoMensaje, CodigoOk } from "@/lib/mensajes";

// Acciones sobre el contenido de un proyecto, compartidas por el panel del
// super usuario (/admin) y el del equipo (/equipo). Cada una exige el permiso
// del cargo (lib/permisos) y RLS lo vuelve a exigir en la base de datos.

const BASES = ["/admin/proyectos", "/equipo/proyectos"] as const;
type Base = (typeof BASES)[number];
type Pestana = "resumen" | "hitos" | "documentos" | "bitacora";

function base(valor: string): Base {
  return (BASES as readonly string[]).includes(valor) ? (valor as Base) : "/equipo/proyectos";
}

function texto(fd: FormData, campo: string, max = 2000) {
  const v = fd.get(campo);
  return typeof v === "string" && v.trim() !== "" ? v.trim().slice(0, max) : null;
}

function refrescar(proyectoId: string) {
  for (const b of BASES) revalidatePath(`${b}/${proyectoId}`);
  revalidatePath("/admin", "layout");
  revalidatePath("/equipo", "layout");
  revalidatePath(`/portal/proyectos/${proyectoId}`);
  revalidatePath("/portal/proyectos");
}

function volver(
  b: string,
  proyectoId: string,
  tab: Pestana,
  resultado: { ok: CodigoOk } | { error: CodigoMensaje },
): never {
  const q = "ok" in resultado ? `ok=${resultado.ok}` : `error=${resultado.error}`;
  redirect(`${base(b)}/${proyectoId}?tab=${tab}&${q}`);
}

// ---------------------------------------------------------------------------
// Avance y etapa (jefe de proyecto y super usuario)
// ---------------------------------------------------------------------------

export async function actualizarAvanceAction(b: string, proyectoId: string, fd: FormData) {
  const { supabase } = await requirePermiso(proyectoId, "avance_editar");
  const etapa = texto(fd, "etapa");
  const avance = Math.round(Number(texto(fd, "avance") ?? NaN));
  if (!etapa || !ETAPAS.some((e) => e.valor === etapa) || !Number.isFinite(avance) || avance < 0 || avance > 100) {
    volver(b, proyectoId, "resumen", { error: "avance_invalido" });
  }
  const { error } = await supabase.from("proyectos").update({ etapa, avance }).eq("id", proyectoId);
  if (error) volver(b, proyectoId, "resumen", { error: "cambios_no_guardados" });
  refrescar(proyectoId);
  volver(b, proyectoId, "resumen", { ok: "avance_guardado" });
}

// ---------------------------------------------------------------------------
// Hitos
// ---------------------------------------------------------------------------

export async function crearHitoAction(b: string, proyectoId: string, fd: FormData) {
  const { supabase } = await requirePermiso(proyectoId, "hito_editar");
  const titulo = texto(fd, "titulo", 200);
  if (!titulo) volver(b, proyectoId, "hitos", { error: "hito_sin_titulo" });

  const { count } = await supabase
    .from("proyecto_hitos")
    .select("id", { count: "exact", head: true })
    .eq("proyecto_id", proyectoId);

  const { error } = await supabase.from("proyecto_hitos").insert({
    proyecto_id: proyectoId,
    titulo,
    descripcion: texto(fd, "descripcion", 500),
    fecha_estimada: texto(fd, "fecha_estimada", 10),
    orden: (count ?? 0) + 1,
  });
  if (error) volver(b, proyectoId, "hitos", { error: "hito_no_agregado" });
  refrescar(proyectoId);
  volver(b, proyectoId, "hitos", { ok: "hito_agregado" });
}

export async function actualizarHitoAction(b: string, proyectoId: string, hitoId: string, fd: FormData) {
  const { supabase } = await requirePermiso(proyectoId, "hito_editar");
  const titulo = texto(fd, "titulo", 200);
  if (!titulo) volver(b, proyectoId, "hitos", { error: "hito_sin_titulo" });

  const { error } = await supabase
    .from("proyecto_hitos")
    .update({
      titulo,
      descripcion: texto(fd, "descripcion", 500),
      fecha_estimada: texto(fd, "fecha_estimada", 10),
    })
    .eq("id", hitoId)
    .eq("proyecto_id", proyectoId);
  if (error) volver(b, proyectoId, "hitos", { error: "cambios_no_guardados" });
  refrescar(proyectoId);
  volver(b, proyectoId, "hitos", { ok: "hito_actualizado" });
}

export async function alternarHitoAction(b: string, proyectoId: string, hitoId: string, completado: boolean) {
  const { supabase } = await requirePermiso(proyectoId, "hito_completar");
  const { error } = await supabase
    .from("proyecto_hitos")
    .update({ completado_at: completado ? null : new Date().toISOString() })
    .eq("id", hitoId)
    .eq("proyecto_id", proyectoId);
  if (error) volver(b, proyectoId, "hitos", { error: "cambios_no_guardados" });
  refrescar(proyectoId);
  volver(b, proyectoId, "hitos", { ok: completado ? "hito_pendiente" : "hito_completado" });
}

export async function eliminarHitoAction(b: string, proyectoId: string, hitoId: string) {
  const { supabase } = await requirePermiso(proyectoId, "eliminar");
  await supabase.from("proyecto_hitos").delete().eq("id", hitoId).eq("proyecto_id", proyectoId);
  refrescar(proyectoId);
  volver(b, proyectoId, "hitos", { ok: "hito_eliminado" });
}

// ---------------------------------------------------------------------------
// Bitácora
// ---------------------------------------------------------------------------

export async function crearNovedadAction(b: string, proyectoId: string, fd: FormData) {
  const { supabase, user } = await requirePermiso(proyectoId, "novedad_publicar");
  const contenido = texto(fd, "contenido", 4000);
  if (!contenido) volver(b, proyectoId, "bitacora", { error: "novedad_vacia" });

  const { error } = await supabase
    .from("proyecto_novedades")
    .insert({ proyecto_id: proyectoId, autor_id: user.id, contenido });
  if (error) volver(b, proyectoId, "bitacora", { error: "novedad_no_publicada" });
  refrescar(proyectoId);
  volver(b, proyectoId, "bitacora", { ok: "novedad_publicada" });
}

export async function eliminarNovedadAction(b: string, proyectoId: string, novedadId: string) {
  const { supabase } = await requirePermiso(proyectoId, "eliminar");
  await supabase.from("proyecto_novedades").delete().eq("id", novedadId).eq("proyecto_id", proyectoId);
  refrescar(proyectoId);
  volver(b, proyectoId, "bitacora", { ok: "novedad_eliminada" });
}

// ---------------------------------------------------------------------------
// Documentos (el archivo lo sube el navegador directo a Storage; aquí solo
// se registra, para no pasar archivos grandes por la función del servidor)
// ---------------------------------------------------------------------------

export async function registrarDocumentoAction(
  proyectoId: string,
  doc: { nombre: string; storagePath: string; tamanoBytes: number; mimeType: string },
) {
  const { supabase } = await requirePermiso(proyectoId, "documento_subir");
  if (!doc.storagePath.startsWith(`${proyectoId}/`)) return { error: "Ruta de archivo inválida." };

  const { error } = await supabase.from("proyecto_documentos").insert({
    proyecto_id: proyectoId,
    nombre: doc.nombre.slice(0, 200),
    storage_path: doc.storagePath,
    tamano_bytes: doc.tamanoBytes,
    mime_type: doc.mimeType || null,
  });
  if (error) {
    await supabase.storage.from(BUCKET_DOCUMENTOS).remove([doc.storagePath]);
    return { error: "No se pudo registrar el documento." };
  }
  refrescar(proyectoId);
  return { error: null };
}

export async function eliminarDocumentoAction(b: string, proyectoId: string, documentoId: string) {
  const { supabase } = await requirePermiso(proyectoId, "eliminar");
  // La ruta del archivo se lee de la base de datos, no del formulario.
  const { data: doc } = await supabase
    .from("proyecto_documentos")
    .select("storage_path")
    .eq("id", documentoId)
    .eq("proyecto_id", proyectoId)
    .maybeSingle<{ storage_path: string }>();
  if (doc) {
    await supabase.storage.from(BUCKET_DOCUMENTOS).remove([doc.storage_path]);
    await supabase.from("proyecto_documentos").delete().eq("id", documentoId);
  }
  refrescar(proyectoId);
  volver(b, proyectoId, "documentos", { ok: "documento_eliminado" });
}
