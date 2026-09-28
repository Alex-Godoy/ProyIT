"use client";

import { useFormStatus } from "react-dom";

export const inputClase =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20";

export const labelClase = "mb-1 block text-sm font-medium text-ink";

export function BotonEnviar({
  children,
  variante = "primario",
  confirmar,
}: {
  children: React.ReactNode;
  variante?: "primario" | "secundario" | "peligro";
  confirmar?: string;
}) {
  const { pending } = useFormStatus();
  const clases = {
    primario: "bg-navy text-white hover:bg-navy-dark",
    secundario: "border border-slate-300 text-ink hover:bg-slate-50",
    peligro: "text-red-600 hover:bg-red-50",
  }[variante];

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${clases}`}
    >
      {pending ? "Guardando…" : children}
    </button>
  );
}
