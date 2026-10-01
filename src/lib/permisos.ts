// Matriz de permisos del equipo sobre los proyectos asignados. Debe coincidir
// con privado.puede_en_proyecto (supabase/migrations/20260930120000_equipo.sql):
// la base de datos es la que manda; aquí solo se decide qué mostrar.

export const CARGOS = [
  { valor: "jefe_proyecto", etiqueta: "Jefe de proyecto" },
  { valor: "ingeniero", etiqueta: "Ingeniero" },
  { valor: "tecnico", etiqueta: "Técnico" },
  { valor: "soporte", etiqueta: "Soporte" },
] as const;

export type Cargo = (typeof CARGOS)[number]["valor"];

export type Accion =
  | "ver"
  | "hito_completar"
  | "documento_subir"
  | "novedad_publicar"
  | "hito_editar"
  | "avance_editar"
  | "eliminar";

const MATRIZ: Record<Accion, Cargo[]> = {
  ver: ["jefe_proyecto", "ingeniero", "tecnico", "soporte"],
  hito_completar: ["jefe_proyecto", "ingeniero", "tecnico"],
  documento_subir: ["jefe_proyecto", "ingeniero", "tecnico"],
  novedad_publicar: ["jefe_proyecto", "ingeniero"],
  hito_editar: ["jefe_proyecto", "ingeniero"],
  avance_editar: ["jefe_proyecto"],
  eliminar: ["jefe_proyecto"],
};

// "admin" = super usuario: puede todo.
export type RolEnProyecto = Cargo | "admin";

export function puede(rol: RolEnProyecto | null, accion: Accion) {
  if (!rol) return false;
  return rol === "admin" || MATRIZ[accion].includes(rol);
}

export function etiquetaCargo(cargo: string) {
  return CARGOS.find((c) => c.valor === cargo)?.etiqueta ?? cargo;
}

export function esCargo(valor: string | null | undefined): valor is Cargo {
  return CARGOS.some((c) => c.valor === valor);
}
