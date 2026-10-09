import Image from "next/image";
import Link from "next/link";
import logoBlanco from "../../public/brand/proyit-logo-blanco.png";
import Encabezado from "@/components/home/encabezado";
import AgendarDialogo, { BotonAgendar, EnlaceAgendar } from "@/components/home/agendar";
import EnlaceSolucion from "@/components/home/enlace-solucion";
import { DIAGNOSTICO, PLANES_SOPORTE, WHATSAPP_NUMERO, enlaceWhatsApp, interesPlan } from "@/lib/sitio";

export const metadata = {
  title: "ProyIT · Tecnología a la medida de tu operación",
  description:
    "Lo que hoy haces a mano, en Excel y por WhatsApp, funcionando solo. Partimos con un diagnóstico a precio fijo y lo construimos a la medida de tu empresa.",
};

const RECIBES = [
  { t: "Mapa de tu operación", d: "Dónde se pierde tiempo, plata e información hoy." },
  { t: "Tres prioridades ordenadas", d: "Qué resolver primero y qué puede esperar." },
  { t: "Costo y plazo de cada una", d: "Números cerrados, sin letra chica." },
  { t: "Primer paso recomendado", d: "La mejora que se paga más rápido." },
];

const HOY = [
  "La misma información se digita dos o tres veces.",
  "Consultas de clientes que se responden tarde o se pierden.",
  "Los números del negocio llegan a fin de mes, cuando ya es tarde.",
];

const A_TU_MEDIDA = [
  "Cada dato se ingresa una vez y llega solo donde se necesita.",
  "Tus clientes reciben respuesta al momento, a cualquier hora.",
  "Ves cómo va tu negocio hoy, en una sola pantalla.",
];

const PASOS = [
  {
    t: "Diagnóstico",
    d: "Conversamos con tu equipo y revisamos procesos, sistemas y urgencias. Precio fijo, plan entregado.",
  },
  {
    t: "Construcción a medida",
    d: "Partimos por la prioridad que se paga más rápido. Etapas cortas, con entregables que tu equipo prueba.",
  },
  {
    t: "Puesta en marcha y soporte",
    d: "Capacitamos a tu gente, medimos resultados y seguimos contigo en la operación.",
  },
];

type Solucion = {
  id: string;
  nombre: string;
  estado: string;
  para: string;
  promesa: string;
  puntos: [string, string][];
  adapta: string;
};

const SOLUCIONES: Solucion[] = [
  {
    id: "proycontable",
    nombre: "ProyContable",
    estado: "En piloto",
    para: "Para estudios contables y sus clientes pyme",
    promesa: "Tus clientes ven su situación financiera sin tener que llamarte.",
    puntos: [
      ["Semáforo de salud financiera.", "Verde, amarillo o rojo: el cliente entiende cómo está de un vistazo."],
      ["Reporte de valor entregado.", "Muestra todo lo que el estudio hizo por él cada mes."],
      ["Portal propio por cliente.", "Cada empresa entra a su espacio, con su información."],
      ["Datos protegidos.", "Diseñado considerando la Ley 21.719 de datos personales."],
    ],
    adapta: "cualquier firma de servicios que necesite mostrar su trabajo a sus clientes.",
  },
  {
    id: "portal-clientes",
    nombre: "Portal de clientes",
    estado: "En producción",
    para: "Para empresas de servicios con cartera de clientes",
    promesa: "Un solo lugar donde tu cliente ve cómo va su proyecto y pide ayuda.",
    puntos: [
      ["Proyectos y avance.", "Estado, próximo hito y responsable, sin preguntar por correo."],
      ["Solicitudes de soporte.", "Cada requerimiento queda registrado y con seguimiento."],
      ["Novedades y comunicados.", "Avisos que llegan a quien corresponde."],
      ["Programa de beneficios.", "Premia a los clientes que se quedan y recomiendan."],
    ],
    adapta: "agencias, constructoras, estudios, mantención y servicios técnicos.",
  },
  {
    id: "agente-whatsapp",
    nombre: "Agente de IA para WhatsApp",
    estado: "En desarrollo",
    para: "Para negocios que venden y atienden por mensaje",
    promesa: "Responde a tus clientes al momento y te avisa cuando hay una venta.",
    puntos: [
      ["Atención a toda hora.", "Contesta las preguntas frecuentes sin esperar a tu equipo."],
      ["Calificación de clientes.", "Distingue al que quiere comprar del que solo pregunta."],
      ["Derivación a una persona.", "Pasa la conversación con el resumen ya hecho."],
      ["Entrenado con tu negocio.", "Tus productos, precios, horarios y forma de hablar."],
    ],
    adapta: "ventas, agendamiento de horas, postventa y cobranza.",
  },
  {
    id: "sitios-tiendas",
    nombre: "Sitios y tiendas online",
    estado: "Entregado",
    para: "Para negocios que necesitan vender y ser encontrados",
    promesa: "Presencia digital que tu equipo puede administrar sin depender de nadie.",
    puntos: [
      ["Sitio corporativo.", "Claro, rápido y pensado para que te contacten."],
      ["Tienda online.", "Catálogo, carro y medios de pago."],
      ["Autoadministrable.", "Cambias textos, productos y precios tú mismo."],
      ["Posicionamiento en buscadores.", "Para que te encuentren cuando buscan lo que vendes."],
    ],
    adapta: "catálogos, reservas, cotizadores y portales con acceso privado.",
  },
];

// Si la solución tiene tarjeta en "Lo que construimos", el enlace lleva a
// ella; si no, abre el formulario con el tema ya elegido.
const PROBLEMAS: { cita: string; quien: string; solucion: string; destino?: string }[] = [
  {
    cita: "Se me pierden consultas de WhatsApp y respondo tarde.",
    quien: "Pymes con alto volumen de mensajes",
    solucion: "Agente de IA para WhatsApp",
    destino: "agente-whatsapp",
  },
  {
    cita: "Mis clientes no ven todo lo que hago por ellos.",
    quien: "Estudios contables y servicios profesionales",
    solucion: "Portal de clientes",
    destino: "portal-clientes",
  },
  {
    cita: "Tomo decisiones a ciegas, sin mis números al día.",
    quien: "Negocios en crecimiento",
    solucion: "Dashboard operacional",
  },
  {
    cita: "Me preocupa una multa por la Ley 21.719.",
    quien: "Empresas que manejan datos de clientes",
    solucion: "Auditoría de seguridad",
  },
  {
    cita: "Todo mi TI depende de una sola persona.",
    quien: "Empresas sin equipo de TI",
    solucion: "Soporte y continuidad",
    destino: "planes-soporte",
  },
  {
    cita: "Hacemos a mano lo que debería ser automático.",
    quien: "Operaciones con Excel y correos",
    solucion: "Automatización a medida",
  },
];

const TESTIMONIOS = [
  { cita: "Crearon nuestro sitio web de forma rápida y eficiente, respondiendo siempre a nuestras consultas.", quien: "Cliente web" },
  {
    cita: "Necesitábamos un equipo que entendiera nuestros requerimientos y respondiera a las necesidades del sitio.",
    quien: "Cliente ecommerce",
  },
];

// El socio pide ayuda desde el portal; si no ha ingresado, el login lo
// devuelve aquí después.
const PEDIR_SOPORTE = "/portal/tickets/nuevo";

const iconoCheck = (
  <svg className="mt-0.5 h-4 w-4 shrink-0 text-acento" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ceja = "text-xs font-bold uppercase tracking-[0.14em]";
const tituloSeccion = "font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-titulo sm:text-4xl lg:text-[44px]";
const contenedor = "mx-auto max-w-5xl px-4 sm:px-6";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip">
      <Encabezado />

      <main>
        {/* Hero */}
        <section id="inicio" className="bg-noche text-white">
          <div className={`${contenedor} grid gap-12 pb-20 pt-12 sm:pt-16 lg:grid-cols-[1fr_320px] lg:items-center lg:gap-14 lg:pb-24`}>
            <div>
              <p className={`${ceja} text-brand-orange`}>Tecnología a la medida de tu operación</p>
              <h1 className="mt-5 font-display text-[40px] font-extrabold leading-[1.04] tracking-tight sm:text-6xl lg:text-[64px]">
                Lo que hoy haces
                <br className="hidden sm:inline" /> a mano, en Excel
                <br className="hidden sm:inline" /> y por WhatsApp,
                <br />
                <span className="text-brand-orange">funcionando solo.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                Partimos con un diagnóstico a precio fijo. En {DIAGNOSTICO.semanas} semanas sabes qué automatizar
                primero, cuánto cuesta y en cuánto tiempo se paga. Después lo construimos a la medida de tu empresa.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <BotonAgendar origen="hero">Agendar mi diagnóstico</BotonAgendar>
                <a
                  href="#como-trabajamos"
                  className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5"
                >
                  Ver cómo trabajamos
                </a>
              </div>
              <div className="mt-8 space-y-1.5 text-xs text-white/70">
                <p className="flex flex-wrap gap-x-5 gap-y-1.5">
                  <span>Precio fijo: {DIAGNOSTICO.precio}</span>
                  <span>Sin compromiso de seguir</span>
                </p>
                <p>El plan es tuyo, lo construyas con nosotros o no</p>
              </div>
              {/* Quien llega con algo que falla hoy lo ve sin hacer scroll. */}
              <a
                href="#soporte-ayuda"
                className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-brand-orange/40 bg-brand-orange/10 py-2 pl-2 pr-4 text-sm text-white transition hover:border-brand-orange hover:bg-brand-orange/20"
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-orange text-titulo" aria-hidden="true">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v5M12 17h.01" /></svg>
                </span>
                <span>
                  ¿Se cayó tu notebook o tu sistema? <strong className="font-semibold">Soporte urgente →</strong>
                </span>
              </a>
            </div>

            <aside className="rounded-2xl bg-white p-6 text-ink shadow-2xl shadow-black/30 sm:p-7">
              <p className={`${ceja} text-acento`}>Diagnóstico ProyIT</p>
              <h2 className="mt-1.5 font-display text-xl font-bold text-titulo">Lo que recibes</h2>
              <ul className="mt-4 divide-y divide-slate-200 border-t border-slate-200">
                {RECIBES.map((r) => (
                  <li key={r.t} className="py-3.5 last:pb-0">
                    <p className="text-sm font-semibold text-titulo">{r.t}</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-muted">{r.d}</p>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        {/* El problema */}
        <section className="border-b border-slate-200 bg-surface py-20 lg:py-24">
          <div className={contenedor}>
            <p className={`${ceja} text-acento`}>El problema</p>
            <h2 className={`${tituloSeccion} mt-3 max-w-3xl`}>
              Tu empresa creció. Tus herramientas siguen siendo las del primer día.
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">
              Planillas que solo una persona entiende, pedidos que llegan por WhatsApp y se anotan a mano, sistemas que
              no conversan entre sí. Funciona, hasta que alguien falta o el volumen sube.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-[#f7f9fc] p-6 sm:p-7">
                <h3 className="font-display text-lg font-bold text-muted">Hoy</h3>
                <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted">
                  {HOY.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border-[1.5px] border-noche bg-white p-6 sm:p-7">
                <h3 className="font-display text-lg font-bold text-navy">Con una solución a tu medida</h3>
                <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-ink">
                  {A_TU_MEDIDA.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Método */}
        <section id="como-trabajamos" className="scroll-mt-20 border-b border-slate-200 py-20 lg:py-24">
          <div className={contenedor}>
            <p className={`${ceja} text-acento`}>Método ProyIT</p>
            <h2 className={`${tituloSeccion} mt-3 max-w-3xl`}>
              Primero entendemos qué te duele. Después proponemos tecnología.
            </h2>
            <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
              {PASOS.map((p, i) => (
                <li key={p.t} className="border-t-2 border-noche pt-5">
                  <p className={`${ceja} text-acento`}>Paso {i + 1}</p>
                  <h3 className="mt-2 font-display text-lg font-bold text-titulo">{p.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Lo que ya construimos */}
        <section id="lo-que-construimos" className="scroll-mt-20 border-b border-slate-200 py-20 lg:py-24">
          <div className={contenedor}>
            <p className={`${ceja} text-acento`}>Lo que ya construimos</p>
            <h2 className={`${tituloSeccion} mt-3 max-w-2xl`}>No partimos de cero. Partimos de lo que ya funciona.</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">
              Cada proyecto nuevo se arma sobre una base ya probada y se adapta a tu empresa. Por eso llegas antes a
              producción y pagas solo por lo que es propio de tu negocio.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {SOLUCIONES.map((s) => (
                <article
                  key={s.id}
                  id={s.id}
                  className="flex scroll-mt-24 flex-col rounded-2xl border border-slate-200 bg-surface p-6 sm:p-7"
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <h3 className="font-display text-xl font-bold text-titulo">{s.nombre}</h3>
                    <span className="rounded-full border border-noche px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-noche">
                      {s.estado}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] text-muted">{s.para}</p>
                  <p className="mt-2 font-semibold leading-snug text-titulo">{s.promesa}</p>
                  <ul className="mt-4 divide-y divide-slate-200 border-t border-slate-200 text-sm leading-relaxed">
                    {s.puntos.map(([t, d]) => (
                      <li key={t} className="py-3">
                        <strong className="font-semibold text-titulo">{t}</strong> <span className="text-muted">{d}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-auto border-t border-slate-200 pt-4 text-[13px] leading-relaxed text-ink">
                    <strong className="font-semibold">Se adapta a:</strong> {s.adapta}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Soporte por suscripción */}
        <section id="soporte" className="scroll-mt-20 border-b border-slate-200 py-20 lg:py-24">
          <div className={contenedor}>
            <p className={`${ceja} text-acento`}>Soporte ProyIT</p>
            <h2 className={`${tituloSeccion} mt-3 max-w-3xl`}>Tu tecnología funcionando, sin tener un área de TI.</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">
              Cuando algo falla no hay tiempo para buscar a quién llamar. Con un plan de soporte tienes un equipo que ya
              conoce tus equipos y responde en horas, no en días.
            </p>

            {/* Urgencia primero: quien llega apurado desde el home rara vez es socio. */}
            <div id="soporte-ayuda" className="mt-10 grid scroll-mt-24 gap-4 md:grid-cols-2">
              <div className="flex flex-col rounded-2xl border-[1.5px] border-brand-orange bg-white p-6 sm:p-7">
                <p className={`${ceja} text-brand-orange-dark`}>¿Aún no eres socio?</p>
                <h3 className="mt-2 font-display text-xl font-bold text-titulo">¿Tienes una urgencia ahora?</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  Igual te ayudamos. Cuéntanos qué pasó y te contactamos lo antes posible. La atención puntual se
                  cotiza antes de empezar.
                </p>
                <div className="mt-6 sm:mt-auto sm:pt-6">
                  <BotonAgendar modo="urgencia" origen="soporte" className="w-full sm:w-auto">
                    Pedir atención urgente
                  </BotonAgendar>
                </div>
              </div>
              <div className="flex flex-col rounded-2xl bg-noche p-6 text-white sm:p-7">
                <p className={`${ceja} text-brand-orange`}>Socios con plan</p>
                <h3 className="mt-2 font-display text-xl font-bold">¿Ya tienes plan de soporte?</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/75">
                  Pide ayuda desde tu portal: tu solicitud entra con la prioridad de tu plan y ves su avance en línea.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:mt-auto sm:flex-row sm:items-center sm:pt-6">
                  <Link
                    href={PEDIR_SOPORTE}
                    className="inline-flex items-center justify-center rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-titulo transition hover:bg-[#ff8c3a]"
                  >
                    Pedir soporte
                  </Link>
                  <Link href="/login" className="text-center text-sm font-semibold text-white/80 hover:text-white">
                    Ingresar al portal
                  </Link>
                </div>
              </div>

            </div>

            <div id="planes-soporte" className="mt-16 scroll-mt-24 rounded-3xl">
              <h3 className="font-display text-2xl font-bold text-titulo sm:text-3xl">Planes de soporte</h3>
              <p className="mt-2 max-w-2xl text-muted">
                Con plan, una urgencia es una llamada. Sin plan, es una búsqueda contra el tiempo.
              </p>
              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {PLANES_SOPORTE.map((p) => (
                  <article
                    key={p.id}
                    className={`relative flex flex-col rounded-2xl p-6 sm:p-7 ${
                      p.destacado ? "bg-white shadow-xl ring-2 ring-noche" : "border border-slate-200 bg-surface"
                    }`}
                  >
                    {p.destacado && (
                      <span className="absolute -top-3 left-6 rounded-full bg-brand-orange px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-titulo">
                        Recomendado
                      </span>
                    )}
                    <h4 className="font-display text-xl font-bold text-titulo">{p.nombre}</h4>
                    <p className="mt-1 text-[13px] text-muted">{p.para}</p>
                    <p className="mt-4 text-titulo">
                      <span className="font-display text-3xl font-extrabold">{p.precio}</span>{" "}
                      <span className="text-sm text-muted">{p.periodo}</span>
                    </p>
                    <p className="mt-3 rounded-lg bg-brand-orange/10 px-3 py-2 text-sm font-semibold text-brand-orange-dark">
                      {p.respuesta}
                    </p>
                    <ul className="mt-5 space-y-2.5 text-sm leading-snug text-ink">
                      {p.incluye.map((i) => (
                        <li key={i} className="flex gap-2.5">
                          {iconoCheck}
                          <span>{i}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 pt-2 lg:mt-auto">
                      <BotonAgendar
                        modo="plan"
                        origen={`plan-${p.id}`}
                        interes={interesPlan(p)}
                        variante={p.destacado ? "naranjo" : "oscuro"}
                        className="w-full"
                      >
                        Quiero el plan {p.nombre}
                      </BotonAgendar>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Qué resolvemos */}
        <section id="que-resolvemos" className="scroll-mt-20 border-b border-slate-200 bg-surface py-20 lg:py-24">
          <div className={contenedor}>
            <p className={`${ceja} text-acento`}>Qué resolvemos</p>
            <h2 className={`${tituloSeccion} mt-3`}>¿Cuál de estos problemas te suena?</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">
              Cada solución se construye para una empresa en particular. Estos son los dolores con los que más nos
              encontramos.
            </p>
            <ul className="mt-10 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
              {PROBLEMAS.map((p) => (
                <li key={p.cita} className="border-t border-slate-200 py-5">
                  <p className="font-display text-lg font-semibold leading-snug text-titulo">“{p.cita}”</p>
                  <p className="mt-1.5 text-[13px] text-muted">{p.quien}</p>
                  <p className="mt-2">
                    {p.destino ? (
                      <EnlaceSolucion destino={p.destino}>{p.solucion} →</EnlaceSolucion>
                    ) : (
                      <EnlaceAgendar interes={p.solucion}>{p.solucion} →</EnlaceAgendar>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Clientes */}
        <section id="clientes" className="scroll-mt-20 py-16 lg:py-20">
          <div className={`${contenedor} grid gap-10 md:grid-cols-2 md:gap-8`}>
            <div className="border-l-[3px] border-brand-orange pl-5">
              <p className={`${ceja} text-acento`}>En operación</p>
              <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-titulo">
                Piloto activo con NGF Auditoría y Contabilidad
              </h2>
              <p className="mt-3 leading-relaxed text-muted">
                Construimos con clientes reales, no en laboratorio. Cada solución parte de un dolor concreto y se mide
                en la operación diaria.
              </p>
            </div>
            <div className="space-y-6">
              {TESTIMONIOS.map((t) => (
                <figure key={t.quien}>
                  <blockquote className="leading-relaxed text-titulo">“{t.cita}”</blockquote>
                  <figcaption className="mt-1.5 text-[13px] text-muted">{t.quien}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Llamado final + pie */}
      <footer className="bg-noche text-white">
        <div className={`${contenedor} pt-20 lg:pt-24`}>
          <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[56px]">
            Partamos por
            <br /> entender qué te duele.
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-white/75">
            Agenda una primera conversación de 30 minutos, sin costo. Si vemos que podemos ayudarte, te proponemos el
            diagnóstico. Si no, te lo decimos.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <BotonAgendar modo="conversacion" origen="cta-final">
              Agendar conversación
            </BotonAgendar>
            {WHATSAPP_NUMERO && (
              <a
                href={enlaceWhatsApp("Hola ProyIT, quiero conversar sobre una solución para mi empresa.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5"
              >
                Escribir por WhatsApp
              </a>
            )}
          </div>

          <div className="mt-16 flex flex-col gap-4 border-t border-white/15 py-8 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Link href="/" aria-label="ProyIT, inicio" className="shrink-0">
                <Image src={logoBlanco} alt="ProyIT" className="h-7 w-auto" />
              </Link>
              <p>Tecnología cercana, implementada con criterio de negocio · Chile</p>
            </div>
            <p className="flex gap-4">
              <Link href="/login" className="hover:text-white">
                Portal clientes
              </Link>
              <Link href="/privacidad" className="hover:text-white">
                Privacidad
              </Link>
            </p>
          </div>
        </div>
      </footer>

      <AgendarDialogo />
    </div>
  );
}
