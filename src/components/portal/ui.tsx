import Link from "next/link";

// Piezas del portal (cliente, equipo y super usuario) con el lenguaje del home:
// portada azul marino con triángulos de marca, títulos en Bricolage, cejas en
// mayúsculas, tarjetas blancas de borde suave y botones tipo píldora.

export const contenedor = "mx-auto max-w-[1120px] px-4 sm:px-6";

// Ancho de cada pantalla: listados y paneles (amplio), detalle (medio) y formularios (angosto).
// La portada usa el mismo ancho que el cuerpo para que ambos queden alineados.
const ANCHOS = { amplio: "max-w-[1120px]", medio: "max-w-[960px]", angosto: "max-w-[800px]" } as const;
export type Ancho = keyof typeof ANCHOS;

export const ceja = "text-[13px] font-bold uppercase tracking-[0.12em]";
export const titulo = "font-display font-extrabold tracking-[-0.02em] text-balance";

// Tarjetas: `tarjeta` para contenido, `tarjetaEnlace` cuando toda la tarjeta es clicable.
export const tarjeta = "rounded-[18px] border border-linea bg-white shadow-[0_1px_2px_rgba(4,31,74,0.05)]";
export const tarjetaEnlace = `${tarjeta} transition hover:-translate-y-0.5 hover:border-brand-blue hover:shadow-[0_18px_36px_-20px_rgba(4,31,74,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue`;
export const tarjetaVacia = "rounded-[18px] border-2 border-dashed border-linea bg-white/60 p-8 text-center";

export const tituloSeccion = "font-display text-xl font-bold tracking-[-0.01em] text-tinta";

// Botones. El naranjo con texto marino es el del home (contraste 6,9:1).
const boton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-center text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2";
export const botonNaranjo = `${boton} bg-brand-orange text-marino hover:bg-[#ff8c3a]`;
export const botonNavy = `${boton} bg-navy text-white hover:bg-marino`;
export const botonContorno = `${boton} border-2 border-navy text-navy hover:bg-navy hover:text-white`;
export const botonContornoClaro = `${boton} border-2 border-white/55 text-white hover:border-white hover:bg-white/10 focus-visible:ring-offset-marino`;

export function Triangulos({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 400"
      preserveAspectRatio="xMaxYMid slice"
      className={`pointer-events-none absolute right-0 top-0 hidden h-full w-[42%] min-w-72 sm:block ${className}`}
    >
      <polygon points="600,0 600,300 300,0" fill="#2f95d3" fillOpacity="0.3" />
      <polygon points="600,150 600,400 380,400" fill="#ff7a1a" fillOpacity="0.36" />
      <polygon points="470,70 600,230 600,70" fill="none" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="230" y1="400" x2="600" y2="20" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1" />
      <line x1="270" y1="400" x2="600" y2="70" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" />
    </svg>
  );
}

// Portada de cada pantalla del portal. `solapa` deja espacio abajo para que la
// primera tarjeta de la página se monte sobre la portada (con `-mt-16`).
export function CabeceraPagina({
  cejaTexto,
  children,
  bajada,
  volver,
  acciones,
  extra,
  solapa = false,
  ancho = "amplio",
}: {
  cejaTexto?: React.ReactNode;
  children: React.ReactNode; // el H1
  bajada?: React.ReactNode;
  volver?: { href: string; label: string };
  acciones?: React.ReactNode;
  extra?: React.ReactNode; // insignias junto al título
  solapa?: boolean;
  ancho?: Ancho;
}) {
  return (
    <section className="relative overflow-hidden bg-marino text-white">
      <Triangulos />
      <div className={`mx-auto px-4 sm:px-6 ${ANCHOS[ancho]} relative ${solapa ? "pb-24 sm:pb-28" : "pb-10 sm:pb-12"} pt-7 sm:pt-10`}>
        {volver && (
          <Link
            href={volver.href}
            className="-ml-1 inline-flex min-h-9 items-center gap-1.5 rounded-full px-1 text-sm font-semibold text-niebla transition hover:text-white"
          >
            <span aria-hidden="true">←</span> {volver.label}
          </Link>
        )}
        <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${volver ? "mt-4" : ""}`}>
          <div className="min-w-0 max-w-[720px]">
            {cejaTexto && <p className={`${ceja} text-brand-orange`}>{cejaTexto}</p>}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className={`${titulo} min-w-0 break-words text-[clamp(28px,4vw,44px)] leading-[1.06]`}>{children}</h1>
              {/* Las insignias son translúcidas para fondo claro: sobre la portada van en blanco. */}
              {extra && <div className="flex flex-wrap gap-2 *:bg-white *:text-navy">{extra}</div>}
            </div>
            {bajada && <p className="mt-3 max-w-[40em] text-[17px] leading-relaxed text-niebla">{bajada}</p>}
          </div>
          {acciones && <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row sm:flex-wrap">{acciones}</div>}
        </div>
      </div>
    </section>
  );
}

// Cuerpo de la página bajo la portada. Al primer bloque se le quita el margen
// superior: el espacio lo pone el cuerpo.
export function CuerpoPagina({
  children,
  solapa = false,
  ancho = "amplio",
}: {
  children: React.ReactNode;
  solapa?: boolean;
  ancho?: Ancho;
}) {
  return (
    <div
      className={`mx-auto px-4 pb-16 sm:px-6 [&>*:first-child]:mt-0 ${ANCHOS[ancho]} ${
        solapa ? "relative -mt-16 sm:-mt-20" : "pt-8 sm:pt-10"
      }`}
    >
      {children}
    </div>
  );
}
