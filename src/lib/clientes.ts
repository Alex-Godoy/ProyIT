export type TipoCliente = "empresa" | "persona";

export type Cliente = {
  id: string;
  tipo: TipoCliente;
  nombre: string;
  nombre_fantasia: string | null;
  rut: string | null;
  giro: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  comuna: string | null;
  region: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type Acceso = {
  id: string;
  email: string;
  nombre_contacto: string | null;
  cargo: string | null;
  user_id: string | null;
};

export const COLUMNAS_CLIENTE =
  "id, tipo, nombre, nombre_fantasia, rut, giro, email, telefono, direccion, comuna, region, activo, created_at, updated_at";

export const TIPOS_CLIENTE: { valor: TipoCliente; etiqueta: string }[] = [
  { valor: "empresa", etiqueta: "Empresa" },
  { valor: "persona", etiqueta: "Persona" },
];

export const REGIONES = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana de Santiago",
  "Libertador General Bernardo O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén del General Carlos Ibáñez del Campo",
  "Magallanes y de la Antártica Chilena",
];

export function nombreVisible(c: Pick<Cliente, "nombre" | "nombre_fantasia">) {
  return c.nombre_fantasia ? `${c.nombre_fantasia} (${c.nombre})` : c.nombre;
}

// ---------------------------------------------------------------------------
// RUT chileno
// ---------------------------------------------------------------------------

function digitoVerificador(cuerpo: string) {
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  return resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
}

// Devuelve el RUT formateado (12.345.678-5) o null si no es válido.
export function normalizarRut(valor: string): string | null {
  const limpio = valor.replace(/[^0-9kK]/g, "").toUpperCase();
  if (limpio.length < 2) return null;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  if (!/^\d+$/.test(cuerpo) || digitoVerificador(cuerpo) !== dv) return null;
  return `${String(Number(cuerpo)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
}
