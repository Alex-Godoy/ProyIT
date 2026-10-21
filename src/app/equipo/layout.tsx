import type { ReactNode } from "react";
import { requireEquipo } from "@/lib/auth";
import PortalHeader from "@/components/portal-header";
import InactivityLogout from "@/components/inactivity-logout";

export const metadata = { title: "Mis asignaciones · ProyIT" };

export default async function EquipoLayout({ children }: { children: ReactNode }) {
  const { miembro } = await requireEquipo();
  return (
    <div className="min-h-screen bg-fondo">
      <PortalHeader rol="equipo" nombre={miembro.nombre} />
      {children}
      {/* El equipo accede a datos de clientes: misma sesión corta que el admin. */}
      <InactivityLogout minutos={15} />
    </div>
  );
}
