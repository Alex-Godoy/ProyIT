// Soporte y continuidad TI (empresas, /soporte) y reparación de equipos
// (personas, /reparaciones). Precios con IVA incluido, tal como se muestran. Se
// editan aquí y se reflejan en las dos páginas y en el formulario de solicitud.

export type PlanSoporte = {
  id: "esencial" | "pyme" | "total";
  nombre: string;
  precio: string;
  equipos: string;
  separado: string; // lo que costaría sin plan, con el ahorro
  respuesta: string; // primer contacto, no solución (ver CONDICIONES_PLANES)
  incluye: string[];
  recomendado?: boolean;
};

export const PLANES_SOPORTE: PlanSoporte[] = [
  {
    id: "esencial",
    nombre: "Esencial",
    precio: "$169.990",
    equipos: "Hasta 5 equipos",
    separado: "Por separado: $209.000 · ahorras 18%",
    respuesta: "Primer contacto en 4 horas hábiles",
    incluye: ["3 horas de soporte remoto al mes", "Mantención preventiva semestral de todos los equipos"],
  },
  {
    id: "pyme",
    nombre: "Pyme",
    precio: "$339.990",
    equipos: "Hasta 10 equipos",
    separado: "Por separado: $418.000 · ahorras 18%",
    respuesta: "Primer contacto en 2 horas hábiles",
    incluye: [
      "6 horas de soporte al mes, incluida 1 visita",
      "Mantención preventiva semestral de todos los equipos",
      "Respaldos y soporte Microsoft 365 o Google Workspace",
    ],
    recomendado: true,
  },
  {
    id: "total",
    nombre: "Total",
    precio: "$659.990",
    equipos: "Hasta 20 equipos",
    separado: "Por separado: $836.000 · ahorras 21%",
    respuesta: "Primer contacto en 1 hora hábil",
    incluye: [
      "12 horas de soporte al mes, incluidas 2 visitas",
      "Mantención preventiva semestral de todos los equipos",
      "Todo lo de Pyme, más revisión mensual de seguridad: actualizaciones, antivirus y accesos",
      "Informe mensual del estado de tus equipos",
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

// Condiciones de los planes que se publican en /soporte. Son compromisos con
// el cliente: si cambian, se cambian aquí.
export const CONDICIONES_PLANES: { t: string; d: string }[] = [
  {
    t: "Qué cuenta como equipo",
    d: "Cada notebook o PC de escritorio. Impresoras, router y periféricos se atienden con las horas del plan, sin sumar equipos. Servidores se cotizan aparte.",
  },
  {
    t: "Primer contacto",
    d: "Es el tiempo en que una persona del equipo toma tu solicitud y te contacta, no el plazo de solución. Corre en horario hábil: lunes a viernes, 9:00 a 19:00.",
  },
  {
    t: "Horas no usadas",
    d: "No se acumulan al mes siguiente. La mantención preventiva sí queda agendada aunque no ocupes horas.",
  },
  {
    t: "Visitas en terreno",
    d: "En la Región Metropolitana. Cada visita descuenta horas del plan desde que llegamos.",
  },
  {
    t: "Permanencia",
    d: "Sin permanencia mínima. Puedes terminar el plan avisando con 30 días de anticipación.",
  },
  {
    t: `Diagnóstico TI · ${DIAGNOSTICO_OFICINA}`,
    d: "Revisamos equipos, red, respaldos y cuentas, y te entregamos un informe con riesgos y prioridades. Se abona completo a tu primera mensualidad.",
  },
];

// Datos del taller para personas. Se muestran en /reparaciones. Solo se
// publica la comuna: la recepción es con hora coordinada.
export const TALLER = {
  direccion: "Las Condes y Chicureo",
  recepcion: "Con hora coordinada en Las Condes o Chicureo",
  envio: "También puedes enviarlo por Chilexpress: te damos los datos al coordinar.",
  horario: "Lunes a viernes, 9:00 a 19:00",
  plazo: "24 a 48 horas hábiles",
  garantia: "30 días",
};

// ---------------------------------------------------------------------------
// Urgencias. El recargo se aplica sobre el precio normal según el horario; con
// un plan para empresas el recargo es menor y se calcula sobre la hora con plan.
// Si aplican dos recargos, se cobra el más alto. Los horarios siguen la
// capacidad real del equipo: de noche no hay turno, así que no se vende.
// ---------------------------------------------------------------------------

export const RECARGOS_URGENCIA = [
  { horario: "Urgente en horario hábil", cuando: "Mismo día, con prioridad. Lunes a viernes, 9:00 a 19:00.", sinPlan: 30, conPlan: 15 },
  {
    horario: "Fuera de horario y sábados",
    cuando: "Lunes a viernes, 19:00 a 22:00. Sábados, 10:00 a 18:00.",
    sinPlan: 50,
    conPlan: 25,
  },
  {
    horario: "Domingos y feriados",
    cuando: "10:00 a 18:00. Solo atención remota.",
    sinPlan: 100,
    conPlan: 50,
  },
];

export const SIN_ATENCION =
  "De 22:00 a 9:00, y los fines de semana fuera de esos horarios, no atendemos. Puedes escribirnos igual por WhatsApp: nuestro asistente recibe tu solicitud y te contactamos al comenzar el siguiente horario de atención.";

export function clp(n: number) {
  return `$${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

// Precio con recargo, redondeado a la decena (como se publica).
export const conRecargo = (base: number, pct: number) => Math.round((base * (100 + pct)) / 1000) * 10;

export type EjemploUrgencia = { servicio: string; base: number; conPlan?: boolean };

export const URGENCIA_PERSONAS: EjemploUrgencia[] = [
  { servicio: "Diagnóstico en taller", base: 19990 },
  { servicio: "Diagnóstico a domicilio u oficina", base: 34990 },
  { servicio: "Asistencia remota", base: 19990 },
];

export const URGENCIA_EMPRESAS: EjemploUrgencia[] = [
  { servicio: "Hora de soporte o visita, sin plan", base: 59990 },
  { servicio: "Hora adicional, con plan", base: 39990, conPlan: true },
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

// Cómo tratamos los datos de los equipos que nos entregan (Ley 21.719).
export const PROTOCOLO_DATOS = [
  { t: "Acceso mínimo", d: "Entramos solo a lo necesario para la reparación. No abrimos tus documentos, fotos ni correos." },
  { t: "Respaldo antes de tocar", d: "Antes de formatear o cambiar un disco, respaldamos tus archivos y te confirmamos qué se respaldó." },
  { t: "Borrado al entregar", d: "Los respaldos temporales se eliminan cuando recibes tu equipo conforme." },
  { t: "Registro de cada paso", d: "Queda anotado quién recibió el equipo, qué se hizo y cuándo se entregó." },
];

export const PREGUNTAS_EMPRESAS = [
  {
    p: "¿Qué pasa si se cae el correo o un equipo deja de partir?",
    r: "Nos escribes o abres un ticket en tu Portal. Te contactamos dentro del plazo de tu plan y, si hace falta, vamos a tu oficina.",
  },
  {
    p: "¿Tengo que tener una persona de TI?",
    r: "No. El plan existe justamente para que tu oficina no dependa de una sola persona. Conocemos tus equipos, cuentas y respaldos.",
  },
  {
    p: "¿Y si tengo más equipos que los del plan?",
    r: `Cada equipo adicional cuesta ${PRECIOS_SUELTOS.equipoAdicional} al mes. Si superas los 20, armamos un plan a tu medida.`,
  },
  {
    p: "¿Puedo partir solo con el diagnóstico?",
    r: `Sí. El diagnóstico TI de oficina cuesta ${DIAGNOSTICO_OFICINA} y te deja un informe con riesgos y prioridades. Si después contratas un plan, se abona a tu primera mensualidad.`,
  },
];

export const PREGUNTAS_PERSONAS = [
  { p: "¿Y si no acepto el presupuesto?", r: "Pagas solo el diagnóstico y te entregamos el equipo con un informe de la falla." },
  { p: "¿Cuánto demora el diagnóstico?", r: `Entre ${TALLER.plazo} desde que recibimos el equipo.` },
  { p: "¿Los repuestos están incluidos?", r: "No. Los cotizamos aparte en el presupuesto, con su precio a la vista." },
  { p: "¿Qué garantía tiene la reparación?", r: `${TALLER.garantia} sobre el trabajo realizado y los repuestos que instalamos.` },
  {
    p: "¿Mis archivos están seguros?",
    r: "Sí. Seguimos un protocolo de acceso mínimo, respaldo y borrado al entregar, pensado para cumplir la Ley 21.719 de protección de datos.",
  },
  {
    p: "¿Dónde dejo mi equipo?",
    r: `${TALLER.recepcion}, ${TALLER.horario.toLowerCase()}. ${TALLER.envio} También podemos ir a tu casa u oficina.`,
  },
];

// ---------------------------------------------------------------------------
// Servicios que se pueden pedir desde los formularios de /soporte y
// /reparaciones. `interes` es el tema con que la solicitud llega al panel
// (Contactos web) y a los correos.
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
  diagnostico: string; // cómo se abona el diagnóstico
  nota: string;
  interes: string;
};

const REVISION = "Revisamos tu equipo antes de trabajar. Si aceptas el servicio, la revisión no se cobra aparte.";
const CON_PLAN = `El diagnóstico TI de tu oficina (${DIAGNOSTICO_OFICINA}) se abona a tu primera mensualidad.`;

const personas: Omit<ServicioSoporte, "grupo" | "interes">[] = [
  {
    id: "diag-taller",
    nombre: "Diagnóstico en taller",
    precio: "$19.990",
    unidad: "IVA incluido",
    diagnostico: "Es un abono: si aceptas la reparación, estos $19.990 se descuentan del total.",
    nota: `Presupuesto en ${TALLER.plazo}. Si no aceptas, pagas solo la revisión.`,
  },
  {
    id: "diag-domicilio",
    nombre: "Diagnóstico a domicilio u oficina",
    precio: "$34.990",
    unidad: "IVA incluido",
    diagnostico: "Es un abono: si aceptas la reparación, estos $34.990 se descuentan del total.",
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

const recargos = (clave: "sinPlan" | "conPlan") => RECARGOS_URGENCIA.map((r) => `+${r[clave]}%`).join(", ");

export const SERVICIOS_SOPORTE: ServicioSoporte[] = [
  {
    id: "urgencia",
    grupo: "urgencia",
    nombre: "Atención urgente",
    precio: "Recargo según horario",
    unidad: "",
    diagnostico: `Sin plan: ${recargos("sinPlan")} sobre el precio normal. Con plan para empresas: ${recargos("conPlan")} sobre la hora con plan.`,
    nota: "Antes de empezar te decimos cuánto cuesta. Las visitas urgentes tienen un mínimo de 1 hora.",
    interes: INTERES_URGENCIA,
  },
  ...personas.map((s) => ({ ...s, grupo: "personas" as const, interes: s.nombre })),
  {
    id: "diag-ti",
    grupo: "empresas",
    nombre: "Diagnóstico TI de oficina",
    precio: DIAGNOSTICO_OFICINA,
    unidad: "IVA incluido",
    diagnostico: "Se abona completo a tu primera mensualidad si contratas un plan.",
    nota: "Revisamos equipos, red, respaldos y cuentas, y te entregamos un informe con riesgos y prioridades.",
    interes: "Diagnóstico TI de oficina",
  },
  ...PLANES_SOPORTE.map((p) => ({
    id: p.id,
    grupo: "empresas" as const,
    nombre: `Plan ${p.nombre} · ${p.equipos.toLowerCase()}`,
    precio: p.precio,
    unidad: "/ mes · IVA incluido",
    diagnostico: CON_PLAN,
    nota: `${p.respuesta}. ${p.separado.replace(" · ahorras", " al mes. Ahorras")}.`,
    interes: interesPlan(p),
  })),
];

export const INTERESES_SERVICIO = SERVICIOS_SOPORTE.filter((s) => s.grupo !== "urgencia" && !esInteresPlan(s.interes)).map(
  (s) => s.interes,
);
export const esInteresServicio = (interes: string | null) => Boolean(interes && INTERESES_SERVICIO.includes(interes));
