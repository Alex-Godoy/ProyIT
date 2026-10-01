import { textoMensaje, textoOk } from "@/lib/mensajes";

// `error` y `ok` son códigos (ver lib/mensajes); nunca se muestra el texto de la URL.
export function Avisos({ error, ok }: { error?: string; ok?: string }) {
  if (error) {
    return (
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
        <span aria-hidden>⚠</span>
        {textoMensaje(error)}
      </div>
    );
  }
  if (ok) {
    return (
      <div
        className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        role="status"
      >
        <span aria-hidden>✓</span>
        {textoOk(ok)}
      </div>
    );
  }
  return null;
}
