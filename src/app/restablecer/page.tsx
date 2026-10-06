import { Logo } from "@/components/brand";
import RestablecerForm from "./restablecer-form";

export const metadata = { title: "Nueva contraseña · Portal ProyIT" };

export default function RestablecerPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Logo />
        </div>
        <RestablecerForm />
      </div>
    </main>
  );
}
