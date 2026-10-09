"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import logoBlanco from "../../../public/brand/proyit-logo-blanco.png";
import { BotonAgendar } from "./agendar";

const SECCIONES = [
  { id: "como-trabajamos", label: "Cómo trabajamos" },
  { id: "lo-que-construimos", label: "Lo que construimos" },
  { id: "soporte", label: "Soporte" },
  { id: "que-resolvemos", label: "Qué resolvemos" },
  // En escritorio no cabe junto a "Soporte": queda solo en el menú móvil.
  { id: "clientes", label: "Clientes", soloMovil: true },
];

export default function Encabezado() {
  const [abierto, setAbierto] = useState(false);
  const [conSombra, setConSombra] = useState(false);
  const [activa, setActiva] = useState<string | null>(null);

  useEffect(() => {
    const alScroll = () => setConSombra(window.scrollY > 8);
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });

    // Marca en el menú la sección que se está leyendo.
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) setActiva(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    const hero = document.getElementById("inicio");
    if (hero) observador.observe(hero);
    SECCIONES.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observador.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", alScroll);
      observador.disconnect();
    };
  }, []);

  // Escape cierra el menú móvil.
  useEffect(() => {
    if (!abierto) return;
    const alTecla = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", alTecla);
    return () => window.removeEventListener("keydown", alTecla);
  }, [abierto]);

  return (
    <header
      className={`sticky top-0 z-30 bg-noche text-white transition-shadow ${
        conSombra ? "shadow-lg shadow-black/20" : ""
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link href="/" aria-label="ProyIT, inicio" className="shrink-0" onClick={() => setAbierto(false)}>
          <Image src={logoBlanco} alt="ProyIT" priority className="h-7 w-auto sm:h-8" />
        </Link>

        <nav aria-label="Secciones" className="hidden items-center gap-6 whitespace-nowrap text-sm lg:flex">
          {SECCIONES.filter((s) => !("soloMovil" in s)).map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={activa === s.id ? "true" : undefined}
              className={`transition hover:text-white ${activa === s.id ? "text-white" : "text-white/80"}`}
            >
              {s.label}
            </a>
          ))}
          <Link href="/login" className="text-white/80 transition hover:text-white">
            Portal clientes
          </Link>
          <BotonAgendar origen="menu" className="whitespace-nowrap px-5 py-2.5">
            Agendar diagnóstico
          </BotonAgendar>
        </nav>

        <button
          type="button"
          className="-mr-2 rounded-lg p-2 text-white lg:hidden"
          aria-expanded={abierto}
          aria-controls="menu-movil"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setAbierto((a) => !a)}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {abierto ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {abierto && (
        <nav id="menu-movil" aria-label="Secciones" className="border-t border-white/10 px-4 pb-6 pt-2 sm:px-6 lg:hidden">
          <ul className="flex flex-col">
            {SECCIONES.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setAbierto(false)}
                  className="block border-b border-white/10 py-3.5 text-base text-white/90"
                >
                  {s.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/login" className="block border-b border-white/10 py-3.5 text-base text-white/90">
                Portal clientes
              </Link>
            </li>
          </ul>
          <div className="mt-5" onClick={() => setAbierto(false)}>
            <BotonAgendar origen="menu" className="w-full">
              Agendar diagnóstico
            </BotonAgendar>
          </div>
        </nav>
      )}
    </header>
  );
}
