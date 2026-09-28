import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import ClienteForm from "@/components/admin/cliente-form";
import { Avisos } from "@/components/admin/avisos";
import { crearClienteAction } from "../../actions";

export default async function NuevoClientePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  await requireAdmin();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/admin/clientes" className="text-sm font-medium text-brand-blue hover:underline">
        ← Clientes
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-navy">Nuevo cliente</h1>
      <Avisos error={error} />
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <ClienteForm action={crearClienteAction} textoBoton="Crear cliente" />
      </div>
    </main>
  );
}
