import type { TipoCliente } from "@/lib/clientes";

export function TipoBadge({ tipo }: { tipo: TipoCliente }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        tipo === "empresa" ? "bg-navy/5 text-navy" : "bg-brand-blue/10 text-brand-blue"
      }`}
    >
      {tipo === "empresa" ? (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      )}
      {tipo === "empresa" ? "Empresa" : "Persona"}
    </span>
  );
}
