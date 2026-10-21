// Esqueleto que se muestra mientras carga una página del portal: así el clic
// se nota de inmediato aunque la consulta tarde.
export default function Cargando() {
  return (
    <main aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando…</span>
      <div className="bg-marino">
        <div className="mx-auto max-w-[1120px] animate-pulse px-4 pb-12 pt-10 sm:px-6">
          <div className="h-3 w-28 rounded bg-white/15" />
          <div className="mt-4 h-9 w-72 max-w-full rounded-lg bg-white/20" />
          <div className="mt-4 h-4 w-96 max-w-full rounded bg-white/10" />
        </div>
      </div>
      <div className="mx-auto grid max-w-[1120px] animate-pulse gap-5 px-4 pt-10 sm:px-6 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-[18px] border border-linea bg-white" />
        ))}
      </div>
    </main>
  );
}
