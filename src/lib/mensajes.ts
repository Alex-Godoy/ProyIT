// Mensajes del panel por código. La URL solo transporta el código (?error=),
// así un enlace manipulado no puede mostrar texto arbitrario en el portal.
export const MENSAJES = {
  proyecto_sin_nombre: "El proyecto necesita un nombre.",
  proyecto_sin_cliente: "Elige el cliente del proyecto.",
  proyecto_no_creado: "No se pudo crear el proyecto.",
  cambios_no_guardados: "No se pudieron guardar los cambios.",
  proyecto_no_eliminado: "No se pudo eliminar el proyecto.",
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
} as const;

export type CodigoMensaje = keyof typeof MENSAJES;

export function textoMensaje(codigo?: string) {
  if (!codigo) return undefined;
  return codigo in MENSAJES ? MENSAJES[codigo as CodigoMensaje] : "Ocurrió un error. Inténtalo de nuevo.";
}
