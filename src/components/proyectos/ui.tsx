import { etapaInfo } from "@/lib/proyectos";

export function EtapaBadge({ etapa }: { etapa: string }) {
  const info = etapaInfo(etapa);
  return (
    <span className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${info.clase}`}>
      {info.etiqueta}
    </span>
  );
}

export function BarraAvance({ avance }: { avance: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">Avance</span>
        <span className="font-semibold text-ink">{avance}%</span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={avance}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-brand-blue" style={{ width: `${avance}%` }} />
      </div>
    </div>
  );
}
