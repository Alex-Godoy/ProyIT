import Image from "next/image";
import Link from "next/link";
import logoBlanco from "../../../public/brand/proyit-logo-blanco.png";
import Encabezado from "@/components/home/encabezado";
import AgendarDialogo from "@/components/home/agendar";
import SolicitarServicio, { BotonServicio } from "@/components/soporte/solicitar";
import {
  DESCUENTO_URGENCIA_CON_PLAN,
  DIAGNOSTICO_OFICINA,
  EJEMPLOS_URGENCIA,
  PLANES_SOPORTE,
  PRECIOS_SUELTOS,
  PREGUNTAS_SOPORTE,
  RECARGOS_URGENCIA,
  REPARACIONES,
} from "@/lib/soporte";

export const metadata = {
  title: "Soporte y continuidad TI · ProyIT",
  description:
    "Planes mensuales de soporte TI para empresas, atención urgente y reparación de equipos con precios a la vista. El diagnóstico es gratis al aceptar la reparación.",
};

const ceja = "text-xs font-bold uppercase tracking-[0.14em] text-acento";
const tituloSeccion = "font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-titulo sm:text-4xl";
const bajada = "max-w-3xl text-[17px] leading-relaxed text-ink";
const contenedor = "mx-auto max-w-5xl px-4 sm:px-6";
const botonOscuro =
  "inline-flex items-center justify-center rounded-full bg-noche px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy";
const botonClaro =
  "inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-titulo transition hover:bg-slate-100";
const botonUrgente =
  "inline-flex items-center justify-center rounded-full bg-[#b34e00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#933f00]";

const PASOS = [
  { t: "Agenda y trae tu equipo", d: "Lo recibes en nuestro taller o lo revisamos en tu casa u oficina." },
  { t: "Recibe tu presupuesto", d: "En 24 a 48 horas hábiles te explicamos qué tiene, cuánto cuesta y cuánto demora." },
  {
    t: "Aceptas y descontamos",
    d: "El diagnóstico se descuenta del total. Si no aceptas, pagas solo el diagnóstico y te llevas el informe.",
  },
];

const iconoCheck = (
  <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function SoportePage() {
  return (
    <div className="min-h-screen overflow-x-clip">
      <Encabezado />

      <main>
        {/* Portada */}
        <section className="bg-surface">
          <div className={`${contenedor} pb-16 pt-10 sm:pb-20 sm:pt-14`}>
            <nav aria-label="Ruta" className="text-sm text-muted">
              <Link href="/" className="hover:text-titulo hover:underline">
                Inicio
              </Link>{" "}
              <span aria-hidden="true">/</span> <span className="font-semibold text-titulo">Soporte y continuidad TI</span>
            </nav>
            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px] lg:items-center">
              <div>
                <p className={ceja}>Soporte y continuidad TI</p>
                <h1 className="mt-4 font-display text-[40px] font-extrabold leading-[1.05] tracking-tight text-titulo sm:text-5xl">
                  Tu operación funcionando, todos los días.
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink">
                  Planes mensuales de soporte para empresas, con mantención preventiva y tiempos de respuesta definidos. Y
                  si un equipo falla, el diagnóstico es gratis al aceptar la reparación.
                </p>
                <div className="mt-7 flex flex-col gap-3 whitespace-nowrap sm:flex-row sm:flex-wrap sm:items-center">
                  <a href="#empresas" className={botonOscuro}>
                    Ver planes para empresas
                  </a>
                  <a
                    href="#reparaciones"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-titulo transition hover:border-noche"
                  >
                    Reparar un equipo
                  </a>
                  <a href="#urgencias" className="inline-flex items-center justify-center px-2 py-3 text-sm font-semibold text-[#b34e00] hover:underline">
                    Tengo una urgencia →
                  </a>
                </div>
              </div>
              <aside className="rounded-2xl border border-[#d5dfee] bg-white p-6 shadow-xl shadow-noche/5 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Lo que cubre un plan</p>
                <ul className="mt-4 space-y-2.5 text-[15px] leading-snug text-ink">
                  {[
                    "Horas de soporte remoto y visitas incluidas",
                    "Mantención preventiva de todos los equipos",
                    "Respaldos y cuentas de Microsoft 365 o Google Workspace",
                    "Respuesta en 1 a 4 horas hábiles, según el plan",
                  ].map((t) => (
                    <li key={t} className="flex gap-2.5 text-acento">
                      {iconoCheck}
                      <span className="text-ink">{t}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 rounded-lg bg-[#e6f1fb] px-3 py-2.5 text-sm font-bold text-titulo">
                  Hasta 21% menos que pagar cada servicio por separado
                </p>
              </aside>
            </div>
          </div>
        </section>

        {/* Planes para empresas */}
        <section id="empresas" className="scroll-mt-20 py-16 sm:py-20">
          <div className={contenedor}>
            <p className={ceja}>Para empresas</p>
            <h2 className={`${tituloSeccion} mt-3`}>Soporte TI mensual: pagas menos que por servicio suelto</h2>
            <p className={`${bajada} mt-4`}>
              Partimos con un diagnóstico TI de tu oficina por {DIAGNOSTICO_OFICINA}. Si contratas un plan, lo descontamos
              de tu primera mensualidad.
            </p>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {PLANES_SOPORTE.map((p) => {
                const oscuro = p.destacado;
                return (
                  <article
                    key={p.id}
                    className={`flex flex-col gap-4 rounded-2xl p-6 sm:p-7 ${
                      oscuro ? "bg-noche text-white shadow-xl shadow-noche/20" : "border border-[#d5dfee] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-xl font-bold">{p.nombre}</h3>
                      {oscuro && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-titulo">Más elegido</span>
                      )}
                    </div>
                    <p className="flex flex-wrap items-baseline gap-x-1.5">
                      <span className="font-display text-4xl font-extrabold tracking-tight">{p.precio}</span>
                      <span className={oscuro ? "text-white/70" : "text-muted"}>/ mes</span>
                    </p>
                    <p className={`text-[15px] ${oscuro ? "text-white/70" : "text-muted"}`}>{p.equipos}</p>
                    <p className={`rounded-lg px-3 py-2 text-sm font-bold ${oscuro ? "bg-white text-titulo" : "bg-[#e6f1fb] text-titulo"}`}>
                      {p.separado}
                    </p>
                    <ul className={`space-y-2 text-[15px] leading-snug ${oscuro ? "text-white/90" : "text-ink"}`}>
                      {p.incluye.map((i) => (
                        <li key={i} className={`flex gap-2.5 ${oscuro ? "text-brand-orange" : "text-acento"}`}>
                          {iconoCheck}
                          <span className={oscuro ? "text-white/90" : "text-ink"}>{i}</span>
                        </li>
                      ))}
                    </ul>
                    <BotonServicio servicio={p.id} className={`mt-auto ${oscuro ? botonClaro : botonOscuro}`}>
                      Solicitar este plan
                    </BotonServicio>
                  </article>
                );
              })}
            </div>
            <div className="mt-6 space-y-1.5 text-sm leading-relaxed text-muted">
              <p>
                Valores IVA incluido. &quot;Por separado&quot; suma las horas y mantenciones del plan a precio sin plan;
                respaldos, monitoreo e informes no se venden sueltos.
              </p>
              <p>
                Sin plan: hora de soporte o visita {PRECIOS_SUELTOS.hora} · mantención preventiva por equipo{" "}
                {PRECIOS_SUELTOS.mantencion}. Con plan: hora adicional {PRECIOS_SUELTOS.horaConPlan} · equipo adicional{" "}
                {PRECIOS_SUELTOS.equipoAdicional} al mes.
              </p>
            </div>
          </div>
        </section>

        {/* Urgencias */}
        <section id="urgencias" className="scroll-mt-20 bg-surface py-16 sm:py-20">
          <div className={contenedor}>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#b34e00] px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-white">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3 2 20h20L12 3z" />
                <path d="M12 10v4" />
                <path d="M12 17.5v.01" />
              </svg>
              SOS · Urgencias
            </p>
            <h2 className={`${tituloSeccion} mt-4`}>¿No puede esperar? Te atendemos hoy, de noche o en feriado</h2>
            <p className={`${bajada} mt-4`}>
              La atención urgente tiene un recargo sobre el precio normal, según el horario. Sin plan pagas el valor
              completo; con un plan para empresas, si aceptas la reparación, la atención urgente te cuesta{" "}
              <strong className="text-titulo">{DESCUENTO_URGENCIA_CON_PLAN} menos</strong>.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {RECARGOS_URGENCIA.map((r) => (
                <div
                  key={r.recargo}
                  className={`flex flex-col gap-1.5 rounded-2xl p-5 sm:p-6 ${
                    r.destacado ? "bg-noche text-white" : "border border-[#d5dfee] bg-white"
                  }`}
                >
                  <p className="font-display text-3xl font-extrabold tracking-tight">{r.recargo}</p>
                  <p className="font-bold">{r.titulo}</p>
                  <p className={`text-[15px] leading-relaxed ${r.destacado ? "text-white/80" : "text-ink"}`}>{r.detalle}</p>
                  <p className={`mt-auto pt-1 text-sm ${r.destacado ? "text-white/70" : "text-muted"}`}>
                    Con plan y reparación: {DESCUENTO_URGENCIA_CON_PLAN} menos
                  </p>
                </div>
              ))}
            </div>

            {/* En celular la tabla se desliza horizontalmente. */}
            <div className="mt-6 overflow-x-auto rounded-2xl border border-[#d5dfee] bg-white">
              <table className="w-full min-w-[600px] text-left text-[15px]">
                <caption className="sr-only">Ejemplos de precios con recargo por urgencia, IVA incluido</caption>
                <thead className="border-b border-[#d5dfee] text-xs font-bold uppercase tracking-wider text-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Ejemplos · IVA incluido</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Normal</th>
                    <th scope="col" className="px-5 py-3.5 text-right">+30%</th>
                    <th scope="col" className="px-5 py-3.5 text-right">+50%</th>
                    <th scope="col" className="px-5 py-3.5 text-right">+100%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8eef6]">
                  {EJEMPLOS_URGENCIA.map((e) => (
                    <tr key={e.servicio}>
                      <th scope="row" className="px-5 py-4 font-bold text-titulo">{e.servicio}</th>
                      {e.precios.map((p, i) => (
                        <td key={i} className={`px-5 py-4 text-right ${i > 0 ? "font-bold text-titulo" : "text-ink"}`}>
                          {p}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-6 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink">
              <li>Los recargos no se suman: si aplican dos, se cobra el más alto.</li>
              <li>
                Al aceptar la reparación se descuenta el diagnóstico base. Sin plan, el recargo por urgencia se paga
                completo; con plan, la atención urgente baja {DESCUENTO_URGENCIA_CON_PLAN}.
              </li>
              <li>Los valores de la tabla son sin plan.</li>
              <li>Las visitas urgentes tienen un mínimo de 1 hora.</li>
            </ul>
            <BotonServicio servicio="urgencia" className={`${botonUrgente} mt-7`}>
              Solicitar atención urgente
            </BotonServicio>
          </div>
        </section>

        {/* Reparación para personas */}
        <section id="reparaciones" className="scroll-mt-20 py-16 sm:py-20">
          <div className={contenedor}>
            <p className={ceja}>Para personas</p>
            <h2 className={`${tituloSeccion} mt-3`}>Reparación de equipos</h2>
            <p className={`${bajada} mt-4`}>IVA incluido. Si ya sabes qué servicio necesitas, no pagas diagnóstico.</p>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {[
                { id: "diag-taller", t: "Diagnóstico en laboratorio", p: "$19.990", d: "Gratis si aceptas la reparación", cta: "Solicitar diagnóstico" },
                {
                  id: "diag-domicilio",
                  t: "Diagnóstico a domicilio u oficina",
                  p: "$34.990",
                  d: "Región Metropolitana · gratis si aceptas la reparación",
                  cta: "Solicitar visita",
                },
              ].map((c) => (
                <div key={c.id} className="flex flex-col gap-2 rounded-2xl bg-noche p-6 text-white">
                  <p className="text-lg font-bold">{c.t}</p>
                  <p className="font-display text-3xl font-extrabold tracking-tight">{c.p}</p>
                  <p className="text-[15px] text-white/80">{c.d}</p>
                  <BotonServicio servicio={c.id} className={`${botonClaro} mt-3 self-start`}>
                    {c.cta}
                  </BotonServicio>
                </div>
              ))}
            </div>

            <div className="mt-6 overflow-x-auto rounded-2xl border border-[#d5dfee] bg-white">
              <table className="w-full min-w-[520px] text-left text-[15px]">
                <caption className="sr-only">Precios de reparación de equipos, IVA incluido</caption>
                <thead className="border-b border-[#d5dfee] text-xs font-bold uppercase tracking-wider text-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Servicio</th>
                    <th scope="col" className="px-5 py-3.5">Incluye</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8eef6]">
                  {REPARACIONES.map((r) => (
                    <tr key={r.servicio}>
                      <th scope="row" className="px-5 py-4 font-bold text-titulo">{r.servicio}</th>
                      <td className="px-5 py-4 text-ink">{r.incluye}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-titulo">
                        {r.precio === "Según modelo" ? (
                          <span className="text-sm font-medium text-muted">Según modelo</span>
                        ) : (
                          <>
                            {r.antes && <span className="text-sm font-medium text-muted">{r.antes} </span>}
                            {r.precio}
                            {r.despues && <span className="text-sm font-medium text-muted"> {r.despues}</span>}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-muted">Todas las reparaciones tienen 30 días de garantía.</p>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="scroll-mt-20 bg-surface py-16 sm:py-20">
          <div className={contenedor}>
            <h2 className={tituloSeccion}>Cómo funciona la reparación</h2>
            <p className={`${bajada} mt-4`}>
              El diagnóstico es gratis si aceptas la reparación: lo que pagaste se descuenta del total.
            </p>
            <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
              {PASOS.map((p, i) => (
                <li key={p.t}>
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-extrabold ${
                      i === PASOS.length - 1 ? "bg-noche text-white" : "bg-[#e6f1fb] text-titulo"
                    }`}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-titulo">{p.t}</h3>
                  <p className="mt-1.5 leading-relaxed text-ink">{p.d}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 max-w-md rounded-2xl border border-[#d5dfee] bg-white p-6 shadow-xl shadow-noche/5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Ejemplo de presupuesto</p>
              <dl className="mt-4 space-y-3">
                <div className="flex justify-between gap-4 text-[17px]">
                  <dt>Mantención térmica</dt>
                  <dd className="font-bold">$34.990</dd>
                </div>
                <div className="flex justify-between gap-4 text-[17px] text-acento">
                  <dt>Diagnóstico ya pagado</dt>
                  <dd className="font-bold">−$19.990</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-[#d5dfee] pt-3">
                  <dt className="text-[17px] font-bold">Pagas al retirar</dt>
                  <dd className="font-display text-3xl font-extrabold tracking-tight text-titulo">$15.000</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                El diagnóstico no es un costo extra: es un abono a tu reparación.
              </p>
            </div>
          </div>
        </section>

        {/* Solicitar */}
        <section id="solicitar" className="scroll-mt-20 py-16 sm:py-20">
          <div className={contenedor}>
            <p className={ceja}>Solicitar servicio</p>
            <h2 className={`${tituloSeccion} mt-3`}>Elige el servicio y te contactamos</h2>
            <p className={`${bajada} mt-4`}>
              El diagnóstico es gratis si aceptas el servicio. Si no lo aceptas, pagas solo la revisión.
            </p>
            <div className="mt-10">
              <SolicitarServicio />
            </div>
          </div>
        </section>

        {/* Preguntas frecuentes */}
        <section className="bg-surface py-16 sm:py-20">
          <div className={contenedor}>
            <h2 className={tituloSeccion}>Preguntas frecuentes</h2>
            <dl className="mt-8 grid gap-x-8 md:grid-cols-2">
              {PREGUNTAS_SOPORTE.map((q) => (
                <div key={q.p} className="border-t border-[#d5dfee] py-5">
                  <dt className="text-lg font-bold text-titulo">{q.p}</dt>
                  <dd className="mt-1.5 leading-relaxed text-ink">{q.r}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className="bg-noche text-white">
        <div className={`${contenedor} pt-16 sm:pt-20`}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                ¿Tu equipo o tu oficina necesitan soporte?
              </h2>
              <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/75">
                Cuéntanos qué pasa y te respondemos por WhatsApp. El diagnóstico es gratis al aceptar el servicio.
              </p>
            </div>
            <a href="#solicitar" className={`${botonClaro} shrink-0 self-start md:self-auto`}>
              Solicitar servicio
            </a>
          </div>

          <div className="mt-14 flex flex-col gap-4 border-t border-white/15 py-8 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" aria-label="ProyIT, inicio" className="shrink-0">
              <Image src={logoBlanco} alt="ProyIT" className="h-7 w-auto" />
            </Link>
            <p className="flex gap-4">
              <Link href="/" className="hover:text-white">
                Inicio
              </Link>
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

      {/* El botón "Agendar diagnóstico" del encabezado abre este formulario. */}
      <AgendarDialogo />
    </div>
  );
}
