"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { BUCKET_DOCUMENTOS, ETAPAS } from "@/lib/proyectos";
import { REGIONES, normalizarRut } from "@/lib/clientes";
import type { CodigoMensaje } from "@/lib/mensajes";

// Todas las acciones validan el rol admin aquí y, además, RLS lo vuelve a
// exigir en la base de datos.

function texto(fd: FormData, campo: string) {
  const v = fd.get(campo);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

function volver(path: string, error?: CodigoMensaje): never {
  redirect(error ? `${path}?error=${error}` : path);
}

function datosProyecto(fd: FormData) {
  const etapa = texto(fd, "etapa") ?? "planificacion";
  const avance = Math.round(Number(texto(fd, "avance") ?? 0));
  return {
    nombre: texto(fd, "nombre"),
    descripcion: texto(fd, "descripcion"),
    cliente_id: texto(fd, "cliente_id"),
    etapa: ETAPAS.some((e) => e.valor === etapa) ? etapa : "planificacion",
    avance: Number.isFinite(avance) ? Math.min(100, Math.max(0, avance)) : 0,
    fecha_inicio: texto(fd, "fecha_inicio"),
    fecha_termino_estimada: texto(fd, "fecha_termino_estimada"),
  };
}

function validarProyecto(datos: ReturnType<typeof datosProyecto>): CodigoMensaje | null {
  if (!datos.nombre) return "proyecto_sin_nombre";
  if (!datos.cliente_id) return "proyecto_sin_cliente";
  return null;
}

async function tocarProyecto(proyectoId: string) {
  const { supabase } = await requireAdmin();
  // El trigger actualiza updated_at: así el cliente ve cuándo hubo novedades.
  await supabase.from("proyectos").update({ updated_at: new Date().toISOString() }).eq("id", proyectoId);
  revalidatePath(`/admin/proyectos/${proyectoId}`);
  revalidatePath(`/portal/proyectos/${proyectoId}`);
  revalidatePath("/portal/proyectos");
}

// ---------------------------------------------------------------------------
// Proyectos
// ---------------------------------------------------------------------------

export async function crearProyectoAction(fd: FormData) {
  const { supabase } = await requireAdmin();
  const datos = datosProyecto(fd);
  const error = validarProyecto(datos);
  if (error) volver("/admin/proyectos/nuevo", error);

  const { data, error: dbError } = await supabase.from("proyectos").insert(datos).select("id").single();
  if (dbError || !data) volver("/admin/proyectos/nuevo", "proyecto_no_creado");

  revalidatePath("/admin/proyectos");
  redirect(`/admin/proyectos/${data.id}`);
}

export async function actualizarProyectoAction(proyectoId: string, fd: FormData) {
  const { supabase } = await requireAdmin();
  const path = `/admin/proyectos/${proyectoId}`;
  const datos = datosProyecto(fd);
  const error = validarProyecto(datos);
  if (error) volver(path, error);

  const { error: dbError } = await supabase.from("proyectos").update(datos).eq("id", proyectoId);
  if (dbError) volver(path, "cambios_no_guardados");

  revalidatePath("/admin/proyectos");
  revalidatePath(`/portal/proyectos/${proyectoId}`);
  revalidatePath("/portal/proyectos");
  volver(`${path}?ok=1`);
}

export async function eliminarProyectoAction(proyectoId: string) {
  const { supabase } = await requireAdmin();

  const { data: docs } = await supabase
    .from("proyecto_documentos")
    .select("storage_path")
    .eq("proyecto_id", proyectoId);
  if (docs && docs.length > 0) {
    await supabase.storage.from(BUCKET_DOCUMENTOS).remove(docs.map((d) => d.storage_path));
  }

  const { error } = await supabase.from("proyectos").delete().eq("id", proyectoId);
  if (error) volver(`/admin/proyectos/${proyectoId}`, "proyecto_no_eliminado");

  revalidatePath("/admin/proyectos");
  revalidatePath("/portal/proyectos");
  redirect("/admin/proyectos");
}

// ---------------------------------------------------------------------------
// Hitos
// ---------------------------------------------------------------------------

export async function crearHitoAction(proyectoId: string, fd: FormData) {
  const { supabase } = await requireAdmin();
  const titulo = texto(fd, "titulo");
  if (!titulo) volver(`/admin/proyectos/${proyectoId}`, "hito_sin_titulo");

  const { count } = await supabase
    .from("proyecto_hitos")
    .select("id", { count: "exact", head: true })
    .eq("proyecto_id", proyectoId);

  const { error } = await supabase.from("proyecto_hitos").insert({
    proyecto_id: proyectoId,
    titulo,
    descripcion: texto(fd, "descripcion"),
    fecha_estimada: texto(fd, "fecha_estimada"),
    orden: (count ?? 0) + 1,
  });
  if (error) volver(`/admin/proyectos/${proyectoId}`, "hito_no_agregado");
  await tocarProyecto(proyectoId);
}

export async function alternarHitoAction(proyectoId: string, hitoId: string, completado: boolean) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("proyecto_hitos")
    .update({ completado_at: completado ? null : new Date().toISOString() })
    .eq("id", hitoId);
  await tocarProyecto(proyectoId);
}

export async function eliminarHitoAction(proyectoId: string, hitoId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("proyecto_hitos").delete().eq("id", hitoId);
  await tocarProyecto(proyectoId);
}

// ---------------------------------------------------------------------------
// Bitácora
// ---------------------------------------------------------------------------

export async function crearNovedadAction(proyectoId: string, fd: FormData) {
  const { supabase, user } = await requireAdmin();
  const contenido = texto(fd, "contenido");
  if (!contenido) volver(`/admin/proyectos/${proyectoId}`, "novedad_vacia");

  const { error } = await supabase
    .from("proyecto_novedades")
    .insert({ proyecto_id: proyectoId, autor_id: user.id, contenido });
  if (error) volver(`/admin/proyectos/${proyectoId}`, "novedad_no_publicada");
  await tocarProyecto(proyectoId);
}

export async function eliminarNovedadAction(proyectoId: string, novedadId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("proyecto_novedades").delete().eq("id", novedadId);
  await tocarProyecto(proyectoId);
}

// ---------------------------------------------------------------------------
// Documentos (el archivo lo sube el navegador directo a Storage; aquí solo
// se registra, para no pasar archivos grandes por la función del servidor)
// ---------------------------------------------------------------------------

export async function registrarDocumentoAction(
  proyectoId: string,
  doc: { nombre: string; storagePath: string; tamanoBytes: number; mimeType: string },
) {
  const { supabase } = await requireAdmin();
  if (!doc.storagePath.startsWith(`${proyectoId}/`)) return { error: "Ruta de archivo inválida." };

  const { error } = await supabase.from("proyecto_documentos").insert({
    proyecto_id: proyectoId,
    nombre: doc.nombre,
    storage_path: doc.storagePath,
    tamano_bytes: doc.tamanoBytes,
    mime_type: doc.mimeType || null,
  });
  if (error) {
    await supabase.storage.from(BUCKET_DOCUMENTOS).remove([doc.storagePath]);
    return { error: "No se pudo registrar el documento." };
  }
  await tocarProyecto(proyectoId);
  return { error: null };
}

export async function eliminarDocumentoAction(proyectoId: string, documentoId: string, storagePath: string) {
  const { supabase } = await requireAdmin();
  await supabase.storage.from(BUCKET_DOCUMENTOS).remove([storagePath]);
  await supabase.from("proyecto_documentos").delete().eq("id", documentoId);
  await tocarProyecto(proyectoId);
}


// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function datosCliente(fd: FormData) {
  const tipo = texto(fd, "tipo") === "persona" ? "persona" : "empresa";
  const region = texto(fd, "region");
  return {
    tipo,
    nombre: texto(fd, "nombre"),
    nombre_fantasia: tipo === "empresa" ? texto(fd, "nombre_fantasia") : null,
    rut: texto(fd, "rut"),
    giro: tipo === "empresa" ? texto(fd, "giro") : null,
    email: texto(fd, "email")?.toLowerCase() ?? null,
    telefono: texto(fd, "telefono"),
    direccion: texto(fd, "direccion"),
    comuna: texto(fd, "comuna"),
    region: region && REGIONES.includes(region) ? region : null,
    activo: fd.get("activo") === "on",
  };
}

// Valida y normaliza; devuelve el código de error o null.
function validarCliente(datos: ReturnType<typeof datosCliente>): CodigoMensaje | null {
  if (!datos.nombre) {
    return datos.tipo === "empresa" ? "cliente_sin_razon_social" : "cliente_sin_nombre";
  }
  if (datos.rut) {
    const rut = normalizarRut(datos.rut);
    if (!rut) return "rut_invalido";
    datos.rut = rut;
  }
  if (datos.email && !EMAIL_VALIDO.test(datos.email)) return "email_invalido";
  return null;
}

function errorCliente(error: { code?: string } | null): CodigoMensaje {
  return error?.code === "23505" ? "rut_duplicado" : "cliente_no_guardado";
}

function revalidarCliente(clienteId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/clientes");
  if (clienteId) revalidatePath(`/admin/clientes/${clienteId}`);
}

export async function crearClienteAction(fd: FormData) {
  const { supabase } = await requireAdmin();
  const datos = datosCliente(fd);
  const error = validarCliente(datos);
  if (error) volver("/admin/clientes/nuevo", error);

  const { data, error: dbError } = await supabase.from("clientes").insert(datos).select("id").single();
  if (dbError || !data) volver("/admin/clientes/nuevo", errorCliente(dbError));

  const notas = texto(fd, "notas");
  if (notas) await supabase.from("cliente_notas").insert({ cliente_id: data.id, notas });

  // Una persona con correo queda con acceso al portal desde el inicio.
  if (fd.get("dar_acceso") === "on" && datos.email) {
    await supabase.from("cliente_accesos").insert({
      cliente_id: data.id,
      email: datos.email,
      nombre_contacto: datos.tipo === "persona" ? datos.nombre : null,
    });
  }

  revalidarCliente();
  redirect(`/admin/clientes/${data.id}`);
}

export async function actualizarClienteAction(clienteId: string, fd: FormData) {
  const { supabase } = await requireAdmin();
  const path = `/admin/clientes/${clienteId}`;
  const datos = datosCliente(fd);
  const error = validarCliente(datos);
  if (error) volver(path, error);

  const { error: dbError } = await supabase.from("clientes").update(datos).eq("id", clienteId);
  if (dbError) volver(path, errorCliente(dbError));

  await supabase
    .from("cliente_notas")
    .upsert({ cliente_id: clienteId, notas: texto(fd, "notas"), updated_at: new Date().toISOString() });

  revalidarCliente(clienteId);
  revalidatePath("/portal", "layout");
  volver(`${path}?ok=1`);
}

export async function eliminarClienteAction(clienteId: string) {
  const { supabase } = await requireAdmin();
  const { count } = await supabase
    .from("proyectos")
    .select("id", { count: "exact", head: true })
    .eq("cliente_id", clienteId);
  if (count) {
    volver(
      `/admin/clientes/${clienteId}`,
      "cliente_con_proyectos",
    );
  }

  const { error } = await supabase.from("clientes").delete().eq("id", clienteId);
  if (error) volver(`/admin/clientes/${clienteId}`, "cliente_no_eliminado");
  revalidarCliente();
  redirect("/admin/clientes");
}

export async function agregarAccesoAction(clienteId: string, fd: FormData) {
  const { supabase } = await requireAdmin();
  const path = `/admin/clientes/${clienteId}`;
  const email = texto(fd, "email")?.toLowerCase();
  if (!email || !EMAIL_VALIDO.test(email)) volver(path, "email_invalido");

  const { error } = await supabase.from("cliente_accesos").insert({
    cliente_id: clienteId,
    email,
    nombre_contacto: texto(fd, "nombre_contacto"),
    cargo: texto(fd, "cargo"),
  });
  if (error) {
    volver(path, error.code === "23505" ? "acceso_duplicado" : "acceso_no_agregado");
  }
  revalidarCliente(clienteId);
}

export async function quitarAccesoAction(clienteId: string, accesoId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("cliente_accesos").delete().eq("id", accesoId);
  revalidarCliente(clienteId);
}

// ---------------------------------------------------------------------------
// Solicitudes de derechos (Ley 21.719)
// ---------------------------------------------------------------------------

const ESTADOS_VALIDOS = ["recibida", "en_proceso", "respondida", "rechazada"];

export async function actualizarSolicitudAction(solicitudId: string, fd: FormData) {
  const { supabase } = await requireAdmin();
  const estado = texto(fd, "estado");
  const respuesta = texto(fd, "respuesta");
  if (!estado || !ESTADOS_VALIDOS.includes(estado)) volver("/admin/solicitudes", "solicitud_no_guardada");
  // Cerrar una solicitud exige dejar la respuesta que verá el titular.
  const cerrada = estado === "respondida" || estado === "rechazada";
  if (cerrada && !respuesta) volver("/admin/solicitudes", "solicitud_sin_respuesta");

  const { error } = await supabase
    .from("solicitudes_derechos")
    .update({ estado, respuesta, respondida_at: cerrada ? new Date().toISOString() : null })
    .eq("id", solicitudId);
  if (error) volver("/admin/solicitudes", "solicitud_no_guardada");

  revalidatePath("/admin", "layout");
  revalidatePath("/portal/mis-datos");
}
