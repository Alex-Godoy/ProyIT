"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BUCKET_DOCUMENTOS } from "@/lib/proyectos";
import { registrarDocumentoAction } from "@/app/admin/actions";

const LIMITE_BYTES = 50 * 1024 * 1024;

// Nombre seguro para la ruta en Storage (sin tildes ni espacios); el nombre
// original se guarda aparte para mostrarlo al cliente.
function nombreSeguro(nombre: string) {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(-100);
}

export default function SubirDocumento({ proyectoId }: { proyectoId: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setError(null);

    if (archivo.size > LIMITE_BYTES) {
      setError("El archivo supera el máximo de 50 MB.");
      e.target.value = "";
      return;
    }

    setSubiendo(true);
    const ruta = `${proyectoId}/${crypto.randomUUID()}-${nombreSeguro(archivo.name)}`;
    const supabase = createClient();
    const { error: errSubida } = await supabase.storage
      .from(BUCKET_DOCUMENTOS)
      .upload(ruta, archivo, { contentType: archivo.type || undefined });

    if (errSubida) {
      setError("No se pudo subir el archivo. Inténtalo de nuevo.");
    } else {
      const res = await registrarDocumentoAction(proyectoId, {
        nombre: archivo.name,
        storagePath: ruta,
        tamanoBytes: archivo.size,
        mimeType: archivo.type,
      });
      if (res.error) setError(res.error);
      else router.refresh();
    }

    setSubiendo(false);
    if (input.current) input.current.value = "";
  }

  return (
    <div>
      <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-50">
        {subiendo ? "Subiendo…" : "+ Subir documento"}
        <input ref={input} type="file" className="sr-only" onChange={onChange} disabled={subiendo} />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
