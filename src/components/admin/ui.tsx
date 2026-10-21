"use client";

import { useFormStatus } from "react-dom";

export const inputClase =
  "min-h-11 w-full rounded-xl border border-[#c3d0e3] bg-white px-3.5 py-2.5 text-[15px] text-tinta placeholder:text-[#8494ab] transition focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/15";

export const labelClase = "mb-1.5 block text-sm font-semibold text-tinta";

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
    primario: "bg-navy text-white hover:bg-marino",
    secundario: "border-2 border-navy text-navy hover:bg-navy hover:text-white",
    peligro: "text-red-700 hover:bg-red-50",
  }[variante];

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:opacity-60 ${clases}`}
    >
      {pending ? "Guardando…" : children}
    </button>
  );
}
