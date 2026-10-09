"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { POLITICA_VERSION } from "@/lib/empresa";
import { destinoSeguro } from "@/lib/destino";
import Captcha, { TURNSTILE_SITE_KEY, type CaptchaHandle } from "@/components/captcha";

type Modo = "ingreso" | "registro" | "recuperar";

const FALTA_CAPTCHA = "Completa la verificación de seguridad que está sobre el botón para continuar.";
const MENSAJE_CAPTCHA = "No pudimos verificar que eres una persona. Espera la verificación e inténtalo de nuevo.";

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
  const [aceptaPolitica, setAceptaPolitica] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captcha = useRef<CaptchaHandle>(null);
  const faltaCaptcha = !!TURNSTILE_SITE_KEY && !captchaToken;
  const [error, setError] = useState<string | null>(
    params.get("error") ? "No pudimos validar tu acceso. Inténtalo de nuevo." : null
  );
  const [aviso, setAviso] = useState<string | null>(
    params.get("motivo") === "inactividad" ? "Cerramos tu sesión por inactividad. Ingresa de nuevo para continuar." : null
  );

  const supabase = createClient();
  // Página a la que iba antes de que se le pidiera ingresar.
  const siguiente = destinoSeguro(params.get("siguiente"));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    // El botón nunca se bloquea esperando el captcha: si falta, se explica qué hacer.
    if (faltaCaptcha) {
      setError(FALTA_CAPTCHA);
      return;
    }
    setCargando(true);

    if (modo === "recuperar") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/restablecer`,
        captchaToken: captchaToken ?? undefined,
      });
      if (error && /captcha/i.test(error.message)) {
        setError(MENSAJE_CAPTCHA);
      } else if (error) {
        setError("No pudimos enviar el correo. Inténtalo de nuevo en unos minutos.");
      } else {
        // Mismo mensaje exista o no la cuenta, para no revelar quién está registrado.
        setAviso("Si ese correo tiene una cuenta, te enviamos un enlace para crear una nueva contraseña. Revisa tu bandeja y el spam.");
      }
    } else if (modo === "ingreso") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken: captchaToken ?? undefined },
      });
      if (error) {
        setError(
          error.message.includes("Invalid login")
            ? "Correo o contraseña incorrectos."
            : /captcha/i.test(error.message)
              ? MENSAJE_CAPTCHA
              : error.message.includes("Email not confirmed")
              ? "Confirma tu correo antes de ingresar (revisa tu bandeja)."
              : "No pudimos iniciar sesión. Inténtalo de nuevo."
        );
      } else {
        router.push(siguiente);
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: nombre, company: empresa, privacidad_version: POLITICA_VERSION },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          captchaToken: captchaToken ?? undefined,
        },
      });
      if (error) {
        setError(
          /captcha/i.test(error.message)
            ? MENSAJE_CAPTCHA
            : error.message.includes("Password")
              ? "La contraseña debe tener al menos 8 caracteres y no puede ser una contraseña filtrada."
              : "No pudimos crear tu cuenta. Revisa los datos e inténtalo de nuevo."
        );
      } else if (data.session) {
        router.push(siguiente);
        router.refresh();
      } else {
        setAviso("¡Listo! Te enviamos un correo para confirmar tu cuenta.");
      }
    }
    // El token del captcha es de un solo uso: se pide uno nuevo tras cada intento.
    captcha.current?.reset();
    setCargando(false);
  }

  async function conGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(siguiente)}` },
    });
    if (error) setError("El ingreso con Google aún no está habilitado.");
  }

  function cambiarModo(nuevo: Modo) {
    setModo(nuevo);
    setError(null);
    setAviso(null);
  }

  const label = "mb-1.5 block text-sm font-medium text-ink";
  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-ink outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <h2 className="text-2xl font-bold text-navy">
        {modo === "ingreso" ? "Ingresa a tu portal" : modo === "registro" ? "Crea tu cuenta" : "Recupera tu contraseña"}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {modo === "ingreso"
          ? siguiente.startsWith("/portal/tickets/nuevo")
            ? "Ingresa y te llevamos directo a pedir soporte."
            : "Bienvenido de vuelta."
          : modo === "registro"
            ? "Usa el correo con el que trabajas con ProyIT."
            : "Escribe tu correo y te enviaremos un enlace para crear una nueva."}
      </p>

      {modo !== "recuperar" && (
        <>
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
        </>
      )}

      <form onSubmit={onSubmit} className={modo === "recuperar" ? "mt-6 space-y-4" : "space-y-4"}>
        {modo === "registro" && (
          <>
            <div>
              <label htmlFor="nombre" className={label}>Nombre y apellido</label>
              <input id="nombre" name="nombre" className={input} autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="empresa" className={label}>Empresa <span className="font-normal text-muted">(opcional)</span></label>
              <input id="empresa" name="empresa" className={input} autoComplete="organization" value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
            </div>
          </>
        )}
        <div>
          <label htmlFor="email" className={label}>Correo</label>
          <input id="email" name="email" className={input} type="email" placeholder="correo@empresa.cl" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {modo !== "recuperar" && (
          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <label htmlFor="password" className="block text-sm font-medium text-ink">Contraseña</label>
              {modo === "ingreso" && (
                <button type="button" className="text-sm font-semibold text-navy hover:underline" onClick={() => cambiarModo("recuperar")}>
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                className={`${input} pr-24`}
                type={verPassword ? "text" : "password"}
                autoComplete={modo === "ingreso" ? "current-password" : "new-password"}
                minLength={modo === "registro" ? 8 : undefined}
                aria-describedby={modo === "registro" ? "password-ayuda" : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
          </div>
        )}
        {modo === "registro" && (
          <>
            <p id="password-ayuda" className="-mt-2 text-xs text-muted">Mínimo 8 caracteres.</p>
            <label className="flex items-start gap-3 text-sm text-ink">
              <input
                type="checkbox"
                checked={aceptaPolitica}
                onChange={(e) => setAceptaPolitica(e.target.checked)}
                required
                className="mt-0.5 h-4 w-4 accent-navy"
              />
              <span>
                He leído y acepto la{" "}
                <Link href="/privacidad" target="_blank" className="font-semibold text-navy hover:underline">
                  Política de Privacidad
                </Link>
                .
              </span>
            </label>
          </>
        )}

        <Captcha ref={captcha} onToken={setCaptchaToken} />

        {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {aviso && <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{aviso}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-lg bg-brand-orange-text px-4 py-3 font-semibold text-white hover:bg-brand-orange-text-dark disabled:opacity-60"
        >
          {cargando
            ? "Un momento…"
            : modo === "ingreso"
              ? "Ingresar"
              : modo === "registro"
                ? "Crear cuenta"
                : "Enviar enlace"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-muted">
        Tratamos tus datos según nuestra{" "}
        <Link href="/privacidad" className="underline hover:text-navy">
          Política de Privacidad
        </Link>
        .
      </p>

      <p className="mt-4 text-center text-sm text-muted">
        {modo === "ingreso" ? "¿Aún no tienes cuenta?" : modo === "registro" ? "¿Ya tienes cuenta?" : "¿Recordaste tu contraseña?"}{" "}
        <button
          type="button"
          className="-my-2 py-2 font-semibold text-navy hover:underline"
          onClick={() => cambiarModo(modo === "ingreso" ? "registro" : "ingreso")}
        >
          {modo === "ingreso" ? "Créala aquí" : "Ingresa aquí"}
        </button>
      </p>
    </div>
  );
}
