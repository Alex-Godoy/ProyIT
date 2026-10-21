import type { ReactNode } from "react";
import { requireUsuario } from "@/lib/auth";
import PortalHeader from "@/components/portal-header";
import InactivityLogout from "@/components/inactivity-logout";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const { user, perfil } = await requireUsuario();
  return (
    <div className="min-h-screen bg-fondo">
      <PortalHeader rol={perfil?.role ?? "cliente"} nombre={perfil?.full_name ?? user.email ?? "Mi cuenta"} />
      {children}
      <InactivityLogout minutos={30} />
    </div>
  );
}
