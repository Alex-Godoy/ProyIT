"use client";

import { useRef } from "react";
import { MAX_ADJUNTOS } from "@/lib/tickets";
import { formatearTamano } from "@/lib/proyectos";

export default function SelectorArchivos({
  archivos,
  onChange,
  disabled,
}: {
  archivos: File[];
  onChange: (archivos: File[]) => void;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={disabled || archivos.length >= MAX_ADJUNTOS}
          onClick={() => input.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
          </svg>
          Adjuntar
        </button>
        <span className="text-xs text-muted">Fotos, PDF u Office. Hasta {MAX_ADJUNTOS} archivos de 20 MB.</span>
        <input
          ref={input}
          type="file"
          multiple
          className="sr-only"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
          onChange={(e) => {
            const nuevos = Array.from(e.target.files ?? []);
            onChange([...archivos, ...nuevos].slice(0, MAX_ADJUNTOS));
            e.target.value = "";
          }}
        />
      </div>
      {archivos.length > 0 && (
        <ul className="mt-2 space-y-1">
          {archivos.map((a, i) => (
            <li key={`${a.name}-${i}`} className="flex items-center justify-between gap-2 rounded-lg bg-surface px-3 py-1.5 text-sm">
              <span className="min-w-0 truncate text-ink">
                {a.name} <span className="text-xs text-muted">· {formatearTamano(a.size)}</span>
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(archivos.filter((_, j) => j !== i))}
                className="shrink-0 text-xs font-medium text-red-600 hover:underline"
                aria-label={`Quitar ${a.name}`}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
