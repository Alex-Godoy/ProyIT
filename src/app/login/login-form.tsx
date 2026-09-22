"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Modo = "ingreso" | "registro";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [modo, setModo] = useState<Modo>(
    params.get("modo") === "registro" ? "registro" : "ingreso"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") ? "No pudimos validar tu acceso. Inténtalo de nuevo." : null
  );
  const [aviso, setAviso] = useState<string | null>(null);

  const supabase = createClient();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setAviso(null);

    if (modo === "ingreso") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(
          error.message.includes("Invalid login")
            ? "Correo o contraseña incorrectos."
            : error.message.includes("Email not confirmed")
              ? "Confirma tu correo antes de ingresar (revisa tu bandeja)."
              : "No pudimos iniciar sesión. Inténtalo de nuevo."
        );
      } else {
        router.push("/portal");
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: nombre, company: empresa },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(
          error.message.includes("Password")
            ? "La contraseña debe tener al menos 6 caracteres."
            : "No pudimos crear tu cuenta. Revisa los datos e inténtalo de nuevo."
        );
      } else if (data.session) {
        router.push("/portal");
        router.refresh();
      } else {
        setAviso("¡Listo! Te enviamos un correo para confirmar tu cuenta.");
      }
    }
    setCargando(false);
  }

  async function conGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError("El ingreso con Google aún no está habilitado.");
  }

  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-ink outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-2xl font-bold text-navy">
        {modo === "ingreso" ? "Ingresa a tu portal" : "Crea tu cuenta"}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {modo === "ingreso"
          ? "Bienvenido de vuelta."
          : "Usa el correo con el que trabajas con ProyIT."}
      </p>

      <button
        type="button"
        onClick={conGoogle}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-ink hover:bg-slate-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        Continuar con Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted">
        <span className="h-px flex-1 bg-slate-200" /> o con tu correo <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {modo === "registro" && (
          <>
            <input className={input} placeholder="Nombre y apellido" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <input className={input} placeholder="Empresa" value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
          </>
        )}
        <input className={input} type="email" placeholder="correo@empresa.cl" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={input} type="password" placeholder="Contraseña" autoComplete={modo === "ingreso" ? "current-password" : "new-password"} minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {aviso && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{aviso}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-lg bg-brand-orange px-4 py-3 font-semibold text-white hover:bg-brand-orange-dark disabled:opacity-60"
        >
          {cargando ? "Un momento…" : modo === "ingreso" ? "Ingresar" : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {modo === "ingreso" ? "¿Aún no tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
        <button
          type="button"
          className="font-semibold text-navy hover:underline"
          onClick={() => {
            setModo(modo === "ingreso" ? "registro" : "ingreso");
            setError(null);
            setAviso(null);
          }}
        >
          {modo === "ingreso" ? "Créala aquí" : "Ingresa aquí"}
        </button>
      </p>
    </div>
  );
}
