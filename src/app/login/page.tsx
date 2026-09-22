import { Suspense } from "react";
import { Logo } from "@/components/brand";
import LoginForm from "./login-form";

export const metadata = { title: "Ingresar · Portal ProyIT" };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-navy p-12 text-white md:flex md:flex-col md:justify-between">
        <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-brand-blue/30 blur-3xl" />
        <Logo light />
        <div className="relative">
          <h1 className="text-3xl font-extrabold leading-tight">
            Claridad sobre tu tecnología y una línea directa con tu equipo ProyIT.
          </h1>
          <ul className="mt-8 space-y-3 text-white/80">
            <li>✓ Avance de tus proyectos en tiempo real</li>
            <li>✓ Soporte con seguimiento, sin perder mensajes</li>
            <li>✓ Novedades y beneficios exclusivos para clientes</li>
          </ul>
        </div>
        <p className="relative text-sm text-white/50">proyit.tech</p>
      </aside>

      <main className="flex items-center justify-center bg-surface px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 md:hidden">
            <Logo />
          </div>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
