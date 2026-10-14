import Link from "next/link";
import Encabezado from "@/components/home/encabezado";
import SolicitarServicio, { BotonServicio } from "@/components/soporte/solicitar";
import {
  Cierre,
  Portada,
  Preguntas,
  ProtocoloDatos,
  SiguientePaso,
  TablasUrgencia,
  TarjetaPortada,
  botonNaranjo,
  botonUrgente,
  ceja,
  contenedor,
  tituloSeccion,
} from "@/components/soporte/ui";
import { PREGUNTAS_PERSONAS, REPARACIONES, SIN_ATENCION, TALLER, URGENCIA_PERSONAS } from "@/lib/soporte";

// Página para personas: reparación de notebooks y PCs. No va en el menú
// principal (ese es para empresas); llega desde Google, redes y /soporte.
export const metadata = {
  title: "Reparación de notebooks y PCs en Las Condes y Chicureo · ProyIT",
  description:
    "Diagnóstico en taller o a domicilio que se abona a tu reparación, precios a la vista con IVA incluido, 30 días de garantía y respaldo de tus archivos.",
};

const DIAGNOSTICOS = [
  { id: "diag-taller", t: "Diagnóstico en taller", p: "$19.990", d: `${TALLER.recepcion}, o por Chilexpress.`, cta: "Solicitar diagnóstico" },
  { id: "diag-domicilio", t: "Diagnóstico a domicilio u oficina", p: "$34.990", d: "Vamos donde estés, en la Región Metropolitana.", cta: "Solicitar visita" },
];

const PASOS = [
  { t: "Agenda y entréganos tu equipo", d: "Con hora en Las Condes o Chicureo, por Chilexpress, o lo revisamos en tu casa u oficina." },
  { t: "Recibe tu presupuesto", d: `En ${TALLER.plazo} te explicamos qué tiene, cuánto cuesta y cuánto demora.` },
  { t: "Aceptas y se abona", d: "Lo que pagaste por el diagnóstico se descuenta del total. Si no aceptas, te llevas el informe." },
];

const ETAPAS = ["Recibido", "En diagnóstico", "Presupuesto listo", "En reparación", "Listo para entrega"];

export default function ReparacionesPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-fondo text-[17px] leading-[1.6] text-tinta">
      <Encabezado sobreFoto />

      <main>
        <Portada
          ruta="Reparación de equipos"
          cejaTexto="Reparación de notebooks y PCs"
          bajada="Diagnóstico en nuestros talleres de Las Condes y Chicureo, por envío o a domicilio. Si aceptas la reparación, lo que pagaste por el diagnóstico es un abono al total."
          accion={
            <BotonServicio servicio="diag-taller" className={botonNaranjo}>
              Solicitar diagnóstico
            </BotonServicio>
          }
          garantias={[`Garantía de ${TALLER.garantia}`, `Presupuesto en ${TALLER.plazo}`, "Respaldo antes de cualquier formateo"]}
          desvio={
            <>
              ¿Es para tu empresa?{" "}
              <Link href="/soporte" className="font-semibold text-white underline hover:text-brand-orange">
                Planes de soporte TI →
              </Link>
            </>
          }
        >
          Tu equipo reparado, <span className="text-brand-orange">con el precio a la vista.</span>
        </Portada>

        <TarjetaPortada
          tituloTexto="Datos del taller"
          cejaTexto="Antes de venir"
          items={[
            { t: "Dónde", d: TALLER.recepcion },
            { t: "Por envío", d: TALLER.envio },
            { t: "Horario", d: TALLER.horario },
            { t: "Plazo del diagnóstico", d: `${TALLER.plazo} desde que recibimos el equipo` },
            { t: "Garantía", d: `${TALLER.garantia} sobre el trabajo y los repuestos` },
          ]}
        />

        {/* Diagnóstico y precios */}
        <section id="precios" className={`${contenedor} scroll-mt-24 pb-[88px] pt-24`}>
          <p className={`${ceja} text-ceja`}>Precios · IVA incluido</p>
          <h2 className={`${tituloSeccion} max-w-[18em]`}>Primero el diagnóstico. Si aceptas, es un abono.</h2>
          <p className="mt-4 max-w-[42em] text-gris">
            Si ya sabes qué servicio necesitas, no pagas diagnóstico: revisamos el equipo antes de trabajar y te
            confirmamos el precio.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {DIAGNOSTICOS.map((c) => (
              <div key={c.id} className="flex flex-col gap-2 rounded-[18px] bg-marino p-7 text-white">
                <p className="font-display text-[23px] font-bold leading-tight">{c.t}</p>
                <p className="font-display text-[40px] font-extrabold leading-none tracking-tight">{c.p}</p>
                <p className="text-niebla">{c.d}</p>
                <p className="text-[15px] font-semibold text-brand-orange">Se abona a tu reparación</p>
                <BotonServicio servicio={c.id} className={`${botonNaranjo} mt-3 self-start`}>
                  {c.cta}
                </BotonServicio>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto rounded-[18px] border border-linea bg-white">
            <table className="w-full min-w-[520px] text-left text-[15px]">
              <caption className="sr-only">Precios de reparación de equipos, IVA incluido</caption>
              <thead className="border-b border-linea text-xs font-bold uppercase tracking-wider text-gris">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Servicio</th>
                  <th scope="col" className="px-5 py-3.5">Incluye</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linea">
                {REPARACIONES.map((r) => (
                  <tr key={r.servicio}>
                    <th scope="row" className="px-5 py-4 font-bold">{r.servicio}</th>
                    <td className="px-5 py-4 text-gris">{r.incluye}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-bold">
                      {r.precio === "Según modelo" ? (
                        <span className="text-sm font-medium text-gris">Según modelo</span>
                      ) : (
                        <>
                          {r.antes && <span className="text-sm font-medium text-gris">{r.antes} </span>}
                          {r.precio}
                          {r.despues && <span className="text-sm font-medium text-gris"> {r.despues}</span>}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[15px] text-gris">
            Los repuestos se cotizan aparte en el presupuesto. Todas las reparaciones tienen {TALLER.garantia} de garantía.
          </p>
        </section>

        {/* Cómo funciona + seguimiento */}
        <section id="como-funciona" className="scroll-mt-20 border-y border-linea bg-white">
          <div className={`${contenedor} py-[88px]`}>
            <p className={`${ceja} text-ceja`}>Cómo funciona</p>
            <h2 className={`${tituloSeccion} max-w-[18em]`}>Sabes en qué está tu equipo en todo momento.</h2>
            <ol className="mt-10 flex flex-wrap gap-6">
              {PASOS.map((p, i) => {
                const oscuro = i === PASOS.length - 1;
                return (
                  <li key={p.t} className={`min-w-0 flex-[1_1_260px] rounded-[18px] p-7 ${oscuro ? "bg-marino text-white" : "bg-fondo"}`}>
                    <p className={`font-display text-5xl font-extrabold leading-none ${oscuro ? "text-brand-orange" : "text-navy"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mb-2 mt-4 font-display text-[23px] font-bold leading-tight">{p.t}</h3>
                    <p className={`text-base ${oscuro ? "text-niebla" : "text-gris"}`}>{p.d}</p>
                  </li>
                );
              })}
            </ol>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="min-w-0 rounded-[18px] border border-linea p-6 sm:p-7">
                <p className={`${ceja} text-ceja`}>Seguimiento</p>
                <p className="mt-2 font-display text-[23px] font-bold leading-tight">Te avisamos por WhatsApp en cada etapa.</p>
                <ol className="mt-6 grid gap-3 sm:grid-cols-5 sm:gap-2" aria-label="Etapas de una reparación">
                  {ETAPAS.map((e, i) => (
                    <li key={e} className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                          i === ETAPAS.length - 1 ? "bg-brand-orange text-marino" : "bg-navy text-white"
                        }`}
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      <span className="text-[15px] font-semibold leading-snug">{e}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 text-[15px] text-gris">
                  El presupuesto te llega por escrito y lo aceptas respondiendo el mensaje. No trabajamos sin tu
                  aprobación.
                </p>
              </div>

              <div className="min-w-0 rounded-[18px] bg-fondo p-6 sm:p-7">
                <p className={`${ceja} text-ceja`}>Ejemplo de presupuesto</p>
                <dl className="mt-4 space-y-3">
                  <div className="flex justify-between gap-4">
                    <dt>Diagnóstico en taller</dt>
                    <dd className="font-bold">$19.990</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Mantención térmica</dt>
                    <dd className="font-bold">$34.990</dd>
                  </div>
                  <div className="flex justify-between gap-4 text-navy">
                    <dt>Abono del diagnóstico</dt>
                    <dd className="font-bold">−$19.990</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-t border-linea pt-3">
                    <dt className="font-bold">Total</dt>
                    <dd className="font-display text-3xl font-extrabold tracking-tight">$34.990</dd>
                  </div>
                </dl>
                <p className="mt-3 text-[15px] text-gris">$19.990 al dejar el equipo y $15.000 al retirarlo.</p>
              </div>
            </div>
          </div>
        </section>

        <ProtocoloDatos boton="soporte-datos" />

        {/* Urgencias */}
        <section id="urgencias" className="scroll-mt-20 bg-fondo">
          <div className={`${contenedor} py-[88px]`}>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-orange-text px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-white">
              Urgencias
            </p>
            <h2 className={`${tituloSeccion} mt-4 max-w-[18em]`}>¿Lo necesitas hoy? Tiene recargo, y lo sabes antes.</h2>
            <p className="mt-4 max-w-[42em] text-gris">
              Atendemos el mismo día, fuera de horario y en fines de semana. Domingos y feriados, solo de forma remota. Si
              aplican dos recargos, se cobra el más alto.
            </p>
            <TablasUrgencia ejemplos={URGENCIA_PERSONAS} conPlan={false} />
            <p className="mt-6 max-w-[42em] text-[15px] text-gris">{SIN_ATENCION}</p>
            <BotonServicio servicio="urgencia" className={`${botonUrgente} mt-8`}>
              Solicitar atención urgente
            </BotonServicio>
          </div>
        </section>

        {/* Solicitar */}
        <section id="solicitar" className="scroll-mt-20 border-t border-linea bg-white">
          <div className={`${contenedor} py-[88px]`}>
            <p className={`${ceja} text-ceja`}>Solicitar</p>
            <h2 className={tituloSeccion}>Cuéntanos qué le pasa a tu equipo</h2>
            <p className="mb-10 mt-4 max-w-[42em] text-gris">Te escribimos por WhatsApp para coordinar la recepción o la visita.</p>
            <SolicitarServicio
              grupos={["personas", "urgencia"]}
              origen="pagina-reparaciones"
              ejemplo="Ej.: mi notebook se apaga solo después de unos minutos"
            />
          </div>
        </section>

        <Preguntas preguntas={PREGUNTAS_PERSONAS} />

        <SiguientePaso
          cejaTexto="¿Tienes una pyme?"
          tituloTexto="Que tu oficina no dependa de una sola persona."
          bajada="El mismo cuidado, para todos los equipos de tu empresa: planes mensuales con mantención preventiva, respaldos y plazos de contacto definidos."
          href="/soporte"
          boton="Ver planes para empresas"
        />
      </main>

      <Cierre
        tituloTexto="¿Tu equipo está fallando?"
        bajada={`Tráelo con hora a Las Condes o Chicureo, envíalo por Chilexpress o pide una visita. Te decimos qué tiene y cuánto cuesta antes de tocar nada.`}
        accion={
          <a href="#solicitar" className={botonNaranjo}>
            Solicitar diagnóstico
          </a>
        }
        boton="reparaciones"
        mensaje="Hola, vengo del sitio de ProyIT y necesito reparar un equipo."
      />
    </div>
  );
}
