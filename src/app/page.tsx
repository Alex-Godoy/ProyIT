import Link from "next/link";
import { Logo, MODULOS } from "@/components/brand";

const PILARES = [
  { t: "Agentes IA", d: "Atención y calificación de clientes 24/7 por WhatsApp y web." },
  { t: "Automatización", d: "Procesos repetitivos que hoy te quitan horas, resueltos." },
  { t: "Marketing digital", d: "Sitios web y ecommerce que venden y se miden." },
  { t: "A tu medida", d: "Soluciones desarrolladas para tu operación, no plantillas." },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-3 text-sm">
            <a href="https://proyit.tech" className="hidden text-muted hover:text-navy sm:inline">
              proyit.tech
            </a>
            <Link
              href="/login"
              className="rounded-lg bg-navy px-4 py-2 font-semibold text-white hover:bg-navy-dark"
            >
              Ingresar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-blue/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-10 h-80 w-80 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand-blue">
              Portal de clientes
            </p>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              Tu tecnología, tus proyectos y tu equipo ProyIT, en un solo lugar.
            </h1>
            <p className="mt-6 text-lg text-white/80">
              Sigue el avance de lo que implementamos contigo, pide soporte sin
              perseguir a nadie y accede a beneficios exclusivos por ser parte de
              ProyIT.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-lg bg-brand-orange px-6 py-3 font-semibold text-white shadow-lg shadow-brand-orange/30 hover:bg-brand-orange-dark"
              >
                Ingresar al portal
              </Link>
              <Link
                href="/login?modo=registro"
                className="rounded-lg border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                Crear mi cuenta
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 self-center">
            {MODULOS.map((m) => (
              <div
                key={m.key}
                className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur"
              >
                <div className="mb-3 inline-flex rounded-lg bg-white/10 p-2 text-brand-blue">
                  {m.icon}
                </div>
                <p className="font-semibold leading-snug">{m.titulo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Módulos */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-navy">Lo que encontrarás en tu portal</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Diseñado para que tengas claridad sobre tu inversión en tecnología y
            una línea directa con nuestro equipo.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {MODULOS.map((m) => (
              <article key={m.key} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="mb-4 inline-flex rounded-lg bg-navy/5 p-2.5 text-navy">{m.icon}</div>
                <h3 className="text-lg font-semibold text-ink">{m.titulo}</h3>
                <p className="mt-2 text-muted">{m.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares ProyIT */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-blue">
            Soluciones tecnológicas a la medida de tu operación
          </p>
          <h2 className="mt-2 max-w-3xl text-3xl font-bold text-navy">
            Automatizamos procesos, implementamos agentes IA y desarrollamos la
            tecnología que tu negocio necesita.
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILARES.map((p) => (
              <div key={p.t} className="border-l-4 border-brand-orange pl-4">
                <p className="font-semibold text-ink">{p.t}</p>
                <p className="mt-1 text-sm text-muted">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-r from-navy to-brand-blue p-10 text-white md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold">¿Ya eres cliente de ProyIT?</h2>
            <p className="mt-1 text-white/80">Ingresa con tu correo o tu cuenta de Google.</p>
          </div>
          <Link href="/login" className="rounded-lg bg-white px-6 py-3 font-semibold text-navy hover:bg-slate-100">
            Ingresar al portal
          </Link>
        </div>
      </section>

      <footer className="bg-navy-dark py-10 text-white/70">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 text-sm sm:flex-row sm:items-center sm:px-6">
          <Logo light />
          <p>
            La transformación digital no debería ser exclusiva de las grandes empresas.
          </p>
          <p>© {new Date().getFullYear()} ProyIT · Chile</p>
        </div>
      </footer>
    </div>
  );
}
