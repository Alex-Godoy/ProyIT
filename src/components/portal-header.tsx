"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand";

const INICIO = {
  admin: { href: "/admin", label: "Administración" },
  equipo: { href: "/equipo", label: "Mis proyectos" },
  cliente: { href: "/portal", label: "Mi portal" },
} as const;

export default function PortalHeader({ rol }: { rol: keyof typeof INICIO }) {
  const pathname = usePathname();
  // Cada rol tiene su propio inicio; "Mis datos" es común a todos.
  const enMisDatos = pathname.startsWith("/portal/mis-datos");
  const inicio = INICIO[rol];
  const links = [
    { ...inicio, activo: pathname.startsWith(inicio.href) && !enMisDatos },
    { href: "/portal/mis-datos", label: "Mis datos", activo: enMisDatos },
  ];

  const linkClase = (activo: boolean) =>
    `rounded-lg px-3 py-2 font-medium transition ${
      activo ? "bg-navy/5 text-navy" : "text-muted hover:text-navy"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Logo />
        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          {/* En móvil los links bajan a una segunda fila */}
          <div className="hidden items-center gap-1 sm:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={linkClase(l.activo)}>
                {l.label}
              </Link>
            ))}
          </div>
          <form action="/auth/signout" method="post">
            <button
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 font-medium text-ink hover:bg-slate-50"
              aria-label="Cerrar sesión"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </form>
        </nav>
      </div>
      {links.length > 1 && (
        <div className="flex gap-1 border-t border-slate-100 px-2 py-1.5 text-sm sm:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`flex-1 text-center ${linkClase(l.activo)}`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
