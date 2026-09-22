import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo, MODULOS } from "@/components/brand";

export const metadata = { title: "Mi portal · ProyIT" };

export default async function PortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("full_name, company")
    .eq("id", user.id)
    .maybeSingle();

  const nombre = perfil?.full_name?.split(" ")[0] ?? user.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <form action="/auth/signout" method="post">
            <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink hover:bg-slate-50">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold text-navy">Hola, {nombre}</h1>
        <p className="mt-2 text-muted">
          {perfil?.company ? `${perfil.company} · ` : ""}
          Estamos preparando tu portal. Estos módulos se irán activando muy pronto.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {MODULOS.map((m) => (
            <article key={m.key} className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <span className="absolute right-5 top-5 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange-dark">
                Próximamente
              </span>
              <div className="mb-4 inline-flex rounded-lg bg-navy/5 p-2.5 text-navy">{m.icon}</div>
              <h2 className="text-lg font-semibold text-ink">{m.titulo}</h2>
              <p className="mt-2 text-muted">{m.texto}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
