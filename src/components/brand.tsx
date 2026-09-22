import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Portal ProyIT">
      <span
        className={`text-2xl font-extrabold tracking-tight ${light ? "text-white" : "text-navy"}`}
      >
        Proy<span className="text-brand-blue">IT</span>
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
          light ? "bg-white/15 text-white" : "bg-navy/10 text-navy"
        }`}
      >
        Portal
      </span>
    </Link>
  );
}

export type Modulo = {
  key: string;
  titulo: string;
  texto: string;
  icon: React.ReactNode;
};

const svg = "h-6 w-6";

export const MODULOS: Modulo[] = [
  {
    key: "proyectos",
    titulo: "Mis proyectos y avance",
    texto:
      "Revisa en qué etapa está cada solución que implementamos contigo: hitos, entregables y próximos pasos, sin tener que preguntar.",
    icon: (
      <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 5-6" /></svg>
    ),
  },
  {
    key: "soporte",
    titulo: "Tickets de soporte",
    texto:
      "Abre una solicitud, adjunta lo que necesites y sigue su estado en tiempo real. Todo queda registrado, nada se pierde en un chat.",
    icon: (
      <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 9h8M8 13h5" /></svg>
    ),
  },
  {
    key: "novedades",
    titulo: "Novedades y comunicados",
    texto:
      "Mejoras a tus soluciones, mantenciones programadas y recomendaciones prácticas para sacarle más provecho a tu tecnología.",
    icon: (
      <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>
    ),
  },
  {
    key: "beneficios",
    titulo: "Programa de beneficios",
    texto:
      "Suma beneficios por tu permanencia y por recomendar ProyIT. Descuentos en nuevos servicios, horas de asesoría y acceso anticipado.",
    icon: (
      <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12" /><path d="M2 7h20v5H2z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>
    ),
  },
];
