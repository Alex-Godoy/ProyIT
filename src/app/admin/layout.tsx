import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import PortalHeader from "@/components/portal-header";
import InactivityLogout from "@/components/inactivity-logout";

export const metadata = { title: "Administración · ProyIT" };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, perfil } = await requireAdmin();
  return (
    <div className="min-h-screen bg-fondo">
      <PortalHeader rol="admin" nombre={perfil?.full_name ?? user.email ?? "Super usuario"} />
      {children}
      {/* Sesión más corta: el panel da acceso a datos de todos los clientes. */}
      <InactivityLogout minutos={15} />
    </div>
  );
}
