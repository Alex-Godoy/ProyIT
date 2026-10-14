import Image from "next/image";
import Link from "next/link";
import logoBlanco from "../../../public/brand/proyit-logo-blanco.png";
import fotoCierre from "../../../public/home/foto-cierre.jpg";
import EnlaceWhatsApp from "@/components/home/enlace-whatsapp";
import { WHATSAPP_VISIBLE, MENSAJE_WHATSAPP, type BotonWhatsApp } from "@/lib/sitio";
import { PROTOCOLO_DATOS, RECARGOS_URGENCIA, clp, conRecargo, type EjemploUrgencia } from "@/lib/soporte";

// Piezas compartidas de /soporte (empresas) y /reparaciones (personas). Siguen
// el diseño del home: portada azul marino con triángulos de marca, tarjeta
// blanca montada sobre la portada y cierre con foto.

export const contenedor = "mx-auto max-w-[1120px] px-4 sm:px-6";
export const ceja = "text-[13px] font-bold uppercase tracking-[0.12em]";
export const titulo = "font-display font-extrabold tracking-[-0.02em] text-balance";
export const tituloSeccion = `${titulo} mt-3 text-[clamp(30px,4vw,46px)] leading-[1.06]`;
export const botonNaranjo =
  "inline-flex items-center justify-center rounded-full bg-brand-orange px-[26px] py-4 text-center font-bold text-marino transition hover:bg-[#ff8c3a]";
export const botonContornoClaro =
  "inline-flex items-center justify-center rounded-full border-2 border-white/55 px-[22px] py-3.5 text-center font-bold text-white transition hover:border-white hover:bg-white/5";
export const botonNavy =
  "inline-flex items-center justify-center rounded-full bg-navy px-6 py-4 text-center font-bold text-white transition hover:bg-marino";
export const botonUrgente =
  "inline-flex items-center justify-center rounded-full bg-brand-orange-text px-6 py-4 text-center font-bold text-white transition hover:bg-brand-orange-text-dark";

export function Check({ color, className = "" }: { color: string; className?: string }) {
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
      className={`shrink-0 ${className}`}
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export function Portada({
  ruta,
  cejaTexto,
  children,
  bajada,
  accion,
  garantias,
  desvio,
}: {
  ruta: string;
  cejaTexto: string;
  children: React.ReactNode; // el H1
  bajada: string;
  accion: React.ReactNode;
  garantias: string[];
  desvio: React.ReactNode; // enlace a la otra página (empresas ↔ personas)
}) {
  return (
    <section className="relative overflow-hidden bg-marino text-white">
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
        <div className="max-w-[660px] pb-[150px] pt-[112px] sm:pb-[160px] sm:pt-[140px]">
          <nav aria-label="Ruta" className="text-sm text-niebla">
            <Link href="/" className="hover:text-white hover:underline">
              Inicio
            </Link>{" "}
            <span aria-hidden="true">/</span> <span className="font-semibold text-white">{ruta}</span>
          </nav>
          <p className={`${ceja} mt-8 text-brand-orange`}>{cejaTexto}</p>
          <h1 className={`${titulo} mb-[22px] mt-[18px] text-[clamp(36px,5vw,62px)] leading-[1.04]`}>{children}</h1>
          <p className="max-w-[32em] text-[19px] text-niebla">{bajada}</p>
          <div className="mt-8 text-base">{accion}</div>
          <ul className="mt-[30px] flex flex-wrap gap-x-[26px] gap-y-2.5 text-[14.5px] text-niebla">
            {garantias.map((g) => (
              <li key={g} className="flex items-center gap-2">
                <Check color="#ff9a4d" />
                {g}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[15px] text-niebla">{desvio}</p>
        </div>
      </div>
    </section>
  );
}

// Tarjeta blanca que se monta sobre el borde inferior de la portada.
export function TarjetaPortada({
  tituloTexto,
  cejaTexto,
  items,
}: {
  tituloTexto: string;
  cejaTexto: string;
  items: { t: string; d: string }[];
}) {
  return (
    <div className={`${contenedor} relative -mt-[104px]`}>
      <div className="rounded-[22px] bg-white px-6 py-7 shadow-[0_30px_60px_-24px_rgba(4,31,74,0.45)] sm:px-8">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl font-extrabold">{tituloTexto}</h2>
          <p className={`${ceja} text-ceja`}>{cejaTexto}</p>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-7">
          {items.map((r, i) => (
            <li
              key={r.t}
              className={`border-t-[3px] pb-1 pt-4 ${i === items.length - 1 ? "border-brand-orange" : "border-navy"}`}
            >
              <h3 className="font-bold">{r.t}</h3>
              <p className="text-[15px] text-gris">{r.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const nombreHorario = ["Hábil", "Fuera de horario", "Domingos y feriados"];

// Recargos por horario y ejemplos de precio. En empresas se agrega la columna
// "Con plan"; en personas, solo se muestra el precio sin plan.
export function TablasUrgencia({ ejemplos, conPlan }: { ejemplos: EjemploUrgencia[]; conPlan: boolean }) {
  return (
    <>
      <div className="mt-10 overflow-x-auto rounded-[18px] border border-linea bg-white">
        <table className="w-full min-w-[560px] text-left text-[15px]">
          <caption className="sr-only">Recargo por atención urgente según horario</caption>
          <thead className="border-b border-linea text-xs font-bold uppercase tracking-wider text-gris">
            <tr>
              <th scope="col" className="px-5 py-3.5">Horario</th>
              <th scope="col" className="px-5 py-3.5 text-right">{conPlan ? "Sin plan" : "Recargo"}</th>
              {conPlan && (
                <th scope="col" className="bg-niebla/50 px-5 py-3.5 text-right text-navy">
                  Con plan
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-linea">
            {RECARGOS_URGENCIA.map((r) => (
              <tr key={r.horario}>
                <th scope="row" className="px-5 py-4 align-top font-normal">
                  <span className="block font-bold text-tinta">{r.horario}</span>
                  <span className="block text-sm text-gris">{r.cuando}</span>
                </th>
                <td className="px-5 py-4 text-right align-top font-display text-2xl font-extrabold text-tinta">+{r.sinPlan}%</td>
                {conPlan && (
                  <td className="bg-niebla/50 px-5 py-4 text-right align-top font-display text-2xl font-extrabold text-navy">
                    +{r.conPlan}%
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 overflow-x-auto rounded-[18px] border border-linea bg-white">
        <table className="w-full min-w-[640px] text-left text-[15px]">
          <caption className="sr-only">Ejemplos de precios con recargo por urgencia, IVA incluido</caption>
          <thead className="border-b border-linea text-xs font-bold uppercase tracking-wider text-gris">
            <tr>
              <th scope="col" className="px-5 py-3.5">Ejemplos · IVA incluido</th>
              <th scope="col" className="px-5 py-3.5 text-right">Normal</th>
              {nombreHorario.map((h) => (
                <th key={h} scope="col" className="px-5 py-3.5 text-right">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-linea">
            {ejemplos.map((e) => (
              <tr key={e.servicio} className={e.conPlan ? "bg-niebla/50" : ""}>
                <th scope="row" className={`px-5 py-4 font-bold ${e.conPlan ? "text-navy" : "text-tinta"}`}>
                  {e.servicio}
                </th>
                <td className="whitespace-nowrap px-5 py-4 text-right text-gris">{clp(e.base)}</td>
                {RECARGOS_URGENCIA.map((r) => {
                  const pct = e.conPlan ? r.conPlan : r.sinPlan;
                  return (
                    <td key={r.horario} className="whitespace-nowrap px-5 py-4 text-right font-bold text-tinta">
                      {clp(conRecargo(e.base, pct))}
                      <span className="block text-xs font-medium text-gris">+{pct}%</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// Protocolo de confidencialidad: responde "¿mis archivos están seguros?" y
// conecta con la auditoría de seguridad (Ley 21.719).
export function ProtocoloDatos({ boton }: { boton: BotonWhatsApp }) {
  return (
    <section className="border-y border-linea bg-white">
      <div className={`${contenedor} grid gap-10 py-[88px] lg:grid-cols-[0.9fr_1.1fr]`}>
        <div className="min-w-0">
          <p className={`${ceja} text-ceja`}>Tus datos, protegidos</p>
          <h2 className={tituloSeccion}>Tu equipo tiene tu información. La tratamos como exige la ley.</h2>
          <p className="mt-4 text-gris">
            Seguimos un protocolo de confidencialidad pensado para la Ley 21.719 de protección de datos personales. Es
            el mismo criterio con que auditamos la seguridad de empresas.
          </p>
          <EnlaceWhatsApp
            boton={boton}
            mensaje="Hola, vengo del sitio de ProyIT y quiero revisar cómo protege mi empresa los datos de sus clientes (Ley 21.719)."
            className="mt-6 inline-flex min-h-11 items-center text-[15px] font-bold text-navy hover:text-marino hover:underline"
          >
            ¿Tu empresa maneja datos de clientes? Conversemos sobre una auditoría →
          </EnlaceWhatsApp>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {PROTOCOLO_DATOS.map((p, i) => (
            <li key={p.t} className="rounded-[18px] bg-fondo p-6">
              <p className={`font-display text-3xl font-extrabold leading-none ${i === PROTOCOLO_DATOS.length - 1 ? "text-brand-orange-text" : "text-navy"}`}>
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mb-1.5 mt-3 font-display text-xl font-bold">{p.t}</h3>
              <p className="text-[15px] text-gris">{p.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// Tarjeta que lleva al siguiente peldaño (personas → empresas → a medida). Mismo
// estilo que la tarjeta de Soporte TI del home.
export function SiguientePaso({
  cejaTexto,
  tituloTexto,
  bajada,
  href,
  boton,
}: {
  cejaTexto: string;
  tituloTexto: string;
  bajada: string;
  href: string;
  boton: string;
}) {
  return (
    <section className={`${contenedor} py-[72px]`}>
      <div className="flex flex-wrap items-center gap-8 rounded-[22px] border-2 border-navy bg-white p-6 sm:p-9">
        <div className="min-w-0 flex-[999_1_460px]">
          <p className={`${ceja} text-ceja`}>{cejaTexto}</p>
          <h2 className={`${titulo} mb-3 mt-2.5 text-[clamp(28px,3.2vw,38px)] leading-[1.08]`}>{tituloTexto}</h2>
          <p className="max-w-[36em] text-gris">{bajada}</p>
        </div>
        <div className="min-w-0 flex-[1_1_240px]">
          <Link href={href} className={`${botonNavy} w-full`}>
            {boton}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Preguntas({ preguntas }: { preguntas: { p: string; r: string }[] }) {
  return (
    <section className="border-t border-linea bg-white">
      <div className={`${contenedor} py-[88px]`}>
        <p className={`${ceja} text-ceja`}>Preguntas frecuentes</p>
        <h2 className={tituloSeccion}>Lo que nos suelen preguntar</h2>
        <dl className="mt-8 grid gap-x-10 md:grid-cols-2">
          {preguntas.map((q) => (
            <div key={q.p} className="border-t border-linea py-5">
              <dt className="text-lg font-bold">{q.p}</dt>
              <dd className="mt-1.5 text-gris">{q.r}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Cierre({
  tituloTexto,
  bajada,
  accion,
  boton,
  mensaje,
}: {
  tituloTexto: string;
  bajada: string;
  accion: React.ReactNode;
  boton: BotonWhatsApp;
  mensaje: string;
}) {
  return (
    <footer className="relative overflow-hidden bg-marino text-white">
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

      <div className={`${contenedor} relative pb-10 pt-[96px]`}>
        <h2 className={`${titulo} max-w-[13em] text-[clamp(32px,4.6vw,56px)] leading-[1.04]`}>{tituloTexto}</h2>
        <p className="mt-4 max-w-[36em] text-niebla">{bajada}</p>
        <div className="mt-[30px] flex flex-wrap gap-3 text-base">
          {accion}
          <EnlaceWhatsApp boton={boton} mensaje={mensaje} className={botonContornoClaro}>
            Escríbenos por WhatsApp
          </EnlaceWhatsApp>
        </div>

        <div className="mt-24 flex flex-wrap items-center justify-between gap-x-7 gap-y-4 border-t border-white/[0.18] pt-[22px] text-sm text-niebla">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href="/" aria-label="ProyIT, inicio" className="shrink-0">
              <Image src={logoBlanco} alt="ProyIT" className="h-9 w-auto" />
            </Link>
            <p>Tecnología cercana, implementada con criterio de negocio · Chile</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-[22px] gap-y-2">
            <Link href="/soporte" className="py-2 underline hover:text-white">
              Soporte para empresas
            </Link>
            <Link href="/reparaciones" className="py-2 underline hover:text-white">
              Reparación de equipos
            </Link>
            <Link href="/login" className="py-2 underline hover:text-white">
              Portal clientes
            </Link>
            <Link href="/privacidad" className="py-2 underline hover:text-white">
              Privacidad
            </Link>
            <EnlaceWhatsApp boton="pie" mensaje={MENSAJE_WHATSAPP} className="py-2 underline hover:text-white">
              WhatsApp {WHATSAPP_VISIBLE}
            </EnlaceWhatsApp>
          </div>
        </div>
        <p className="mt-4 text-sm text-niebla">RUT 77.203.782-1 · Apoquindo 6410, Las Condes</p>
      </div>
    </footer>
  );
}
