import { textoMensaje } from "@/lib/mensajes";

// `error` es un código (ver lib/mensajes); nunca se muestra el texto de la URL.
export function Avisos({ error, ok }: { error?: string; ok?: string }) {
  if (error) {
    return (
      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
        {textoMensaje(error)}
      </div>
    );
  }
  if (ok) {
    return (
      <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
        Cambios guardados.
      </div>
    );
  }
  return null;
}
