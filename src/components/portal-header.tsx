"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import logoBlanco from "../../public/brand/proyit-logo-blanco.png";

// Pestañas por rol. "Mis datos" va aparte, junto a la cuenta. Un enlace queda
// activo si la ruta empieza con su href y no corresponde a otro más específico.
const ENLACES = {
  admin: [
    { href: "/admin", label: "Resumen" },
    { href: "/admin/diagnosticos", label: "Contactos web" },
    { href: "/admin/clientes", label: "Clientes" },
    { href: "/admin/proyectos", label: "Proyectos" },
    { href: "/admin/tickets", label: "Tickets" },
    { href: "/admin/equipo", label: "Equipo" },
    { href: "/admin/solicitudes", label: "Solicitudes" },
  ],
  equipo: [
    { href: "/equipo", label: "Mis proyectos" },
    { href: "/equipo/tickets", label: "Mis tickets" },
  ],
  cliente: [
    { href: "/portal", label: "Inicio" },
    { href: "/portal/proyectos", label: "Proyectos" },
    { href: "/portal/tickets", label: "Soporte" },
  ],
} as const;

const ROL_VISIBLE = { admin: "Super usuario", equipo: "Equipo ProyIT", cliente: "Portal clientes" } as const;

const MIS_DATOS = "/portal/mis-datos";

function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase() || "?";
}

export default function PortalHeader({ rol, nombre }: { rol: keyof typeof ENLACES; nombre: string }) {
  const pathname = usePathname();
  const enlaces = ENLACES[rol];
  const masEspecifico = [...enlaces, { href: MIS_DATOS }]
    .filter((l) => pathname === l.href || pathname.startsWith(`${l.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  const enMisDatos = masEspecifico === MIS_DATOS;

  // En el celular las pestañas se deslizan: la activa siempre queda a la vista.
  const activa = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    activa.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 bg-marino text-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.6)]">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3">
          <Link href="/" aria-label="ProyIT, ir al sitio" className="flex min-h-11 shrink-0 items-center gap-3">
            <Image src={logoBlanco} alt="ProyIT" priority className="h-8 w-auto sm:h-9" />
            <span className="hidden rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-niebla sm:inline">
              {ROL_VISIBLE[rol]}
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href={MIS_DATOS}
              aria-current={enMisDatos ? "page" : undefined}
              title="Mis datos"
              className={`flex min-h-11 items-center gap-2.5 rounded-full py-1 pl-1 pr-1 transition sm:pr-4 ${
                enMisDatos ? "bg-white/15" : "hover:bg-white/10"
              }`}
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange text-[13px] font-extrabold text-marino"
              >
                {iniciales(nombre)}
              </span>
              <span className="hidden min-w-0 text-left leading-tight sm:block">
                <span className="block max-w-[14em] truncate text-sm font-semibold">{nombre}</span>
                <span className="block text-xs text-niebla">Mis datos</span>
              </span>
              <span className="sr-only sm:hidden">Mis datos</span>
            </Link>
            <form action="/auth/signout" method="post">
              <button
                className="flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-3 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/10 sm:px-4"
                aria-label="Cerrar sesión"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                <span className="hidden md:inline">Salir</span>
              </button>
            </form>
          </div>
        </div>

        {/* Pestañas: en pantallas chicas se deslizan de lado. */}
        <nav aria-label="Secciones del portal" className="-mx-4 sm:mx-0">
          <ul className="flex gap-1 overflow-x-auto px-2 [scrollbar-width:none] max-sm:[mask-image:linear-gradient(90deg,#000_85%,transparent)] sm:gap-2 sm:px-0 [&::-webkit-scrollbar]:hidden">
            {enlaces.map((l) => {
              const activo = l.href === masEspecifico;
              return (
                <li key={l.href} className="shrink-0">
                  <Link
                    href={l.href}
                    ref={activo ? activa : undefined}
                    aria-current={activo ? "page" : undefined}
                    className={`relative flex min-h-12 items-center whitespace-nowrap px-3 text-[15px] font-semibold transition after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t-full after:transition ${
                      activo
                        ? "text-white after:bg-brand-orange"
                        : "text-niebla after:bg-transparent hover:text-white hover:after:bg-white/25"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
