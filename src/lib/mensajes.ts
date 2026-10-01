// Mensajes del panel por código. La URL solo transporta el código (?error= u
// ?ok=), así un enlace manipulado no puede mostrar texto arbitrario en el portal.
export const MENSAJES = {
  proyecto_sin_nombre: "El proyecto necesita un nombre.",
  proyecto_sin_cliente: "Elige el cliente del proyecto.",
  proyecto_no_creado: "No se pudo crear el proyecto.",
  cambios_no_guardados: "No se pudieron guardar los cambios.",
  proyecto_no_eliminado: "No se pudo eliminar el proyecto.",
  avance_invalido: "Revisa la etapa y el avance (0 a 100%).",
  hito_sin_titulo: "El hito necesita un título.",
  hito_no_agregado: "No se pudo agregar el hito.",
  novedad_vacia: "La novedad está vacía.",
  novedad_no_publicada: "No se pudo publicar la novedad.",
  cliente_sin_razon_social: "Ingresa la razón social.",
  cliente_sin_nombre: "Ingresa el nombre completo.",
  rut_invalido: "El RUT no es válido: revisa el dígito verificador.",
  email_invalido: "El correo no es válido.",
  rut_duplicado: "Ya existe un cliente con ese RUT.",
  cliente_no_guardado: "No se pudieron guardar los datos del cliente.",
  cliente_con_proyectos: "Este cliente tiene proyectos. Elimínalos o márcalo como inactivo en vez de borrarlo.",
  cliente_no_eliminado: "No se pudo eliminar el cliente.",
  acceso_duplicado: "Ese correo ya tiene acceso a este cliente.",
  acceso_no_agregado: "No se pudo agregar el acceso.",
  solicitud_sin_respuesta: "Escribe la respuesta para el titular antes de cerrarla.",
  solicitud_no_guardada: "No se pudo actualizar la solicitud.",
  miembro_sin_nombre: "Ingresa el nombre de la persona.",
  miembro_cargo_invalido: "Elige un cargo.",
  miembro_duplicado: "Ya hay alguien del equipo con ese correo.",
  miembro_es_cliente: "Ese correo tiene acceso como cliente. Quítale ese acceso antes de sumarlo al equipo.",
  miembro_no_guardado: "No se pudo guardar el integrante del equipo.",
  miembro_no_asignado: "No se pudo asignar a esa persona al proyecto.",
} as const;

export type CodigoMensaje = keyof typeof MENSAJES;

export const MENSAJES_OK = {
  guardado: "Cambios guardados.",
  avance_guardado: "Etapa y avance actualizados. El cliente ya ve el cambio.",
  hito_agregado: "Hito agregado.",
  hito_actualizado: "Hito actualizado.",
  hito_completado: "Hito marcado como completado.",
  hito_pendiente: "Hito marcado como pendiente.",
  hito_eliminado: "Hito eliminado.",
  novedad_publicada: "Novedad publicada. El cliente ya la ve en su bitácora.",
  novedad_eliminada: "Novedad eliminada.",
  documento_subido: "Documento subido.",
  documento_eliminado: "Documento eliminado.",
  equipo_asignado: "Persona asignada al proyecto.",
  equipo_quitado: "Persona quitada del proyecto.",
  miembro_invitado: "Integrante agregado. Pídele que se registre en el portal con ese correo.",
  miembro_actualizado: "Datos del integrante actualizados.",
  acceso_agregado: "Acceso agregado. Pídele al cliente que se registre en el portal con ese correo.",
} as const;

export type CodigoOk = keyof typeof MENSAJES_OK;

export function textoMensaje(codigo?: string) {
  if (!codigo) return undefined;
  return codigo in MENSAJES ? MENSAJES[codigo as CodigoMensaje] : "Ocurrió un error. Inténtalo de nuevo.";
}

// `?ok=1` (formato anterior) se muestra como "Cambios guardados.".
export function textoOk(codigo?: string) {
  if (!codigo) return undefined;
  return codigo in MENSAJES_OK ? MENSAJES_OK[codigo as CodigoOk] : MENSAJES_OK.guardado;
}
