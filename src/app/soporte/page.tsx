import Image from "next/image";
import Link from "next/link";
import fotoAlex from "../../../public/home/alex-fundador.jpg";
import logoNgf from "../../../public/home/logo-ngf.png";
import Encabezado from "@/components/home/encabezado";
import SolicitarServicio, { BotonServicio } from "@/components/soporte/solicitar";
import {
  Check,
  Cierre,
  Portada,
  Preguntas,
  ProtocoloDatos,
  SiguientePaso,
  TablasUrgencia,
  TarjetaPortada,
  botonNaranjo,
  botonNavy,
  botonUrgente,
  ceja,
  contenedor,
  tituloSeccion,
} from "@/components/soporte/ui";
import {
  CONDICIONES_PLANES,
  DIAGNOSTICO_OFICINA,
  PLANES_SOPORTE,
  PRECIOS_SUELTOS,
  PREGUNTAS_EMPRESAS,
  SIN_ATENCION,
  TALLER,
  URGENCIA_EMPRESAS,
} from "@/lib/soporte";

export const metadata = {
  title: "Soporte TI para empresas · ProyIT",
  description:
    "Planes mensuales de soporte y continuidad TI para empresas: mantención preventiva, respaldos y plazos de contacto definidos, con precios a la vista e IVA incluido.",
};

const CUBRE = [
  { t: "Soporte remoto y visitas", d: "Horas al mes para resolver lo que se cae, sin cotizar cada vez." },
  { t: "Mantención preventiva", d: "Todos tus equipos, dos veces al año, antes de que fallen." },
  { t: "Respaldos y cuentas", d: "Microsoft 365 o Google Workspace en orden, desde el plan Pyme." },
  { t: "Plazo de contacto", d: "De 1 a 4 horas hábiles según el plan, con un responsable." },
];

const PORTAL = [
  "Abres un ticket desde el Portal o nos escribes por WhatsApp.",
  "Ves en qué estado está, quién lo atiende y antes de cuándo te responde.",
  "Te avisamos por correo cada vez que hay una respuesta.",
  "Queda el historial de todo lo que hicimos en tus equipos.",
];

// Vista de ejemplo del módulo de tickets (datos ficticios, ilustrativos).
const TICKETS_EJEMPLO = [
  { n: 128, asunto: "La impresora de recepción no imprime", estado: "En progreso", clase: "bg-brand-blue/10 text-navy", plazo: "Hoy, 11:30" },
  { n: 127, asunto: "Configurar correo del nuevo ingreso", estado: "Esperando tu respuesta", clase: "bg-amber-100 text-amber-800", plazo: "—" },
  { n: 125, asunto: "Notebook de contabilidad lento", estado: "Resuelto", clase: "bg-emerald-100 text-emerald-800", plazo: "—" },
];

export default function SoportePage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-fondo text-[17px] leading-[1.6] text-tinta">
      <Encabezado sobreFoto />

      <main>
        <Portada
          ruta="Soporte TI para empresas"
          cejaTexto="Soporte y continuidad TI · Empresas"
          bajada="Planes mensuales con mantención preventiva, respaldos y plazos de contacto definidos. Tu oficina deja de depender de una sola persona y sabes cuánto pagas cada mes."
          accion={
            <a href="#planes" className={botonNaranjo}>
              Ver planes y precios
            </a>
          }
          garantias={["Precios a la vista, IVA incluido", "Sin permanencia mínima", "Cada solicitud con plazo y responsable"]}
          desvio={
            <>
              ¿Es para tu notebook personal?{" "}
              <Link href="/reparaciones" className="font-semibold text-white underline hover:text-brand-orange">
                Reparación de equipos →
              </Link>
            </>
          }
        >
          Si algo falla en tu oficina, <span className="text-brand-orange">alguien responde.</span>
        </Portada>

        <TarjetaPortada tituloTexto="Lo que cubre un plan" cejaTexto="Continuidad, no parches" items={CUBRE} />

        {/* Planes */}
        <section id="planes" className={`${contenedor} scroll-mt-24 pb-[88px] pt-24`}>
          <p className={`${ceja} text-ceja`}>Planes mensuales</p>
          <h2 className={`${tituloSeccion} max-w-[18em]`}>Precio fijo al mes y alguien que ya conoce tus equipos.</h2>
          <p className="mt-4 max-w-[42em] text-gris">
            Cuando algo falla no partes de cero explicando tu red ni buscando a quién llamar: ya sabemos cómo está armada
            tu oficina. Partimos con un diagnóstico TI por {DIAGNOSTICO_OFICINA}, que se abona a tu primera mensualidad.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {PLANES_SOPORTE.map((p) => (
              <article
                key={p.id}
                className={`flex flex-col overflow-hidden rounded-[18px] bg-white ${
                  p.recomendado ? "border-2 border-brand-orange shadow-[0_30px_60px_-30px_rgba(4,31,74,0.45)]" : "border border-linea"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 bg-marino px-6 py-[22px] text-white">
                  <div>
                    <h3 className="font-display text-[26px] font-bold leading-[1.1]">{p.nombre}</h3>
                    <p className="text-[15px] text-niebla">{p.equipos}</p>
                  </div>
                  {p.recomendado && (
                    <span className="rounded-full bg-brand-orange px-3 py-1 text-[12.5px] font-bold uppercase tracking-[0.06em] text-marino">
                      Recomendado
                    </span>
                  )}
                </div>
                <div className="flex flex-grow flex-col gap-4 px-6 pb-[26px] pt-[22px]">
                  <p className="flex flex-wrap items-baseline gap-x-1.5">
                    <span className="font-display text-[40px] font-extrabold leading-none tracking-tight">{p.precio}</span>
                    <span className="text-gris">/ mes</span>
                  </p>
                  <p className="flex items-center gap-2 rounded-xl bg-fondo px-3.5 py-2.5 text-[15px] font-bold text-navy">
                    <svg aria-hidden="true" className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    {p.respuesta}
                  </p>
                  <ul>
                    {p.incluye.map((i) => (
                      <li key={i} className="flex gap-2.5 border-t border-linea py-2.5 text-base">
                        <Check color="#06347a" className="mt-1" />
                        {i}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-auto border-t border-linea pt-3 text-[15px] text-gris">{p.separado}</p>
                  <BotonServicio servicio={p.id} className={p.recomendado ? botonNaranjo : botonNavy}>
                    Solicitar plan {p.nombre}
                  </BotonServicio>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 space-y-1.5 text-[15px] text-gris">
            <p>
              Valores IVA incluido. &quot;Por separado&quot; suma las horas y mantenciones del plan a precio sin plan;
              respaldos, revisión de seguridad e informes no se venden sueltos.
            </p>
            <p>
              Sin plan: hora de soporte o visita {PRECIOS_SUELTOS.hora} · mantención preventiva por equipo{" "}
              {PRECIOS_SUELTOS.mantencion}. Con plan: hora adicional {PRECIOS_SUELTOS.horaConPlan} · equipo adicional{" "}
              {PRECIOS_SUELTOS.equipoAdicional} al mes.
            </p>
          </div>
        </section>

        {/* Condiciones */}
        <section id="condiciones" className="scroll-mt-20 border-y border-linea bg-white">
          <div className={`${contenedor} py-[88px]`}>
            <p className={`${ceja} text-ceja`}>Condiciones claras</p>
            <h2 className={`${tituloSeccion} max-w-[18em]`}>Lo que tienes que saber antes de contratar.</h2>
            <dl className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-x-8 gap-y-2">
              {CONDICIONES_PLANES.map((c, i) => (
                <div
                  key={c.t}
                  className={`border-t-[3px] pb-4 pt-4 ${i === CONDICIONES_PLANES.length - 1 ? "border-brand-orange" : "border-navy"}`}
                >
                  <dt className="font-bold">{c.t}</dt>
                  <dd className="mt-1 text-[15px] text-gris">{c.d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Portal de clientes */}
        <section className={`${contenedor} grid gap-12 py-[88px] lg:grid-cols-[1fr_1.05fr] lg:items-center`}>
          <div className="min-w-0">
            <p className={`${ceja} text-ceja`}>Portal de clientes</p>
            <h2 className={tituloSeccion}>Cada solicitud queda registrada, con plazo y responsable.</h2>
            <p className="mt-4 text-gris">
              Con tu plan tienes acceso al Portal de ProyIT. Nada se pierde en un chat: sabes qué pediste, quién lo está
              viendo y qué se hizo.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {PORTAL.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Check color="#06347a" className="mt-1" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <figure className="min-w-0 overflow-hidden rounded-[22px] border border-linea bg-white shadow-[0_30px_60px_-30px_rgba(4,31,74,0.45)]">
            <div className="flex items-center justify-between gap-3 bg-marino px-5 py-4 text-white">
              <p className="font-display text-lg font-bold">Tickets de soporte</p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-niebla">Vista de ejemplo</span>
            </div>
            <ul className="divide-y divide-linea" aria-label="Ejemplo de tickets en el Portal">
              {TICKETS_EJEMPLO.map((t) => (
                <li key={t.n} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gris">#{t.n}</p>
                    <p className="font-semibold leading-snug">{t.asunto}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${t.clase}`}>{t.estado}</span>
                    {t.plazo !== "—" && <span className="text-xs text-gris">Responder antes de: {t.plazo}</span>}
                  </div>
                </li>
              ))}
            </ul>
            <figcaption className="border-t border-linea bg-fondo px-5 py-3 text-sm text-gris">
              Así ve tu equipo sus solicitudes en el Portal. Los datos son ilustrativos.
            </figcaption>
          </figure>
        </section>

        {/* Urgencias */}
        <section id="urgencias" className="scroll-mt-20 border-t border-linea bg-fondo">
          <div className={`${contenedor} py-[88px]`}>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-orange-text px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-white">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3 2 20h20L12 3z" />
                <path d="M12 10v4" />
                <path d="M12 17.5v.01" />
              </svg>
              Urgencias
            </p>
            <h2 className={`${tituloSeccion} mt-4 max-w-[18em]`}>¿No puede esperar? El recargo, a la vista antes de empezar.</h2>
            <p className="mt-4 max-w-[42em] text-gris">
              La atención urgente tiene un recargo según el horario. Con un plan pagas la mitad del recargo, calculado
              sobre la hora con plan ({PRECIOS_SUELTOS.horaConPlan}).
            </p>
            <TablasUrgencia ejemplos={URGENCIA_EMPRESAS} conPlan />
            <ul className="mt-6 list-disc space-y-1.5 pl-5 text-[15px] text-gris">
              <li>Los recargos no se suman: si aplican dos, se cobra el más alto.</li>
              <li>Las visitas urgentes tienen un mínimo de 1 hora.</li>
              <li>{SIN_ATENCION}</li>
            </ul>
            <BotonServicio servicio="urgencia" className={`${botonUrgente} mt-8`}>
              Solicitar atención urgente
            </BotonServicio>
          </div>
        </section>

        <ProtocoloDatos boton="soporte-datos" />

        {/* Quién te atiende */}
        <section className={`${contenedor} flex flex-wrap gap-12 py-[88px]`}>
          <div className="flex min-w-0 flex-[1_1_340px] flex-wrap items-start gap-6">
            <Image
              src={fotoAlex}
              alt="Alex, fundador de ProyIT"
              sizes="160px"
              placeholder="blur"
              className="h-[200px] w-40 flex-none rounded-[18px] object-cover object-[center_30%]"
            />
            <div className="min-w-0 flex-[1_1_200px]">
              <p className={`${ceja} text-ceja`}>Quién te atiende</p>
              <h2 className="my-2.5 font-display text-[30px] font-bold leading-[1.12]">Un equipo cercano, no un call center.</h2>
              <p className="text-gris">
                Soy Alex, fundador de ProyIT. La primera conversación la tienes conmigo y reviso el diagnóstico de tu
                oficina antes de proponerte un plan.
              </p>
              <p className="mt-3 text-[15px] text-gris">
                {TALLER.direccion} · {TALLER.horario}
              </p>
            </div>
          </div>
          <div className="min-w-0 flex-[1_1_340px] rounded-[18px] border border-linea bg-white p-7">
            <p className={`${ceja} text-ceja`}>En operación</p>
            <h2 className="my-2.5 font-display text-[28px] font-bold leading-[1.12]">Piloto activo con NGF Auditoría y Contabilidad</h2>
            <p className="text-gris">
              Construimos con clientes reales, no en laboratorio. Cada solución se mide en la operación diaria.
            </p>
            <Image src={logoNgf} alt="NGF Auditoría y Contabilidad" className="mt-[18px] h-24 w-auto" />
          </div>
        </section>

        {/* Solicitar */}
        <section id="solicitar" className="scroll-mt-20 border-t border-linea bg-white">
          <div className={`${contenedor} py-[88px]`}>
            <p className={`${ceja} text-ceja`}>Solicitar</p>
            <h2 className={tituloSeccion}>Cuéntanos cuántos equipos tienen y qué necesitan</h2>
            <p className="mb-10 mt-4 max-w-[42em] text-gris">
              Te respondemos por WhatsApp para coordinar el diagnóstico o activar tu plan.
            </p>
            <SolicitarServicio
              grupos={["empresas", "urgencia"]}
              origen="pagina-soporte"
              ejemplo="Ej.: somos 8 personas, usamos Microsoft 365 y el correo falla seguido"
            />
          </div>
        </section>

        <Preguntas preguntas={PREGUNTAS_EMPRESAS} />

        <SiguientePaso
          cejaTexto="Más allá del soporte"
          tituloTexto="Lo que hoy haces a mano, en Excel y por WhatsApp, funcionando solo."
          bajada="Cuando tu TI está en orden, el siguiente paso es automatizar. Partimos con una conversación de 30 minutos, sin costo."
          href="/"
          boton="Conocer cómo trabajamos"
        />
      </main>

      <Cierre
        tituloTexto="Tu oficina funcionando, todos los días."
        bajada="Partimos con el diagnóstico TI de tu oficina. Si ya sabes qué necesitas, escríbenos y te respondemos por WhatsApp."
        accion={
          <a href="#solicitar" className={botonNaranjo}>
            Solicitar un plan
          </a>
        }
        boton="soporte-empresas"
        mensaje="Hola, vengo del sitio de ProyIT y necesito soporte TI para mi empresa."
      />
    </div>
  );
}
