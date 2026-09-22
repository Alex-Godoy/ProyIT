# Portal ProyIT

Portal de clientes de ProyIT: comunicación y fidelización. Next.js 15 (App Router) + Supabase Auth + Tailwind v4, desplegado en Vercel.

## Estado (v0.1)

- Landing pública del portal (`/`)
- Login y registro con email/contraseña y Google (`/login`)
- Panel privado protegido por middleware (`/portal`) con los 4 módulos en "Próximamente":
  proyectos y avance, tickets de soporte, novedades, programa de beneficios
- Supabase (proyecto `ProyIT`): tabla `profiles` con RLS, creada automáticamente al registrarse; rol `cliente`/`admin` protegido contra auto-asignación

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=https://ptlpamubtydzcoufvxus.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

## Configuración pendiente en Supabase

1. **Authentication → URL Configuration**: Site URL = dominio de Vercel; agregar `https://<dominio>/auth/callback` a Redirect URLs.
2. **Authentication → Providers → Google**: habilitar y pegar Client ID/Secret de Google Cloud. En Google Cloud, redirect URI autorizado: `https://ptlpamubtydzcoufvxus.supabase.co/auth/v1/callback`.
3. Para darte rol admin: `update profiles set role = 'admin' where email = 'tu@correo';` (desde el SQL editor).

## Desarrollo

```bash
npm install
cp .env.example .env.local
npm run dev
```
