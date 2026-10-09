"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CORREO_RECUPERACION } from "@/lib/recuperacion";

// Se llega aquí desde "¿Olvidaste tu contraseña?" del login, que ya envió un
// código por correo. Con el código se abre una sesión (verifyOtp) y con ella
// se guarda la contraseña nueva. Si ya hay sesión (el código se validó pero
// falló la contraseña), solo se pide la contraseña: el código es de un uso.

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-ink outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";
const label = "mb-1.5 block text-sm font-medium text-ink";

export default function RestablecerForm() {
  const router = useRouter();
  const supabase = createClient();
  const [sesion, setSesion] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setEmail(sessionStorage.getItem(CORREO_RECUPERACION) ?? "");
    } catch {
      // Sin sessionStorage la persona escribe su correo.
    }
    supabase.auth.getUser().then(({ data }) => setSesion(!!data.user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (password !== confirmacion) return setError("Las contraseñas no coinciden.");
    setCargando(true);

    if (!sesion) {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: codigo.replace(/\s/g, ""),
        type: "recovery",
      });
      if (error) {
        setError("El código no es válido o ya venció. Revisa que el correo sea el mismo o pide un código nuevo.");
        setCargando(false);
        return;
      }
      setSesion(true);
    }

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
    try {
      sessionStorage.removeItem(CORREO_RECUPERACION);
    } catch {
      // Nada que limpiar.
    }
    router.push("/portal");
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <h1 className="text-2xl font-bold text-navy">Crea una nueva contraseña</h1>

      {sesion === null ? (
        <p className="mt-4 text-sm text-muted">Un momento…</p>
      ) : (
        <>
          {!sesion && (
            <p className="mt-2 text-sm text-ink">
              Si el correo tiene una cuenta, te enviamos un código. Revisa también la carpeta de spam.
            </p>
          )}
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {!sesion && (
              <>
                <div>
                  <label htmlFor="email" className={label}>
                    Correo
                  </label>
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={input}
                  />
                </div>
                <div>
                  <label htmlFor="codigo" className={label}>
                    Código del correo
                  </label>
                  <input
                    id="codigo"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9 ]{6,10}"
                    maxLength={10}
                    placeholder="123456"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                    className={`${input} tracking-[0.2em]`}
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className={label}>
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
                  className={`${input} pr-24`}
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
              <p id="password-ayuda" className="mt-1.5 text-xs text-muted">
                Mínimo 8 caracteres.
              </p>
            </div>

            <div>
              <label htmlFor="confirmacion" className={label}>
                Repite la nueva contraseña
              </label>
              <input
                id="confirmacion"
                type={verPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                required
                className={input}
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-lg bg-brand-orange-text px-4 py-3 font-semibold text-white hover:bg-brand-orange-text-dark disabled:opacity-60"
            >
              {cargando ? "Un momento…" : "Guardar e ingresar"}
            </button>
          </form>

          {!sesion && (
            <p className="mt-5 text-center text-sm text-muted">
              ¿No te llegó?{" "}
              <Link href="/login?modo=recuperar" className="font-semibold text-navy hover:underline">
                Pide otro código
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  );
}
