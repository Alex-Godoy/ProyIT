import type { ReactNode } from "react";
import { requireUsuario } from "@/lib/auth";
import PortalHeader from "@/components/portal-header";
import InactivityLogout from "@/components/inactivity-logout";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const { perfil } = await requireUsuario();
  return (
    <div className="min-h-screen bg-surface">
      <PortalHeader esAdmin={perfil?.role === "admin"} />
      {children}
      <InactivityLogout minutos={30} />
    </div>
  );
}
