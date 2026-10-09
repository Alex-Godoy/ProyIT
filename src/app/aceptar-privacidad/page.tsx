import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUsuario } from "@/lib/auth";
import { POLITICA_VERSION } from "@/lib/empresa";
import { destinoSeguro } from "@/lib/destino";
import { Logo } from "@/components/brand";
import { BotonEnviar } from "@/components/admin/ui";
import { aceptarPoliticaAction } from "./actions";

export const metadata = { title: "Tu privacidad · Portal ProyIT" };

export default async function AceptarPrivacidadPage({
  searchParams,
}: {
  searchParams: Promise<{ siguiente?: string }>;
}) {
  const siguiente = destinoSeguro((await searchParams).siguiente);
  const { perfil } = await requireUsuario({ sinPolitica: true });
  if (perfil?.privacidad_version === POLITICA_VERSION) redirect(siguiente);
  const esActualizacion = !!perfil?.privacidad_version;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <Logo />
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <h1 className="text-2xl font-bold text-navy">
            {esActualizacion ? "Actualizamos nuestra Política de Privacidad" : "Antes de continuar"}
          </h1>
          <p className="mt-2 text-muted">
            {esActualizacion
              ? "Revisa los cambios para seguir usando el portal."
              : "Queremos que sepas cómo cuidamos tus datos en el portal."}
          </p>

          <ul className="mt-6 space-y-3 text-sm text-ink">
            {[
              "Usamos tus datos solo para darte acceso al portal y mostrarte tus proyectos.",
              "No los vendemos ni los usamos para publicidad.",
              "Nuestros proveedores (Supabase y Vercel) los alojan en EE.UU., con garantías de protección.",
              "Solo el equipo de ProyIT asignado a cada proyecto ve sus datos, según su cargo.",
              "Puedes ver, corregir, descargar o pedir eliminar tus datos desde “Mis datos”.",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-navy">
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-muted">
            Lee el detalle completo en la{" "}
            <Link href="/privacidad" target="_blank" className="font-semibold text-brand-blue hover:underline">
              Política de Privacidad
            </Link>
            .
          </p>

          <form action={aceptarPoliticaAction} className="mt-6 space-y-4">
            <input type="hidden" name="siguiente" value={siguiente} />
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" name="acepto" required className="mt-0.5 h-4 w-4 accent-navy" />
              <span className="text-ink">He leído y acepto la Política de Privacidad del portal.</span>
            </label>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                formAction="/auth/signout"
                formMethod="post"
                formNoValidate
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-ink"
              >
                No acepto, cerrar sesión
              </button>
              <BotonEnviar>Aceptar y continuar</BotonEnviar>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
