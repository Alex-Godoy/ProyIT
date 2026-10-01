// Esqueleto que se muestra mientras carga una página del portal: así el clic
// se nota de inmediato aunque la consulta tarde.
export default function Cargando() {
  return (
    <main className="mx-auto max-w-6xl animate-pulse px-4 py-8 sm:px-6 sm:py-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando…</span>
      <div className="h-7 w-56 rounded-lg bg-slate-200" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-200" />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-white ring-1 ring-slate-200" />
        ))}
      </div>
    </main>
  );
}
