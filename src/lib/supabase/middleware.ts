import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_KEY } from "./config";
import { destinoSeguro } from "@/lib/destino";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Rutas privadas
  if (!user && (path.startsWith("/portal") || path.startsWith("/admin") || path.startsWith("/equipo") || path === "/aceptar-privacidad")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    // Tras ingresar, vuelve a donde iba (p. ej. "Nuevo ticket" desde el home).
    if (path !== "/portal" && path !== "/aceptar-privacidad") url.searchParams.set("siguiente", path);
    return NextResponse.redirect(url);
  }

  // Si ya inició sesión, no mostrar login
  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    // El super usuario sigue a /admin desde /portal.
    url.pathname = destinoSeguro(request.nextUrl.searchParams.get("siguiente"));
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
