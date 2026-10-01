"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Resumen", exacto: true },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/proyectos", label: "Proyectos" },
  { href: "/admin/tickets", label: "Tickets" },
  { href: "/admin/equipo", label: "Equipo" },
  { href: "/admin/solicitudes", label: "Solicitudes" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex gap-5 overflow-x-auto sm:gap-6">
          {LINKS.map((l) => {
            const activo = l.exacto ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap border-b-2 py-3 text-sm font-medium ${
                  activo ? "border-brand-blue text-navy" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        <span className="hidden whitespace-nowrap rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange-dark sm:inline-flex">
          Super usuario
        </span>
      </div>
    </nav>
  );
}
