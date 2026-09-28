-- Clientes administrados por el super usuario (rol admin).
-- Reemplaza empresas/empresa_miembros: un cliente es una empresa o una
-- persona, y sus usuarios del portal se vinculan por correo (cliente_accesos).
-- Al aplicarse, las tablas anteriores estaban vacías.

drop policy if exists "proyectos_select" on public.proyectos;
drop policy if exists "proyectos_admin_write" on public.proyectos;
alter table public.proyectos drop constraint if exists proyectos_tiene_dueno;
alter table public.proyectos drop column if exists empresa_id;
alter table public.proyectos drop column if exists cliente_id;
drop table if exists public.empresa_miembros, public.empresas;

-- ---------------------------------------------------------------------------
-- Clientes
-- ---------------------------------------------------------------------------

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('empresa', 'persona')),
  nombre text not null,          -- razón social o nombre completo
  nombre_fantasia text,          -- solo empresas
  rut text,
  giro text,                     -- solo empresas
  email text,
  telefono text,
  direccion text,
  comuna text,
  region text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index clientes_rut_unico on public.clientes (rut) where rut is not null;

create trigger clientes_updated_at
  before update on public.clientes
  for each row execute function public.tocar_updated_at();

-- Correos con acceso al portal para cada cliente. user_id se completa solo
-- cuando existe un usuario con ese correo confirmado.
create table public.cliente_accesos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  email text not null check (email = lower(email)),
  nombre_contacto text,
  cargo text,
  user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (cliente_id, email)
);
create index cliente_accesos_user_idx on public.cliente_accesos (user_id);
create index cliente_accesos_email_idx on public.cliente_accesos (email);

alter table public.proyectos
  add column cliente_id uuid not null references public.clientes (id) on delete restrict;
create index proyectos_cliente_idx on public.proyectos (cliente_id);

-- ---------------------------------------------------------------------------
-- Vinculación automática por correo confirmado
-- ---------------------------------------------------------------------------

-- Al agregar un acceso: si ya hay un usuario confirmado con ese correo, se vincula.
create or replace function public.vincular_acceso_existente()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.email := lower(trim(new.email));
  if new.user_id is null then
    select u.id into new.user_id
    from auth.users u
    where lower(u.email) = new.email and u.email_confirmed_at is not null
    limit 1;
  end if;
  return new;
end; $$;

create trigger cliente_accesos_vincular
  before insert or update of email on public.cliente_accesos
  for each row execute function public.vincular_acceso_existente();

-- Cuando un usuario confirma su correo (o entra con Google, que llega
-- confirmado): se vincula a los accesos pendientes con ese correo.
create or replace function public.vincular_usuario_confirmado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null
     and (tg_op = 'INSERT' or old.email_confirmed_at is null or old.email is distinct from new.email) then
    update public.cliente_accesos
      set user_id = new.id
      where email = lower(new.email) and user_id is null;
  end if;
  return new;
end; $$;

-- Corre después de handle_new_user (orden alfabético de triggers), así el
-- perfil ya existe para la FK.
create trigger on_auth_user_vincular_accesos
  after insert or update of email_confirmed_at, email on auth.users
  for each row execute function public.vincular_usuario_confirmado();

-- ---------------------------------------------------------------------------
-- Permisos
-- ---------------------------------------------------------------------------

create or replace function public.puede_ver_proyecto(p_proyecto_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.es_admin() or exists (
    select 1
    from public.proyectos p
    join public.cliente_accesos a on a.cliente_id = p.cliente_id
    where p.id = p_proyecto_id and a.user_id = (select auth.uid())
  );
$$;

alter table public.clientes enable row level security;
alter table public.cliente_accesos enable row level security;

create policy "clientes_select" on public.clientes for select to authenticated
  using (
    public.es_admin() or exists (
      select 1 from public.cliente_accesos a
      where a.cliente_id = clientes.id and a.user_id = (select auth.uid())
    )
  );
create policy "clientes_admin_write" on public.clientes for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy "accesos_select" on public.cliente_accesos for select to authenticated
  using (public.es_admin() or user_id = (select auth.uid()));
create policy "accesos_admin_write" on public.cliente_accesos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy "proyectos_select" on public.proyectos for select to authenticated
  using (public.puede_ver_proyecto(id));
create policy "proyectos_admin_write" on public.proyectos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Notas internas del super usuario: tabla aparte para que RLS las oculte
-- por completo al cliente.
create table public.cliente_notas (
  cliente_id uuid primary key references public.clientes (id) on delete cascade,
  notas text,
  updated_at timestamptz not null default now()
);
alter table public.cliente_notas enable row level security;
create policy "notas_admin" on public.cliente_notas for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

revoke execute on function public.vincular_acceso_existente() from public, anon, authenticated;
revoke execute on function public.vincular_usuario_confirmado() from public, anon, authenticated;
