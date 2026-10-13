import Image from "next/image";
import Link from "next/link";
import logoBlanco from "../../public/brand/proyit-logo-blanco.png";
import fotoHero from "../../public/home/hero-reunion.jpg";
import fotoObra from "../../public/home/foto-obra.jpg";
import fotoCierre from "../../public/home/foto-cierre.jpg";
import fotoPasoDiagnostico from "../../public/home/paso-diagnostico.jpg";
import fotoPasoConstruccion from "../../public/home/paso-construccion.jpg";
import fotoPasoPuestaEnMarcha from "../../public/home/paso-puesta-en-marcha.jpg";
import fotoAlex from "../../public/home/alex-fundador.jpg";
import logoNgf from "../../public/home/logo-ngf.png";
import Encabezado from "@/components/home/encabezado";
import AgendarDialogo from "@/components/home/agendar";
import { AGENDA_URL, MENSAJE_WHATSAPP, WHATSAPP_VISIBLE, enlaceWhatsApp } from "@/lib/sitio";

export const metadata = {
  title: "ProyIT · Tecnología a la medida de tu operación",
  description:
    "Lo que hoy haces a mano, en Excel y por WhatsApp, funcionando solo. Partimos con una conversación de 30 minutos, sin costo, y lo construimos a la medida de tu empresa.",
};

const WA_GENERAL = enlaceWhatsApp(MENSAJE_WHATSAPP);
const WA_SOPORTE = enlaceWhatsApp("Hola, necesito soporte TI.");
const WA_FUNDADOR = enlaceWhatsApp("Hola, quiero un cupo fundador para el Agente de IA para WhatsApp.");

const GARANTIAS = ["Primera conversación sin costo", "Valor acordado antes de empezar", "Piloto activo con NGF"];

const RECIBES = [
  { t: "Mapa de tu operación", d: "Dónde se pierde tiempo, plata e información hoy." },
  { t: "Tres prioridades ordenadas", d: "Qué resolver primero y qué puede esperar." },
  { t: "Costo y plazo de cada una", d: "Números cerrados, sin letra chica." },
  { t: "Primer paso recomendado", d: "La mejora que se paga más rápido." },
];

const SOPORTE = ["Empresas: planes por cantidad de equipos", "Personas: notebooks y PCs", "Atención de urgencias"];

const PASOS = [
  {
    t: "Conversación y diagnóstico",
    d: "Partimos con 30 minutos sin costo. Si hay algo que mejorar, revisamos procesos, sistemas y urgencias con alcance y valor acordados antes de partir.",
    foto: fotoPasoDiagnostico,
    alt: "Reunión de diagnóstico con el equipo de un cliente",
  },
  {
    t: "Construcción a medida",
    d: "Partimos por la prioridad que se paga más rápido. Etapas cortas, con entregables que tu equipo prueba.",
    foto: fotoPasoConstruccion,
    alt: "Desarrollador construyendo una solución con inteligencia artificial",
  },
  {
    t: "Puesta en marcha y soporte",
    d: "Capacitamos a tu gente, medimos resultados y seguimos contigo en la operación.",
    foto: fotoPasoPuestaEnMarcha,
    alt: "Notebook mostrando la planificación de un proyecto en marcha",
  },
];

const CONSTRUIDO = [
  {
    nombre: "Agente de IA para WhatsApp",
    estado: "Cupos fundadores",
    promesa: "Responde a tus clientes al momento y te avisa cuando hay una venta.",
    puntos: [
      "Contesta a toda hora, entrenado con tus productos y precios.",
      "Distingue al que quiere comprar y te lo pasa con el resumen hecho.",
    ],
    para: "Para negocios que venden y atienden por mensaje.",
  },
  {
    nombre: "ProyContable",
    estado: "En piloto",
    promesa: "Tus clientes ven su situación financiera sin tener que llamarte.",
    puntos: [
      "Semáforo de salud financiera: verde, amarillo o rojo.",
      "Reporte mensual de todo lo que el estudio hizo por el cliente.",
    ],
    para: "Para estudios contables y sus clientes pyme.",
  },
  {
    nombre: "Portal de clientes",
    estado: "Base propia",
    promesa: "Un solo lugar donde tu cliente ve cómo va su proyecto y pide ayuda.",
    puntos: ["Proyectos con estado, próximo hito y responsable.", "Solicitudes de soporte registradas y con seguimiento."],
    para: "Para empresas de servicios con cartera de clientes.",
  },
  {
    nombre: "Sitios y tiendas online",
    estado: "Entregado",
    promesa: "Presencia digital que tu equipo puede administrar sin depender de nadie.",
    puntos: ["Sitio corporativo o tienda con carro y medios de pago.", "Autoadministrable y pensado para que te encuentren."],
    para: "Para negocios que necesitan vender y ser encontrados.",
  },
];

// Cada problema abre WhatsApp con el mensaje ya armado.
const PROBLEMAS = [
  { cita: "Se me pierden consultas de WhatsApp y respondo tarde.", quien: "Pymes con alto volumen de mensajes", solucion: "Agente de IA" },
  { cita: "Todo mi TI depende de una sola persona.", quien: "Empresas sin equipo de TI", solucion: "Soporte TI" },
  { cita: "Hacemos a mano lo que debería ser automático.", quien: "Operaciones con Excel y correos", solucion: "Automatización a medida" },
  { cita: "Tomo decisiones a ciegas, sin mis números al día.", quien: "Negocios en crecimiento", solucion: "Dashboard operacional" },
  {
    cita: "Mis clientes no ven todo lo que hago por ellos.",
    quien: "Estudios contables y servicios profesionales",
    solucion: "Portal de clientes",
  },
  { cita: "Me preocupa una multa por la Ley 21.719.", quien: "Empresas que manejan datos de clientes", solucion: "Auditoría de seguridad" },
];

const contenedor = "mx-auto max-w-[1120px] px-4 sm:px-6";
const ceja = "text-[13px] font-bold uppercase tracking-[0.12em]";
const titulo = "font-display font-extrabold tracking-[-0.02em] text-balance";
const botonNaranjo =
  "inline-flex items-center justify-center rounded-full bg-brand-orange px-[26px] py-4 font-bold text-marino transition hover:bg-[#ff8c3a]";
const botonContornoClaro =
  "inline-flex items-center justify-center rounded-full border-2 border-white/55 px-[22px] py-3.5 font-bold text-white transition hover:border-white hover:bg-white/5";
const externo = { target: "_blank", rel: "noopener noreferrer" } as const;

function Check({ color }: { color: string }) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-fondo text-[17px] leading-[1.6] text-tinta">
      <Encabezado sobreFoto />

      <main>
        {/* Hero */}
        <section id="inicio" className="relative overflow-hidden bg-marino text-white lg:min-h-[760px]">
          <Image
            src={fotoHero}
            alt=""
            priority
            fill
            sizes="100vw"
            placeholder="blur"
            className="object-cover object-[62%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,31,74,0.97)_0%,rgba(4,31,74,0.9)_38%,rgba(4,31,74,0.45)_72%,rgba(4,31,74,0.2)_100%)]" />
          <svg
            aria-hidden="true"
            viewBox="0 0 600 760"
            preserveAspectRatio="xMaxYMid slice"
            className="absolute right-0 top-0 hidden h-full w-[46%] min-w-80 sm:block"
          >
            <polygon points="600,0 600,520 250,0" fill="#2f95d3" fillOpacity="0.32" />
            <polygon points="600,240 600,760 330,760" fill="#ff7a1a" fillOpacity="0.38" />
            <polygon points="430,140 600,420 600,140" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" />
            <line x1="180" y1="760" x2="600" y2="60" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1" />
            <line x1="220" y1="760" x2="600" y2="126" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1" />
          </svg>

          <div className={`${contenedor} relative`}>
            <div className="max-w-[640px] pb-[150px] pt-[136px] sm:pb-[168px] sm:pt-[180px]">
              <p className={`${ceja} text-brand-orange`}>Tecnología a la medida de tu operación</p>
              <h1 className={`${titulo} mb-[22px] mt-[18px] text-[clamp(38px,5.4vw,68px)] leading-[1.03]`}>
                Lo que hoy haces a mano, en Excel y por WhatsApp,{" "}
                <span className="text-brand-orange">funcionando solo.</span>
              </h1>
              <p className="max-w-[32em] text-[19px] text-niebla sm:text-xl">
                Partimos con una conversación de 30 minutos, sin costo. Si vemos algo que mejorar, te proponemos un
                diagnóstico de alcance cerrado: sabes qué automatizar primero, cuánto cuesta y en cuánto tiempo se paga.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-base">
                <a href={WA_GENERAL} {...externo} className={botonNaranjo}>
                  Escríbenos por WhatsApp
                </a>
                <a href={AGENDA_URL} {...externo} className={botonContornoClaro}>
                  Agendar conversación
                </a>
              </div>
              <ul className="mt-[34px] flex flex-wrap gap-x-[26px] gap-y-2.5 text-[14.5px] text-niebla">
                {GARANTIAS.map((g) => (
                  <li key={g} className="flex items-center gap-2">
                    <Check color="#ff9a4d" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Lo que recibes */}
        <div className={`${contenedor} relative -mt-[104px]`}>
          <div className="rounded-[22px] bg-white px-6 py-7 shadow-[0_30px_60px_-24px_rgba(4,31,74,0.45)] sm:px-8">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl font-extrabold">Lo que recibes con el diagnóstico</h2>
              <p className={`${ceja} text-ceja`}>Alcance cerrado · Sin compromiso de seguir</p>
            </div>
            <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-7">
              {RECIBES.map((r, i) => (
                <li
                  key={r.t}
                  className={`border-t-[3px] pb-1 pt-4 ${i === RECIBES.length - 1 ? "border-brand-orange" : "border-navy"}`}
                >
                  <h3 className="font-bold">{r.t}</h3>
                  <p className="text-[15px] text-gris">{r.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* El problema */}
        <section className={`${contenedor} grid gap-14 pb-20 pt-24 lg:grid-cols-[1fr_1.12fr]`}>
          <div className="relative min-h-[420px] overflow-hidden rounded-[22px]">
            <Image
              src={fotoObra}
              alt="Supervisor de obra revisando información en una tablet"
              fill
              sizes="(min-width: 1024px) 480px, 100vw"
              placeholder="blur"
              className="object-cover"
            />
            <p className="absolute inset-x-5 bottom-5 rounded-[14px] bg-marino/90 px-5 py-4 text-base font-semibold text-white">
              Tecnología que llega a donde ocurre tu operación: la oficina, la bodega o la obra.
            </p>
          </div>
          <div className="min-w-0">
            <p className={`${ceja} text-ceja`}>El problema</p>
            <h2 className={`${titulo} mb-3.5 mt-3 text-[clamp(30px,3.6vw,44px)] leading-[1.06]`}>
              Tu empresa creció. Tus herramientas siguen siendo las del primer día.
            </h2>
            <p className="mb-7 text-gris">
              Planillas que solo una persona entiende, pedidos que llegan por WhatsApp y se anotan a mano, sistemas que
              no conversan entre sí. Funciona, hasta que alguien falta o el volumen sube.
            </p>
            <dl className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1 border-t border-linea py-4 sm:flex-row sm:gap-4">
                <dt className="shrink-0 text-[13px] font-bold uppercase tracking-[0.08em] text-[#8a4a12] sm:w-[120px]">Hoy</dt>
                <dd className="text-gris">
                  La misma información se digita dos o tres veces y las consultas se responden tarde.
                </dd>
              </div>
              <div className="flex flex-col gap-1 border-t border-linea py-4 sm:flex-row sm:gap-4">
                <dt className="shrink-0 text-[13px] font-bold uppercase tracking-[0.08em] text-navy sm:w-[120px]">
                  A tu medida
                </dt>
                <dd>
                  Cada dato se ingresa una vez, tus clientes reciben respuesta al momento y ves tu negocio hoy, en una
                  sola pantalla.
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Soporte TI: oferta de cierre rápido */}
        <section id="soporte" className={`${contenedor} scroll-mt-24 pb-[88px]`}>
          <div className="flex flex-wrap items-center gap-8 rounded-[22px] border-2 border-navy bg-white p-6 sm:p-9">
            <div className="min-w-0 flex-[999_1_460px]">
              <p className={`${ceja} text-ceja`}>Soporte TI</p>
              <h2 className={`${titulo} mb-3 mt-2.5 text-[clamp(28px,3.2vw,38px)] leading-[1.08]`}>
                ¿Necesitas soporte ya? Partimos esta semana.
              </h2>
              <p className="max-w-[36em] text-gris">
                Planes mensuales para que tu oficina no dependa de una sola persona, y servicio técnico para equipos con
                diagnóstico que se abona a la reparación.
              </p>
              <ul className="mt-[18px] flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
                {SOPORTE.map((s) => (
                  <li key={s} className="flex items-center gap-2">
                    <Check color="#06347a" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-3 text-base">
              <Link
                href="/soporte"
                className="rounded-full bg-navy px-6 py-4 text-center font-bold text-white transition hover:bg-marino"
              >
                Ver planes de Soporte TI
              </Link>
              <a
                href={WA_SOPORTE}
                {...externo}
                className="rounded-full border-2 border-navy px-[22px] py-3.5 text-center font-bold text-navy transition hover:bg-navy hover:text-white"
              >
                Pedir soporte por WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Método */}
        <section id="como-trabajamos" className="scroll-mt-20 border-y border-linea bg-white">
          <div className={`${contenedor} py-[88px]`}>
            <p className={`${ceja} text-ceja`}>Método ProyIT</p>
            <h2 className={`${titulo} mb-10 mt-3 max-w-[17em] text-[clamp(30px,4vw,48px)] leading-[1.05]`}>
              Primero entendemos qué te duele. Después proponemos tecnología.
            </h2>
            <ol className="flex flex-wrap gap-6">
              {PASOS.map((p, i) => {
                const oscuro = i === PASOS.length - 1;
                return (
                  <li
                    key={p.t}
                    className={`min-w-0 flex-[1_1_260px] rounded-[18px] p-7 ${oscuro ? "bg-marino text-white" : "bg-fondo"}`}
                  >
                    <Image
                      src={p.foto}
                      alt={p.alt}
                      sizes="(min-width: 1024px) 330px, 100vw"
                      placeholder="blur"
                      className="mb-[22px] h-[190px] w-full rounded-xl object-cover"
                    />
                    <p
                      className={`font-display text-5xl font-extrabold leading-none ${oscuro ? "text-brand-orange" : "text-navy"}`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mb-2 mt-4 font-display text-[23px] font-bold leading-tight">{p.t}</h3>
                    <p className={`text-base ${oscuro ? "text-niebla" : "text-gris"}`}>{p.d}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Lo que ya construimos */}
        <section id="lo-que-construimos" className={`${contenedor} scroll-mt-20 py-[88px]`}>
          <p className={`${ceja} text-ceja`}>Lo que ya construimos</p>
          <h2 className={`${titulo} mb-3.5 mt-3 max-w-[17em] text-[clamp(30px,4vw,48px)] leading-[1.05]`}>
            No partimos de cero. Partimos de lo que ya funciona.
          </h2>
          <p className="mb-[38px] max-w-[42em] text-gris">
            Cada proyecto nuevo se arma sobre una base ya probada y se adapta a tu empresa. Por eso llegas antes a
            producción y pagas solo por lo que es propio de tu negocio.
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] gap-6">
            {CONSTRUIDO.map((c) => (
              <article key={c.nombre} className="flex flex-col overflow-hidden rounded-[18px] border border-linea bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-marino px-6 py-[22px] text-white sm:px-7">
                  <h3 className="font-display text-[26px] font-bold leading-[1.1]">{c.nombre}</h3>
                  <span className="rounded-full bg-brand-orange px-3 py-1 text-[12.5px] font-bold uppercase tracking-[0.06em] text-marino">
                    {c.estado}
                  </span>
                </div>
                <div className="flex flex-grow flex-col gap-3 px-6 pb-[26px] pt-[22px] sm:px-7">
                  <p className="text-lg font-semibold leading-[1.35]">{c.promesa}</p>
                  <ul>
                    {c.puntos.map((p) => (
                      <li key={p} className="border-t border-linea py-2.5 text-base text-gris">
                        {p}
                      </li>
                    ))}
                  </ul>
                  <p className="border-t border-linea pt-3 text-[15px] text-gris">{c.para}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Cupos fundadores */}
        <section className="bg-marino text-white">
          <div className={`${contenedor} flex flex-wrap items-center gap-8 py-[72px]`}>
            <div className="min-w-0 flex-[999_1_520px]">
              <p className={`${ceja} text-brand-orange`}>Cupos fundadores · Agente de IA para WhatsApp</p>
              <h2 className={`${titulo} mb-3.5 mt-3 text-[clamp(30px,4vw,46px)] leading-[1.05]`}>
                Buscamos 5 empresas fundadoras.
              </h2>
              <p className="max-w-[36em] text-niebla">
                Implementamos el agente en tu WhatsApp con condiciones preferentes, a cambio de tu testimonio y de
                acompañarnos en la puesta a punto. Cuando se llenen los cupos, la oferta se cierra.
              </p>
            </div>
            <div className="min-w-0 flex-[1_1_240px]">
              <a href={WA_FUNDADOR} {...externo} className={`${botonNaranjo} w-full py-[18px] text-[17px]`}>
                Quiero un cupo
              </a>
            </div>
          </div>
        </section>

        {/* Qué resolvemos */}
        <section id="que-resolvemos" className="scroll-mt-20 border-b border-linea bg-white">
          <div className={`${contenedor} py-[88px]`}>
            <p className={`${ceja} text-ceja`}>Qué resolvemos</p>
            <h2 className={`${titulo} mb-3.5 mt-3 text-[clamp(30px,4vw,48px)] leading-[1.05]`}>
              ¿Cuál de estos problemas te suena?
            </h2>
            <p className="mb-[30px] max-w-[42em] text-gris">Toca el que te pase y escríbenos: el mensaje ya va armado.</p>
            <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-5">
              {PROBLEMAS.map((p) => (
                <li key={p.cita} className="flex flex-col gap-2 rounded-2xl border border-linea bg-fondo p-6">
                  <p className="font-display text-xl font-semibold leading-[1.25]">“{p.cita}”</p>
                  <p className="flex-grow text-[15px] text-gris">{p.quien}</p>
                  <a
                    href={enlaceWhatsApp(`Hola, vengo del sitio de ProyIT. ${p.cita}`)}
                    {...externo}
                    className="flex min-h-11 items-center text-[15px] font-bold text-navy hover:text-marino hover:underline"
                  >
                    {p.solucion} · escribir por WhatsApp →
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Quiénes somos: fundador + NGF */}
        <section id="quienes-somos" className={`${contenedor} flex scroll-mt-20 flex-wrap gap-12 py-[88px]`}>
          <div className="flex min-w-0 flex-[1_1_340px] flex-wrap items-start gap-6">
            <Image
              src={fotoAlex}
              alt="Alex, fundador de ProyIT"
              sizes="160px"
              placeholder="blur"
              className="h-[200px] w-40 flex-none rounded-[18px] object-cover object-[center_30%]"
            />
            <div className="min-w-0 flex-[1_1_200px]">
              <p className={`${ceja} text-ceja`}>Fundador y gerente de innovación</p>
              <h2 className="my-2.5 font-display text-[30px] font-bold leading-[1.12]">
                Innovación que se mide en tu operación, no en una presentación.
              </h2>
              <p className="text-gris">
                Soy Alex, fundador de ProyIT. La primera conversación la tienes conmigo, y sigo a cargo de tu proyecto
                hasta que funciona.
              </p>
            </div>
          </div>
          <div className="min-w-0 flex-[1_1_340px] rounded-[18px] border border-linea bg-white p-7">
            <p className={`${ceja} text-ceja`}>En operación</p>
            <h2 className="my-2.5 font-display text-[28px] font-bold leading-[1.12]">
              Piloto activo con NGF Auditoría y Contabilidad
            </h2>
            <p className="text-gris">
              Construimos con clientes reales, no en laboratorio. Cada solución parte de un dolor concreto y se mide en
              la operación diaria.
            </p>
            <Image src={logoNgf} alt="NGF Auditoría y Contabilidad" className="mt-[18px] h-24 w-auto" />
          </div>
        </section>
      </main>

      {/* Cierre + pie */}
      <footer id="contacto" className="relative overflow-hidden bg-marino text-white">
        <Image src={fotoCierre} alt="" fill sizes="100vw" placeholder="blur" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,31,74,0.96)_0%,rgba(4,31,74,0.88)_50%,rgba(4,31,74,0.55)_100%)]" />
        <svg
          aria-hidden="true"
          viewBox="0 0 400 500"
          preserveAspectRatio="xMaxYMax slice"
          className="absolute bottom-0 right-0 hidden h-full w-[34%] min-w-60 sm:block"
        >
          <polygon points="400,120 400,500 120,500" fill="#ff7a1a" fillOpacity="0.3" />
          <line x1="60" y1="500" x2="400" y2="40" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1" />
        </svg>

        <div className={`${contenedor} relative pb-10 pt-[104px]`}>
          <h2 className={`${titulo} max-w-[13em] text-[clamp(34px,5vw,60px)] leading-[1.03]`}>
            Partamos por entender qué te duele.
          </h2>
          <p className="mt-4 max-w-[36em] text-niebla">
            Una primera conversación de 30 minutos, sin costo. Si vemos que podemos ayudarte, te proponemos el
            diagnóstico. Si no, te lo decimos.
          </p>
          <div className="mt-[30px] flex flex-wrap gap-3 text-base">
            <a href={WA_GENERAL} {...externo} className={botonNaranjo}>
              Escríbenos por WhatsApp
            </a>
            <a href={AGENDA_URL} {...externo} className={botonContornoClaro}>
              Agendar conversación
            </a>
          </div>

          <div className="mt-24 flex flex-wrap items-center justify-between gap-x-7 gap-y-4 border-t border-white/[0.18] pt-[22px] text-sm text-niebla">
            <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link href="/" aria-label="ProyIT, inicio" className="shrink-0">
                <Image src={logoBlanco} alt="ProyIT" className="h-9 w-auto" />
              </Link>
              <p>Tecnología cercana, implementada con criterio de negocio · Chile</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-[22px] gap-y-2">
              <a href={WA_GENERAL} {...externo} className="py-2 underline hover:text-white">
                WhatsApp {WHATSAPP_VISIBLE}
              </a>
              <Link href="/privacidad" className="py-2 underline hover:text-white">
                Privacidad
              </Link>
              <span>RUT 77.203.782-1 · Apoquindo 6410, Las Condes</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Sigue disponible para /#agendar y /#urgencia (enlaces desde el portal). */}
      <AgendarDialogo />
    </div>
  );
}
