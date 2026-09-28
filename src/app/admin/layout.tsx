import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import PortalHeader from "@/components/portal-header";
import InactivityLogout from "@/components/inactivity-logout";
import AdminNav from "@/components/admin/admin-nav";

export const metadata = { title: "Administración · ProyIT" };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-surface">
      <PortalHeader esAdmin />
      <AdminNav />
      {children}
      {/* Sesión más corta: el panel da acceso a datos de todos los clientes. */}
      <InactivityLogout minutos={15} />
    </div>
  );
}
