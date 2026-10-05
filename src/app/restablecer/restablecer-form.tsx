"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Se llega aquí desde el enlace del correo de recuperación: /auth/callback ya
// dejó una sesión activa, que es la que permite cambiar la contraseña.
export default function RestablecerForm() {
  const router = useRouter();
  const supabase = createClient();
  const [sesion, setSesion] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSesion(!!data.user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(
        /same|different/i.test(error.message)
          ? "La nueva contraseña debe ser distinta a la anterior."
          : "No pudimos guardar la contraseña. Debe tener al menos 8 caracteres y no ser una contraseña filtrada."
      );
      setCargando(false);
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <h1 className="text-2xl font-bold text-navy">Crea una nueva contraseña</h1>

      {sesion === null && <p className="mt-4 text-sm text-muted">Un momento…</p>}

      {sesion === false && (
        <>
          <p className="mt-2 text-sm text-ink">
            El enlace ya no es válido o venció. Pide uno nuevo y ábrelo desde el mismo navegador.
          </p>
          <Link
            href="/login"
            className="mt-6 block w-full rounded-lg bg-brand-orange-text px-4 py-3 text-center font-semibold text-white hover:bg-brand-orange-text-dark"
          >
            Volver a ingresar
          </Link>
        </>
      )}

      {sesion && (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={verPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                aria-describedby="password-ayuda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-24 text-ink outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              />
              <button
                type="button"
                aria-pressed={verPassword}
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-semibold text-navy hover:underline"
                onClick={() => setVerPassword(!verPassword)}
              >
                {verPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <p id="password-ayuda" className="mt-1.5 text-xs text-muted">Mínimo 8 caracteres.</p>
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg bg-brand-orange-text px-4 py-3 font-semibold text-white hover:bg-brand-orange-text-dark disabled:opacity-60"
          >
            {cargando ? "Un momento…" : "Guardar e ingresar"}
          </button>
        </form>
      )}
    </div>
  );
}
