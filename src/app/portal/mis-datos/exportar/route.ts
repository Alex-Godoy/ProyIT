import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { COLUMNAS_SOLICITUD } from "@/lib/derechos";
import { RESPONSABLE } from "@/lib/empresa";

// Derecho de acceso y portabilidad: entrega en JSON los datos personales del
// titular que están en el portal. RLS garantiza que solo vea los suyos.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const [{ data: perfil }, { data: accesos }, { data: solicitudes }] = await Promise.all([
    supabase
      .from("profiles")
      .select("email, full_name, company, role, privacidad_version, privacidad_aceptada_at, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("cliente_accesos")
      .select("email, nombre_contacto, cargo, created_at, cliente:clientes(tipo, nombre, rut)")
      .eq("user_id", user.id),
    supabase.from("solicitudes_derechos").select(COLUMNAS_SOLICITUD).eq("user_id", user.id),
  ]);

  const exportacion = {
    generado_at: new Date().toISOString(),
    responsable: `${RESPONSABLE.razonSocial} (${RESPONSABLE.nombreComercial})`,
    cuenta: {
      id: user.id,
      email: user.email,
      proveedor_ingreso: user.app_metadata?.provider ?? null,
      ultimo_ingreso: user.last_sign_in_at ?? null,
    },
    perfil,
    accesos_a_clientes: accesos ?? [],
    solicitudes_de_derechos: solicitudes ?? [],
  };

  return new NextResponse(JSON.stringify(exportacion, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="mis-datos-proyit.json"`,
      "Cache-Control": "no-store",
    },
  });
}
