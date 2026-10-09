// Soporte y continuidad TI: planes, urgencias y reparaciones. Precios con IVA
// incluido, tal como se muestran. Se editan aquí y se reflejan en el home, en
// /soporte y en el formulario de solicitud.

export type PlanSoporte = {
  id: "esencial" | "pyme" | "total";
  nombre: string;
  precio: string;
  equipos: string;
  separado: string; // lo que costaría sin plan, con el ahorro
  respuesta: string;
  incluye: string[];
  destacado?: boolean;
};

export const PLANES_SOPORTE: PlanSoporte[] = [
  {
    id: "esencial",
    nombre: "Esencial",
    precio: "$169.990",
    equipos: "Hasta 5 equipos",
    separado: "Por separado: $209.000 · ahorras 18%",
    respuesta: "Respuesta en 4 horas hábiles",
    incluye: [
      "3 horas de soporte remoto al mes",
      "Mantención preventiva semestral de todos los equipos",
      "Respuesta en 4 horas hábiles",
    ],
  },
  {
    id: "pyme",
    nombre: "Pyme",
    precio: "$339.990",
    equipos: "Hasta 10 equipos",
    separado: "Por separado: $418.000 · ahorras 18%",
    respuesta: "Respuesta en 2 horas hábiles",
    incluye: [
      "6 horas de soporte al mes, incluida 1 visita",
      "Mantención preventiva semestral de todos los equipos",
      "Respaldos y soporte Microsoft 365 o Google Workspace",
      "Respuesta en 2 horas hábiles",
    ],
    destacado: true,
  },
  {
    id: "total",
    nombre: "Total",
    precio: "$659.990",
    equipos: "Hasta 20 equipos",
    separado: "Por separado: $836.000 · ahorras 21%",
    respuesta: "Respuesta en 1 hora hábil",
    incluye: [
      "12 horas de soporte al mes, incluidas 2 visitas",
      "Mantención preventiva semestral de todos los equipos",
      "Todo lo de Pyme, más monitoreo y seguridad",
      "Informe mensual · respuesta en 1 hora hábil",
    ],
  },
];

export const DIAGNOSTICO_OFICINA = "$98.990";

export const PRECIOS_SUELTOS = {
  hora: "$59.990",
  mantencion: "$34.990",
  horaConPlan: "$39.990",
  equipoAdicional: "$29.990",
};

// Con plan, si acepta la reparación, la atención urgente cuesta este porcentaje
// menos. Sin plan se paga el valor completo, recargo incluido.
export const DESCUENTO_URGENCIA_CON_PLAN = "30%";

export const RECARGOS_URGENCIA = [
  {
    recargo: "+30%",
    titulo: "Urgente en horario hábil",
    detalle: "Atención el mismo día, con prioridad. Lunes a viernes, 9:00 a 19:00.",
  },
  {
    recargo: "+50%",
    titulo: "Fuera de horario y fines de semana",
    detalle: "Lunes a viernes, 19:00 a 23:00. Sábado y domingo, 9:00 a 23:00.",
  },
  {
    recargo: "+100%",
    titulo: "Nocturno y feriados",
    detalle:
      "Cualquier día de 23:00 a 9:00, y todo el día en feriados. Solo remoto, o en terreno para empresas con plan.",
    destacado: true,
  },
];

// Ejemplos de la tabla de urgencias: [normal, +30%, +50%, +100%].
export const EJEMPLOS_URGENCIA: { servicio: string; precios: [string, string, string, string] }[] = [
  { servicio: "Diagnóstico en laboratorio", precios: ["$19.990", "$25.990", "$29.990", "$39.990"] },
  { servicio: "Diagnóstico a domicilio u oficina", precios: ["$34.990", "$45.490", "$52.490", "$69.990"] },
  { servicio: "Hora de soporte o visita sin plan", precios: ["$59.990", "$77.990", "$89.990", "$119.990"] },
];

export const REPARACIONES: { servicio: string; incluye: string; precio: string; antes?: string; despues?: string }[] = [
  { servicio: "Formateo con respaldo", incluye: "Windows, programas básicos y tus archivos de vuelta", precio: "$39.990" },
  { servicio: "Mantención térmica", incluye: "Limpieza interna y cambio de pasta térmica", precio: "$34.990" },
  { servicio: "Instalación de SSD", incluye: "Instalamos tu sistema al disco nuevo", precio: "$24.990", despues: "+ disco" },
  { servicio: "Ampliación de RAM", incluye: "Instalación y prueba de la memoria", precio: "$9.990", despues: "+ memoria" },
  { servicio: "Cambio de pantalla", incluye: "Pantalla compatible e instalación", precio: "Según modelo" },
  { servicio: "Recuperación de archivos", incluye: "Desde discos dañados o borrados por error", precio: "$49.990", antes: "desde" },
  { servicio: "Asistencia remota", incluye: "Configuraciones y problemas de software, sin moverte", precio: "$19.990" },
];

export const PREGUNTAS_SOPORTE = [
  { p: "¿Y si no acepto el presupuesto?", r: "Pagas solo el diagnóstico y te entregamos el equipo con un informe de la falla." },
  { p: "¿Cuánto demora el diagnóstico?", r: "Entre 24 y 48 horas hábiles desde que recibimos el equipo." },
  { p: "¿Los repuestos están incluidos?", r: "No. Los cotizamos aparte en el presupuesto, con su precio a la vista." },
  {
    p: "¿Mis archivos están seguros?",
    r: "Solo accedemos a lo necesario para la reparación y respaldamos antes de cualquier formateo.",
  },
];

// ---------------------------------------------------------------------------
// Servicios que se pueden pedir desde el formulario de /soporte. `interes` es
// el tema con que la solicitud llega al panel (Contactos web) y a los correos.
// ---------------------------------------------------------------------------

export const INTERES_URGENCIA = "Urgencia técnica";
export const interesPlan = (p: PlanSoporte) => `Plan de soporte ${p.nombre}`;
export const esInteresPlan = (interes: string | null) => Boolean(interes?.startsWith("Plan de soporte "));

export type ServicioSoporte = {
  id: string;
  grupo: "urgencia" | "personas" | "empresas";
  nombre: string;
  precio: string;
  unidad: string;
  diagnostico: string; // cómo se descuenta el diagnóstico
  nota: string;
  interes: string;
};

const REVISION = "Revisamos tu equipo antes de trabajar. Si aceptas el servicio, la revisión no se cobra.";
const CON_PLAN = `El diagnóstico TI de tu oficina (${DIAGNOSTICO_OFICINA}) es gratis si contratas el plan.`;

const personas: Omit<ServicioSoporte, "grupo" | "interes">[] = [
  {
    id: "diag-taller",
    nombre: "Diagnóstico en laboratorio",
    precio: "$19.990",
    unidad: "IVA incluido",
    diagnostico: "Si aceptas la reparación, estos $19.990 se descuentan completos.",
    nota: "Presupuesto en 24 a 48 horas hábiles. Si no aceptas, pagas solo la revisión.",
  },
  {
    id: "diag-domicilio",
    nombre: "Diagnóstico a domicilio u oficina",
    precio: "$34.990",
    unidad: "IVA incluido",
    diagnostico: "Si aceptas la reparación, estos $34.990 se descuentan completos.",
    nota: "Disponible en la Región Metropolitana.",
  },
  { id: "formateo", nombre: "Formateo con respaldo", precio: "$39.990", unidad: "IVA incluido", diagnostico: REVISION, nota: "Incluye Windows, programas básicos y tus archivos de vuelta." },
  { id: "mantencion", nombre: "Mantención térmica", precio: "$34.990", unidad: "IVA incluido", diagnostico: REVISION, nota: "Limpieza interna y cambio de pasta térmica." },
  { id: "ssd", nombre: "Instalación de SSD", precio: "$24.990", unidad: "+ disco · IVA incluido", diagnostico: REVISION, nota: "Clonamos tu sistema al disco nuevo." },
  { id: "ram", nombre: "Ampliación de RAM", precio: "$9.990", unidad: "+ memoria · IVA incluido", diagnostico: REVISION, nota: "Instalación y prueba de la memoria." },
  { id: "pantalla", nombre: "Cambio de pantalla", precio: "Según modelo", unidad: "", diagnostico: REVISION, nota: "Te cotizamos la pantalla compatible con tu notebook." },
  { id: "recuperacion", nombre: "Recuperación de archivos", precio: "desde $49.990", unidad: "IVA incluido", diagnostico: REVISION, nota: "El valor final depende del daño del disco." },
  {
    id: "remota",
    nombre: "Asistencia remota",
    precio: "$19.990",
    unidad: "IVA incluido",
    diagnostico: "La asistencia remota no requiere diagnóstico.",
    nota: "Configuraciones y problemas de software, sin moverte.",
  },
];

export const SERVICIOS_SOPORTE: ServicioSoporte[] = [
  {
    id: "urgencia",
    grupo: "urgencia",
    nombre: "Atención urgente",
    precio: "Recargo según horario",
    unidad: "",
    diagnostico: "Al aceptar la reparación se descuenta el diagnóstico base. Sin plan, el recargo por urgencia se paga completo.",
    nota: `Con plan para empresas, si aceptas la reparación, la atención urgente te cuesta ${DESCUENTO_URGENCIA_CON_PLAN} menos. Las visitas urgentes tienen un mínimo de 1 hora.`,
    interes: INTERES_URGENCIA,
  },
  ...personas.map((s) => ({ ...s, grupo: "personas" as const, interes: s.nombre })),
  {
    id: "diag-ti",
    grupo: "empresas",
    nombre: "Diagnóstico TI de oficina",
    precio: DIAGNOSTICO_OFICINA,
    unidad: "IVA incluido",
    diagnostico: "Se descuenta completo de tu primera mensualidad si contratas un plan.",
    nota: "Revisamos equipos, red, respaldos y cuentas de tu equipo.",
    interes: "Diagnóstico TI de oficina",
  },
  ...PLANES_SOPORTE.map((p) => ({
    id: p.id,
    grupo: "empresas" as const,
    nombre: `Plan ${p.nombre} · ${p.equipos.toLowerCase()}`,
    precio: p.precio,
    unidad: "/ mes · IVA incluido",
    diagnostico: CON_PLAN,
    nota: `${p.separado.replace(" · ahorras", " al mes. Ahorras")}.`,
    interes: interesPlan(p),
  })),
];

export const INTERESES_SERVICIO = SERVICIOS_SOPORTE.filter((s) => s.grupo !== "urgencia" && !esInteresPlan(s.interes)).map(
  (s) => s.interes,
);
export const esInteresServicio = (interes: string | null) => Boolean(interes && INTERESES_SERVICIO.includes(interes));
