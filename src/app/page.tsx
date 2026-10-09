import Image from "next/image";
import Link from "next/link";
import logoBlanco from "../../public/brand/proyit-logo-blanco.png";
import fotoAsesoria from "../../public/home/foto-asesoria.jpg";
import fotoRevision from "../../public/home/foto-revision.jpg";
import fotoApreton from "../../public/home/foto-apreton.jpg";
import Encabezado from "@/components/home/encabezado";
import AgendarDialogo, { BotonAgendar, EnlaceAgendar } from "@/components/home/agendar";
import EnlaceSolucion from "@/components/home/enlace-solucion";
import {
  AvatarAutomatizacion,
  AvatarDatos,
  AvatarEstudio,
  AvatarMensajes,
  AvatarNegocio,
  AvatarTI,
  CheckDestacado,
  CheckHero,
  CheckSuave,
  FlechaHero,
  FlechaSolucion,
  IconoCosto,
  IconoMapa,
  IconoMensajes,
  IconoNotas,
  IconoPlanilla,
  IconoPrimerPaso,
  IconoPrioridades,
  IlustracionAgente,
  IlustracionConSolucion,
  IlustracionHoy,
  IlustracionPaso1,
  IlustracionPaso2,
  IlustracionPaso3,
  IlustracionPortal,
  IlustracionProyContable,
  IlustracionSoporte,
  IlustracionTienda,
  MarcaHoy,
} from "@/components/home/ilustraciones";
import { DIAGNOSTICO, PLANES_SOPORTE, WHATSAPP_NUMERO, enlaceWhatsApp, interesPlan } from "@/lib/sitio";
import { DIAGNOSTICO_OFICINA } from "@/lib/soporte";

export const metadata = {
  title: "ProyIT · Tecnología a la medida de tu operación",
  description:
    "Lo que hoy haces a mano, en Excel y por WhatsApp, funcionando solo. Partimos con un diagnóstico a precio fijo y lo construimos a la medida de tu empresa.",
};

const RECIBES = [
  { t: "Mapa de tu operación", d: "Dónde se pierde tiempo, plata e información hoy.", icono: <IconoMapa /> },
  { t: "Tres prioridades ordenadas", d: "Qué resolver primero y qué puede esperar.", icono: <IconoPrioridades /> },
  { t: "Costo y plazo de cada una", d: "Números cerrados, sin letra chica.", icono: <IconoCosto /> },
  { t: "Primer paso recomendado", d: "La mejora que se paga más rápido.", icono: <IconoPrimerPaso /> },
];

const HOY_A_MANO = [
  { t: "Planilla de Excel", d: "Solo una persona la entiende", icono: <IconoPlanilla />, giro: "-rotate-2" },
  { t: "Pedidos por WhatsApp", d: "Se anotan a mano", icono: <IconoMensajes />, giro: "rotate-[1.5deg]" },
  { t: "Notas y correos", d: "Sistemas que no conversan", icono: <IconoNotas />, giro: "-rotate-1" },
];

const FUNCIONANDO_SOLO = [
  "Cada dato se ingresa una vez",
  "El cliente recibe respuesta al momento",
  "Los números del negocio, al día",
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
    ilustracion: <IlustracionPaso1 />,
  },
  {
    t: "Construcción a medida",
    d: "Partimos por la prioridad que se paga más rápido. Etapas cortas, con entregables que tu equipo prueba.",
    ilustracion: <IlustracionPaso2 />,
  },
  {
    t: "Puesta en marcha y soporte",
    d: "Capacitamos a tu gente, medimos resultados y seguimos contigo en la operación.",
    ilustracion: <IlustracionPaso3 />,
  },
];

type Solucion = {
  id: string;
  nombre: string;
  estado: string;
  claseEstado: string;
  para: string;
  promesa: string;
  puntos: [string, string][];
  adapta: string;
  interes: string;
  ilustracion: React.ReactNode;
};

const SOLUCIONES: Solucion[] = [
  {
    id: "proycontable",
    nombre: "ProyContable",
    estado: "En piloto",
    claseEstado: "bg-durazno text-[#8a3a00]",
    para: "Para estudios contables y sus clientes pyme",
    promesa: "Tus clientes ven su situación financiera sin tener que llamarte.",
    puntos: [
      ["Semáforo de salud financiera.", "Verde, amarillo o rojo: el cliente entiende cómo está de un vistazo."],
      ["Reporte de valor entregado.", "Muestra todo lo que el estudio hizo por él cada mes."],
      ["Portal propio por cliente.", "Cada empresa entra a su espacio, con su información."],
      ["Datos protegidos.", "Diseñado considerando la Ley 21.719 de datos personales."],
    ],
    adapta: "cualquier firma de servicios que necesite mostrar su trabajo a sus clientes.",
    interes: "ProyContable",
    ilustracion: <IlustracionProyContable />,
  },
  {
    id: "portal-clientes",
    nombre: "Portal de clientes",
    estado: "En producción",
    claseEstado: "bg-celeste text-acento",
    para: "Para empresas de servicios con cartera de clientes",
    promesa: "Un solo lugar donde tu cliente ve cómo va su proyecto y pide ayuda.",
    puntos: [
      ["Proyectos y avance.", "Estado, próximo hito y responsable, sin preguntar por correo."],
      ["Solicitudes de soporte.", "Cada requerimiento queda registrado y con seguimiento."],
      ["Novedades y comunicados.", "Avisos que llegan a quien corresponde."],
      ["Programa de beneficios.", "Premia a los clientes que se quedan y recomiendan."],
    ],
    adapta: "agencias, constructoras, estudios, mantención y servicios técnicos.",
    interes: "Portal de clientes",
    ilustracion: <IlustracionPortal />,
  },
  {
    id: "agente-whatsapp",
    nombre: "Agente de IA para WhatsApp",
    estado: "En desarrollo",
    claseEstado: "bg-[#e8ecf2] text-[#33435a]",
    para: "Para negocios que venden y atienden por mensaje",
    promesa: "Responde a tus clientes al momento y te avisa cuando hay una venta.",
    puntos: [
      ["Atención a toda hora.", "Contesta las preguntas frecuentes sin esperar a tu equipo."],
      ["Calificación de clientes.", "Distingue al que quiere comprar del que solo pregunta."],
      ["Derivación a una persona.", "Pasa la conversación con el resumen ya hecho."],
      ["Entrenado con tu negocio.", "Tus productos, precios, horarios y forma de hablar."],
    ],
    adapta: "ventas, agendamiento de horas, postventa y cobranza.",
    interes: "Agente de IA para WhatsApp",
    ilustracion: <IlustracionAgente />,
  },
  {
    id: "sitios-tiendas",
    nombre: "Sitios y tiendas online",
    estado: "Entregado",
    claseEstado: "bg-noche text-white",
    para: "Para negocios que necesitan vender y ser encontrados",
    promesa: "Presencia digital que tu equipo puede administrar sin depender de nadie.",
    puntos: [
      ["Sitio corporativo.", "Claro, rápido y pensado para que te contacten."],
      ["Tienda online.", "Catálogo, carro y medios de pago."],
      ["Autoadministrable.", "Cambias textos, productos y precios tú mismo."],
      ["Posicionamiento en buscadores.", "Para que te encuentren cuando buscan lo que vendes."],
    ],
    adapta: "catálogos, reservas, cotizadores y portales con acceso privado.",
    interes: "Sitio o tienda online",
    ilustracion: <IlustracionTienda />,
  },
];

// Si la solución tiene tarjeta en "Lo que construimos", el enlace lleva a
// ella; si no, abre el formulario con el tema ya elegido.
const PROBLEMAS: { cita: string; quien: string; solucion: string; destino?: string; avatar: React.ReactNode }[] = [
  {
    cita: "Se me pierden consultas de WhatsApp y respondo tarde.",
    quien: "Pymes con alto volumen de mensajes",
    solucion: "Agente de IA para WhatsApp",
    destino: "agente-whatsapp",
    avatar: <AvatarMensajes />,
  },
  {
    cita: "Mis clientes no ven todo lo que hago por ellos.",
    quien: "Estudios contables y servicios profesionales",
    solucion: "Portal de clientes",
    destino: "portal-clientes",
    avatar: <AvatarEstudio />,
  },
  {
    cita: "Tomo decisiones a ciegas, sin mis números al día.",
    quien: "Negocios en crecimiento",
    solucion: "Dashboard operacional",
    avatar: <AvatarNegocio />,
  },
  {
    cita: "Me preocupa una multa por la Ley 21.719.",
    quien: "Empresas que manejan datos de clientes",
    solucion: "Auditoría de seguridad",
    avatar: <AvatarDatos />,
  },
  {
    cita: "Todo mi TI depende de una sola persona.",
    quien: "Empresas sin equipo de TI",
    solucion: "Soporte y continuidad",
    destino: "planes-soporte",
    avatar: <AvatarTI />,
  },
  {
    cita: "Hacemos a mano lo que debería ser automático.",
    quien: "Operaciones con Excel y correos",
    solucion: "Automatización a medida",
    avatar: <AvatarAutomatizacion />,
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

const ceja = "text-xs font-bold uppercase tracking-[0.14em] text-brand-orange-text";
const tituloSeccion =
  "font-display text-[30px] font-extrabold leading-[1.1] tracking-tight text-titulo text-balance sm:text-4xl lg:text-[44px]";
const bajada = "text-lg leading-relaxed text-texto-suave";
const contenedor = "mx-auto max-w-[1180px] px-4 sm:px-6";
const seccion = "scroll-mt-20 py-20 lg:py-24";
const elevar = "transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(7,49,125,0.18)] motion-reduce:hover:translate-y-0";
const botonContornoOscuro = `inline-flex items-center justify-center rounded-full border border-noche px-6 py-3 text-sm font-semibold text-noche hover:bg-noche hover:text-white ${elevar}`;
const tarjetaSolucion = "flex min-h-11 items-center justify-between gap-3 rounded-[14px] bg-surface px-4 py-3 text-left text-titulo transition hover:bg-celeste";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip">
      <Encabezado />

      <main>
        {/* Hero */}
        <section id="inicio" className="bg-noche pb-20 pt-12 text-white sm:pt-14 lg:pb-24">
          <div className={`${contenedor} flex flex-col gap-14`}>
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div className="flex flex-col gap-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-orange">
                  Tecnología a la medida de tu operación
                </p>
                <h1 className="font-display text-[36px] font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[60px]">
                  Lo que hoy haces a mano, en Excel y por WhatsApp,{" "}
                  <span className="text-brand-orange">funcionando solo.</span>
                </h1>
                <p className="max-w-[540px] text-lg leading-relaxed text-[#c9d4e6]">
                  Partimos con un diagnóstico a precio fijo. En {DIAGNOSTICO.semanas} semanas sabes qué automatizar
                  primero, cuánto cuesta y en cuánto tiempo se paga. Después lo construimos a la medida de tu empresa.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <BotonAgendar origen="hero" className="px-7 py-3.5">
                    Agendar mi diagnóstico
                  </BotonAgendar>
                  <a
                    href="#como-trabajamos"
                    className={`inline-flex items-center justify-center rounded-full border border-[#7fa6de] px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/5 ${elevar}`}
                  >
                    Ver cómo trabajamos
                  </a>
                </div>
                <p className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#c9d4e6]">
                  <span>Precio fijo: {DIAGNOSTICO.precio}</span>
                  <span>Sin compromiso de seguir</span>
                  <span>El plan es tuyo, lo construyas con nosotros o no</span>
                </p>
                {/* Quien llega con algo que falla hoy lo ve sin hacer scroll. */}
                <a
                  href="#soporte-ayuda"
                  className="self-start rounded-full border border-[#a8571f] bg-[#0a3c8f] px-4 py-3 text-sm text-white transition hover:border-brand-orange"
                >
                  ¿Se cayó tu notebook o tu sistema? <strong className="font-semibold text-[#ff9a4d]">Soporte urgente →</strong>
                </a>
              </div>

              {/* Antes y después */}
              <div
                role="img"
                aria-label="Antes: planilla de Excel, pedidos por WhatsApp y notas a mano. Después: todo registrado y respondido automáticamente en un solo lugar."
                className="flex flex-col items-stretch gap-5 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-3.5">
                  <span className="text-xs font-bold tracking-[0.14em] text-[#d5e4f7]">HOY, A MANO</span>
                  {HOY_A_MANO.map((h) => (
                    <div
                      key={h.t}
                      className={`${h.giro} flex items-center gap-3 rounded-2xl border border-dashed border-[#9cc4ee] bg-noche-claro px-4 py-3.5`}
                    >
                      {h.icono}
                      <span className="flex flex-col">
                        <span className="text-[15px] font-semibold text-white">{h.t}</span>
                        <span className="text-[13px] text-[#d5e4f7]">{h.d}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <span className="mx-auto rotate-90 sm:rotate-0">
                  <FlechaHero />
                </span>
                <div className="flex min-w-0 flex-[1.2] flex-col gap-3 rounded-[22px] bg-white p-5 shadow-[0_24px_48px_rgba(2,20,60,0.35)] sm:p-6">
                  <span className="self-start rounded-full bg-brand-orange px-2.5 py-1 text-[11px] font-bold tracking-[0.1em] text-noche">
                    FUNCIONANDO SOLO
                  </span>
                  <span className="font-display text-xl font-bold text-noche">Tu operación en una sola pantalla</span>
                  {FUNCIONANDO_SOLO.map((t) => (
                    <span key={t} className="flex items-center gap-2.5 rounded-xl bg-surface px-3.5 py-3 text-[15px] font-medium text-noche">
                      <CheckHero />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Lo que recibes */}
            <div className="flex flex-col gap-6 rounded-3xl bg-white p-6 text-ink sm:p-8">
              <div>
                <p className={ceja}>Diagnóstico ProyIT</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-titulo">Lo que recibes</h2>
              </div>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {RECIBES.map((r) => (
                  <li key={r.t} className="flex flex-col gap-2.5 rounded-[18px] bg-surface p-5">
                    {r.icono}
                    <h3 className="font-display text-lg font-bold text-titulo">{r.t}</h3>
                    <p className="text-[15px] text-texto-suave">{r.d}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* El problema */}
        <section className={`${seccion} bg-surface`}>
          <div className={`${contenedor} flex flex-col gap-12`}>
            <div className="flex max-w-[760px] flex-col gap-4">
              <p className={ceja}>El problema</p>
              <h2 className={tituloSeccion}>Tu empresa creció. Tus herramientas siguen siendo las del primer día.</h2>
              <p className={bajada}>
                Planillas que solo una persona entiende, pedidos que llegan por WhatsApp y se anotan a mano, sistemas que
                no conversan entre sí. Funciona, hasta que alguien falta o el volumen sube.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-5 rounded-3xl border border-[#d9e1ec] bg-white p-6 sm:p-8">
                <IlustracionHoy />
                <h3 className="font-display text-[22px] font-bold text-texto-suave">Hoy</h3>
                <ul className="flex flex-col gap-3 text-texto-suave">
                  {HOY.map((t) => (
                    <li key={t} className="flex gap-3">
                      <MarcaHoy />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-5 rounded-3xl border-2 border-acento bg-white p-6 sm:p-8">
                <IlustracionConSolucion />
                <h3 className="font-display text-[22px] font-bold text-acento">Con una solución a tu medida</h3>
                <ul className="flex flex-col gap-3 text-ink">
                  {A_TU_MEDIDA.map((t) => (
                    <li key={t} className="flex gap-3">
                      <CheckSuave />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Método */}
        <section id="como-trabajamos" className={seccion}>
          <div className={`${contenedor} flex flex-col gap-12`}>
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
              <div className="flex flex-col gap-4">
                <p className={ceja}>Método ProyIT</p>
                <h2 className={tituloSeccion}>Primero entendemos qué te duele. Después proponemos tecnología.</h2>
              </div>
              <Image
                src={fotoAsesoria}
                alt="Dos personas revisan juntas un documento durante un diagnóstico"
                sizes="(min-width: 1024px) 560px, 100vw"
                className="aspect-video w-full rounded-3xl object-cover"
              />
            </div>
            <ol className="grid gap-6 md:grid-cols-3">
              {PASOS.map((p, i) => (
                <li key={p.t} className="flex flex-col gap-3.5 rounded-3xl bg-surface p-6 sm:p-7">
                  {p.ilustracion}
                  <p className={ceja}>Paso {i + 1}</p>
                  <h3 className="font-display text-[22px] font-bold text-titulo">{p.t}</h3>
                  <p className="text-texto-suave">{p.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Lo que ya construimos */}
        <section id="lo-que-construimos" className={`${seccion} bg-surface`}>
          <div className={`${contenedor} flex flex-col gap-14`}>
            <div className="flex max-w-[760px] flex-col gap-4">
              <p className={ceja}>Lo que ya construimos</p>
              <h2 className={tituloSeccion}>No partimos de cero. Partimos de lo que ya funciona.</h2>
              <p className={bajada}>
                Cada proyecto nuevo se arma sobre una base ya probada y se adapta a tu empresa. Por eso llegas antes a
                producción y pagas solo por lo que es propio de tu negocio.
              </p>
            </div>

            {SOLUCIONES.map((s, i) => (
              <article
                key={s.id}
                id={s.id}
                className={`grid scroll-mt-24 items-center gap-8 rounded-[28px] bg-white p-6 transition hover:shadow-[0_16px_40px_rgba(7,49,125,0.12)] sm:p-8 lg:grid-cols-2 lg:gap-12`}
              >
                <div className={`flex flex-col gap-3.5 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-[28px] font-extrabold text-titulo">{s.nombre}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] ${s.claseEstado}`}>
                      {s.estado}
                    </span>
                  </div>
                  <p className="text-sm text-texto-suave">{s.para}</p>
                  <p className="text-[19px] font-semibold text-titulo">{s.promesa}</p>
                  <ul className="flex flex-col gap-2.5 text-[15px] text-[#33435a]">
                    {s.puntos.map(([t, d]) => (
                      <li key={t} className="flex gap-3">
                        <CheckSuave />
                        <span>
                          <strong className="font-semibold">{t}</strong> {d}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-texto-suave">
                    <strong className="font-semibold">Se adapta a:</strong> {s.adapta}
                  </p>
                  <BotonAgendar
                    origen={`solucion-${s.id}`}
                    interes={s.interes}
                    variante="contornoOscuro"
                    className="mt-1.5 self-start"
                  >
                    Quiero algo así para mi empresa →
                  </BotonAgendar>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>{s.ilustracion}</div>
              </article>
            ))}
          </div>
        </section>

        {/* Soporte */}
        <section id="soporte" className={seccion}>
          <div className={`${contenedor} flex flex-col gap-12`}>
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_minmax(0,440px)] lg:gap-14">
              <div className="flex flex-col gap-4">
                <p className={ceja}>Soporte ProyIT</p>
                <h2 className={tituloSeccion}>Tu tecnología funcionando, sin tener un área de TI.</h2>
                <p className={bajada}>
                  Cuando algo falla no hay tiempo para buscar a quién llamar. Con un plan de soporte tienes un equipo que
                  ya conoce tus equipos y responde en horas, no en días.
                </p>
              </div>
              <IlustracionSoporte />
            </div>

            {/* Urgencia primero: quien llega apurado desde el home rara vez es socio. */}
            <div id="soporte-ayuda" className="grid scroll-mt-24 gap-6 md:grid-cols-2">
              <div className="flex flex-col items-start gap-3 rounded-3xl border border-[#f3c9a4] bg-[#fff4ea] p-6 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a3a00]">¿Aún no eres socio?</p>
                <h3 className="font-display text-[22px] font-bold text-titulo">¿Tienes una urgencia ahora?</h3>
                <p className="text-[#33435a]">
                  Igual te ayudamos. Cuéntanos qué pasó y te contactamos lo antes posible. La atención puntual se cotiza
                  antes de empezar.
                </p>
                <BotonAgendar modo="urgencia" origen="soporte" className="mt-2">
                  Pedir atención urgente
                </BotonAgendar>
              </div>
              <div className="flex flex-col items-start gap-3 rounded-3xl border border-[#d9e1ec] bg-surface p-6 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-acento">Socios con plan</p>
                <h3 className="font-display text-[22px] font-bold text-titulo">¿Ya tienes plan de soporte?</h3>
                <p className="text-[#33435a]">
                  Pide ayuda desde tu portal: tu solicitud entra con la prioridad de tu plan y ves su avance en línea.
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <Link
                    href={PEDIR_SOPORTE}
                    className={`inline-flex items-center justify-center rounded-full bg-noche px-6 py-3 text-sm font-semibold text-white hover:bg-navy ${elevar}`}
                  >
                    Pedir soporte
                  </Link>
                  <Link href="/login" className={botonContornoOscuro}>
                    Ingresar al portal
                  </Link>
                </div>
              </div>
            </div>

            <div id="planes-soporte" className="flex scroll-mt-24 flex-col gap-8">
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                <div className="flex max-w-[760px] flex-col gap-2">
                  <h3 className="font-display text-[30px] font-extrabold text-titulo">Planes de soporte para empresas</h3>
                  <p className={bajada}>
                    Con plan, una urgencia es una llamada. Y pagas{" "}
                    <strong className="text-brand-orange-text">hasta 21% menos</strong> que por cada servicio suelto.
                  </p>
                </div>
                <Link href="/soporte#empresas" className="py-3 font-semibold text-acento hover:text-brand-orange-text">
                  Comparar planes en detalle →
                </Link>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {PLANES_SOPORTE.map((p) => {
                  const oscuro = p.destacado;
                  return (
                    <article
                      key={p.id}
                      className={`flex flex-col gap-4 rounded-3xl p-6 transition hover:shadow-[0_16px_40px_rgba(7,49,125,0.12)] sm:p-7 ${
                        oscuro ? "bg-noche text-white" : "border border-[#d9e1ec] bg-white"
                      }`}
                    >
                      {oscuro && (
                        <span className="self-start rounded-full bg-brand-orange px-2.5 py-1 text-[11px] font-bold tracking-[0.1em] text-noche">
                          MÁS ELEGIDO
                        </span>
                      )}
                      <div className="flex flex-col gap-1">
                        <h4 className={`font-display text-[26px] font-extrabold ${oscuro ? "" : "text-titulo"}`}>{p.nombre}</h4>
                        <p className={`text-sm ${oscuro ? "text-[#c9d4e6]" : "text-texto-suave"}`}>{p.equipos}</p>
                      </div>
                      <p className={`font-display text-[34px] font-extrabold ${oscuro ? "" : "text-titulo"}`}>
                        {p.precio}{" "}
                        <span className={`font-sans text-sm font-normal ${oscuro ? "text-[#c9d4e6]" : "text-texto-suave"}`}>
                          / mes
                        </span>
                      </p>
                      <p
                        className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
                          oscuro ? "bg-noche-claro text-white" : "bg-surface text-acento"
                        }`}
                      >
                        {p.respuesta}
                      </p>
                      <ul className={`flex flex-grow flex-col gap-2.5 text-[15px] ${oscuro ? "text-[#e3eaf5]" : "text-[#33435a]"}`}>
                        {p.incluye.map((i) => (
                          <li key={i} className="flex gap-3">
                            {oscuro ? <CheckDestacado /> : <CheckSuave />}
                            <span>{i}</span>
                          </li>
                        ))}
                      </ul>
                      <BotonAgendar
                        modo="plan"
                        origen={`plan-${p.id}`}
                        interes={interesPlan(p)}
                        variante={oscuro ? "naranjo" : "contornoOscuro"}
                        className="w-full"
                      >
                        Quiero el plan {p.nombre}
                      </BotonAgendar>
                    </article>
                  );
                })}
              </div>

              <p className="text-[15px] text-texto-suave">
                Valores IVA incluido. Partimos con un diagnóstico TI de tu oficina por{" "}
                <strong className="text-titulo">{DIAGNOSTICO_OFICINA}</strong>, que se descuenta de la primera
                mensualidad si contratas un plan.
              </p>
            </div>

            {/* El detalle (urgencias, reparación de equipos y precios) vive en /soporte. */}
            <div className="flex flex-col gap-4 rounded-3xl bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-7">
              <div className="flex flex-col gap-1.5">
                <h3 className="font-display text-xl font-bold text-titulo">
                  ¿Hay que reparar un notebook o necesitas atención de noche o en feriado?
                </h3>
                <p className="text-texto-suave">
                  Revisa los precios de reparación, los recargos por urgencia y cómo el diagnóstico se descuenta de la
                  reparación.
                </p>
              </div>
              <Link
                href="/soporte"
                className={`inline-flex shrink-0 items-center justify-center rounded-full bg-noche px-6 py-3.5 text-sm font-semibold text-white hover:bg-navy ${elevar}`}
              >
                Ver soporte y precios →
              </Link>
            </div>
          </div>
        </section>

        {/* Qué resolvemos */}
        <section id="que-resolvemos" className={`${seccion} bg-surface`}>
          <div className={`${contenedor} flex flex-col gap-12`}>
            <div className="flex max-w-[760px] flex-col gap-4">
              <p className={ceja}>Qué resolvemos</p>
              <h2 className={tituloSeccion}>¿Cuál de estos problemas te suena?</h2>
              <p className={bajada}>
                Cada solución se construye para una empresa en particular. Estos son los dolores con los que más nos
                encontramos.
              </p>
            </div>
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {PROBLEMAS.map((p) => {
                const contenido = (
                  <>
                    <span className="flex flex-col">
                      <span className="text-[11px] font-bold tracking-[0.1em] text-brand-orange-text">LA SOLUCIÓN</span>
                      <span className="font-semibold">{p.solucion}</span>
                    </span>
                    <FlechaSolucion />
                  </>
                );
                return (
                  <li key={p.cita} className="flex flex-col gap-4 rounded-[24px_24px_24px_6px] bg-white p-6 sm:p-7">
                    <p className="flex-grow font-display text-[21px] font-bold leading-tight text-titulo">“{p.cita}”</p>
                    <div className="flex items-center gap-3">
                      {p.avatar}
                      <p className="text-sm text-texto-suave">{p.quien}</p>
                    </div>
                    {p.destino ? (
                      <EnlaceSolucion destino={p.destino} className={tarjetaSolucion}>
                        {contenido}
                      </EnlaceSolucion>
                    ) : (
                      <EnlaceAgendar interes={p.solucion} className={tarjetaSolucion}>
                        {contenido}
                      </EnlaceAgendar>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Clientes */}
        <section id="clientes" className="scroll-mt-20 py-20 lg:py-[88px]">
          <div className={`${contenedor} grid items-start gap-10 lg:grid-cols-2 lg:gap-14`}>
            <div className="flex flex-col gap-4">
              <p className={ceja}>En operación</p>
              <h2 className="font-display text-[28px] font-extrabold leading-[1.12] text-titulo text-balance sm:text-[38px]">
                Piloto activo con NGF Auditoría y Contabilidad
              </h2>
              <p className={bajada}>
                Construimos con clientes reales, no en laboratorio. Cada solución parte de un dolor concreto y se mide en
                la operación diaria.
              </p>
              <Image
                src={fotoRevision}
                alt="Dos personas revisan informes financieros frente a un notebook"
                sizes="(min-width: 1024px) 560px, 100vw"
                className="mt-2 aspect-video w-full rounded-[20px] object-cover"
              />
            </div>
            <div className="flex flex-col gap-6">
              {TESTIMONIOS.map((t) => (
                <figure key={t.quien} className="flex flex-col gap-4 rounded-[24px_24px_24px_6px] bg-surface p-6 sm:p-7">
                  <blockquote className="font-display text-[21px] font-semibold leading-snug text-titulo">“{t.cita}”</blockquote>
                  <figcaption className="text-sm text-texto-suave">{t.quien}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Llamado final + pie */}
      <footer id="contacto" className="bg-noche pt-20 text-white lg:pt-[88px]">
        <div className={`${contenedor} grid items-center gap-10 lg:grid-cols-2 lg:gap-14`}>
          <div className="flex flex-col items-start gap-5">
            <h2 className="font-display text-[32px] font-extrabold leading-[1.06] tracking-tight text-balance sm:text-5xl lg:text-[52px]">
              Partamos por entender <span className="text-brand-orange">qué te duele.</span>
            </h2>
            <p className="max-w-[520px] text-lg leading-relaxed text-[#c9d4e6]">
              Agenda una primera conversación de 30 minutos, sin costo. Si vemos que podemos ayudarte, te proponemos el
              diagnóstico. Si no, te lo decimos.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <BotonAgendar modo="conversacion" origen="cta-final" className="px-7 py-4">
                Agendar conversación
              </BotonAgendar>
              {WHATSAPP_NUMERO && (
                <a
                  href={enlaceWhatsApp("Hola ProyIT, quiero conversar sobre una solución para mi empresa.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-4 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5"
                >
                  Escribir por WhatsApp
                </a>
              )}
            </div>
          </div>
          <div className="relative pb-5 pl-5">
            <div className="absolute bottom-0 left-0 h-[62%] w-[62%] rounded-[28px] bg-brand-orange" aria-hidden="true" />
            <Image
              src={fotoApreton}
              alt="Una asesora y un cliente se dan la mano al terminar una conversación"
              sizes="(min-width: 1024px) 560px, 100vw"
              className="relative aspect-[3/2] w-full rounded-[28px] object-cover"
            />
          </div>
        </div>

        <div className="mt-14 border-t border-[#2a55a3]">
          <div
            className={`${contenedor} flex flex-col gap-4 py-7 text-sm text-[#c9d4e6] sm:flex-row sm:items-center sm:justify-between`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <Link href="/" aria-label="ProyIT, inicio" className="shrink-0">
                <Image src={logoBlanco} alt="ProyIT" className="h-9 w-auto" />
              </Link>
              <p>Tecnología cercana, implementada con criterio de negocio · Chile</p>
            </div>
            <p className="flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/soporte" className="py-2 text-white hover:text-brand-orange">
                Soporte TI
              </Link>
              <Link href="/login" className="py-2 text-white hover:text-brand-orange">
                Portal clientes
              </Link>
              <Link href="/privacidad" className="py-2 text-white hover:text-brand-orange">
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
