"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { BUCKET_DOCUMENTOS, ETAPAS } from "@/lib/proyectos";
import { REGIONES, normalizarRut } from "@/lib/clientes";
import { esCargo } from "@/lib/permisos";
import type { CodigoMensaje } from "@/lib/mensajes";

// Todas las acciones validan el rol admin aquí y, además, RLS lo vuelve a
// exigir en la base de datos.

function texto(fd: FormData, campo: string) {
  const v = fd.get(campo);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

function volver(path: string, error?: CodigoMensaje): never {
  // `path` puede traer ya parámetros (?tab=...): el error se agrega con & en ese caso.
  redirect(error ? `${path}${path.includes("?") ? "&" : "?"}error=${error}` : path);
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
  volver(`${path}?tab=resumen&ok=guardado`);
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
  volver(`${path}?ok=guardado`);
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
  volver(`${path}?ok=acceso_agregado`);
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

// ---------------------------------------------------------------------------
// Equipo ProyIT (ingenieros, técnicos, etc.)
// ---------------------------------------------------------------------------

function revalidarEquipo() {
  revalidatePath("/admin", "layout");
  revalidatePath("/equipo", "layout");
}

export async function invitarMiembroAction(fd: FormData) {
  const { supabase } = await requireAdmin();
  const email = texto(fd, "email")?.toLowerCase();
  const nombre = texto(fd, "nombre");
  const cargo = texto(fd, "cargo");
  if (!email || !EMAIL_VALIDO.test(email)) volver("/admin/equipo", "email_invalido");
  if (!nombre) volver("/admin/equipo", "miembro_sin_nombre");
  if (!esCargo(cargo)) volver("/admin/equipo", "miembro_cargo_invalido");

  // Un cliente no puede ser a la vez integrante del equipo (vería otros proyectos).
  const { count } = await supabase
    .from("cliente_accesos")
    .select("id", { count: "exact", head: true })
    .eq("email", email);
  if (count) volver("/admin/equipo", "miembro_es_cliente");

  const { error } = await supabase
    .from("equipo")
    .insert({ email, nombre, cargo, telefono: texto(fd, "telefono") });
  if (error) volver("/admin/equipo", error.code === "23505" ? "miembro_duplicado" : "miembro_no_guardado");
  revalidarEquipo();
  volver("/admin/equipo?ok=miembro_invitado");
}

export async function actualizarMiembroAction(miembroId: string, fd: FormData) {
  const { supabase } = await requireAdmin();
  const nombre = texto(fd, "nombre");
  const cargo = texto(fd, "cargo");
  if (!nombre) volver("/admin/equipo", "miembro_sin_nombre");
  if (!esCargo(cargo)) volver("/admin/equipo", "miembro_cargo_invalido");

  const { error } = await supabase
    .from("equipo")
    .update({ nombre, cargo, telefono: texto(fd, "telefono"), activo: fd.get("activo") === "on" })
    .eq("id", miembroId);
  if (error) volver("/admin/equipo", "miembro_no_guardado");
  revalidarEquipo();
  volver("/admin/equipo?ok=miembro_actualizado");
}

// La asignación se puede hacer desde el proyecto (pestaña Equipo) o desde la
// ficha de la persona (sección Equipo); `desde` define a dónde volver.
type DesdeAsignacion = "proyecto" | "equipo";

function rutaAsignacion(desde: DesdeAsignacion, proyectoId: string) {
  return desde === "proyecto" ? `/admin/proyectos/${proyectoId}?tab=equipo` : "/admin/equipo";
}

async function asignar(proyectoId: string | null, equipoId: string | null, desde: DesdeAsignacion) {
  const { supabase } = await requireAdmin();
  const path = rutaAsignacion(desde, proyectoId ?? "");
  if (!proyectoId || !equipoId) volver(path, "miembro_no_asignado");

  const { error } = await supabase.from("proyecto_equipo").insert({ proyecto_id: proyectoId, equipo_id: equipoId });
  if (error && error.code !== "23505") volver(path, "miembro_no_asignado");
  revalidarEquipo();
  revalidatePath(`/portal/proyectos/${proyectoId}`);
  volver(`${path}${path.includes("?") ? "&" : "?"}ok=equipo_asignado`);
}

// Desde el proyecto: se elige a la persona.
export async function asignarMiembroAction(proyectoId: string, fd: FormData) {
  await asignar(proyectoId, texto(fd, "equipo_id"), "proyecto");
}

// Desde la ficha de la persona: se elige el proyecto.
export async function asignarProyectoAction(equipoId: string, fd: FormData) {
  await asignar(texto(fd, "proyecto_id"), equipoId, "equipo");
}

export async function quitarMiembroAction(proyectoId: string, equipoId: string, desde: DesdeAsignacion = "proyecto") {
  const { supabase } = await requireAdmin();
  await supabase.from("proyecto_equipo").delete().eq("proyecto_id", proyectoId).eq("equipo_id", equipoId);
  revalidarEquipo();
  revalidatePath(`/portal/proyectos/${proyectoId}`);
  const path = rutaAsignacion(desde, proyectoId);
  volver(`${path}${path.includes("?") ? "&" : "?"}ok=equipo_quitado`);
}
