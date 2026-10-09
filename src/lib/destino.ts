// Adónde volver después de ingresar (?siguiente=/portal/tickets/nuevo).
// Solo se aceptan rutas internas del portal: así el login no se puede usar
// para redirigir a otro sitio (//otro.com, /\otro.com, https://...).
const PREFIJOS_PERMITIDOS = ["/portal", "/admin", "/equipo"];

export function destinoSeguro(valor: string | null | undefined, porDefecto = "/portal") {
  if (!valor || !valor.startsWith("/") || valor.startsWith("//") || valor.includes("\\")) return porDefecto;
  return PREFIJOS_PERMITIDOS.some((p) => valor === p || valor.startsWith(`${p}/`)) ? valor : porDefecto;
}
