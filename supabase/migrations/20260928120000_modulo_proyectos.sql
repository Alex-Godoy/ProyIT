-- Módulo "Mis proyectos y avance".
-- Un proyecto pertenece a una empresa cliente, a una persona, o a ambas.
-- Solo los admin escriben; los clientes leen lo que les corresponde.

-- ---------------------------------------------------------------------------
-- Helpers de autorización
-- ---------------------------------------------------------------------------

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Empresas cliente y sus miembros
-- ---------------------------------------------------------------------------

create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  rut text,
  created_at timestamptz not null default now()
);

create table public.empresa_miembros (
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (empresa_id, user_id)
);
create index empresa_miembros_user_idx on public.empresa_miembros (user_id);

-- ---------------------------------------------------------------------------
-- Proyectos
-- ---------------------------------------------------------------------------

create table public.proyectos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas (id) on delete set null,
  cliente_id uuid references public.profiles (id) on delete set null,
  nombre text not null,
  descripcion text,
  etapa text not null default 'planificacion'
    check (etapa in ('planificacion', 'en_ejecucion', 'en_pruebas', 'entregado', 'pausado')),
  avance smallint not null default 0 check (avance between 0 and 100),
  fecha_inicio date,
  fecha_termino_estimada date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint proyectos_tiene_dueno check (empresa_id is not null or cliente_id is not null)
);
create index proyectos_empresa_idx on public.proyectos (empresa_id);
create index proyectos_cliente_idx on public.proyectos (cliente_id);

create or replace function public.puede_ver_proyecto(p_proyecto_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.es_admin() or exists (
    select 1 from public.proyectos p
    where p.id = p_proyecto_id
      and (
        p.cliente_id = (select auth.uid())
        or exists (
          select 1 from public.empresa_miembros m
          where m.empresa_id = p.empresa_id and m.user_id = (select auth.uid())
        )
      )
  );
$$;

create table public.proyecto_hitos (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyectos (id) on delete cascade,
  titulo text not null,
  descripcion text,
  fecha_estimada date,
  completado_at timestamptz,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);
create index proyecto_hitos_proyecto_idx on public.proyecto_hitos (proyecto_id);

create table public.proyecto_novedades (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyectos (id) on delete cascade,
  autor_id uuid references public.profiles (id) on delete set null,
  contenido text not null,
  created_at timestamptz not null default now()
);
create index proyecto_novedades_proyecto_idx on public.proyecto_novedades (proyecto_id);

create table public.proyecto_documentos (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyectos (id) on delete cascade,
  nombre text not null,
  storage_path text not null unique,
  tamano_bytes bigint,
  mime_type text,
  created_at timestamptz not null default now()
);
create index proyecto_documentos_proyecto_idx on public.proyecto_documentos (proyecto_id);

-- updated_at automático en proyectos
create or replace function public.tocar_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end; $$;

create trigger proyectos_updated_at
  before update on public.proyectos
  for each row execute function public.tocar_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.empresas enable row level security;
alter table public.empresa_miembros enable row level security;
alter table public.proyectos enable row level security;
alter table public.proyecto_hitos enable row level security;
alter table public.proyecto_novedades enable row level security;
alter table public.proyecto_documentos enable row level security;

-- empresas: el admin todo; el miembro ve la suya
create policy "empresas_select" on public.empresas for select to authenticated
  using (
    public.es_admin() or exists (
      select 1 from public.empresa_miembros m
      where m.empresa_id = empresas.id and m.user_id = (select auth.uid())
    )
  );
create policy "empresas_admin_write" on public.empresas for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- empresa_miembros: el admin todo; cada usuario ve sus membresías
create policy "miembros_select" on public.empresa_miembros for select to authenticated
  using (public.es_admin() or user_id = (select auth.uid()));
create policy "miembros_admin_write" on public.empresa_miembros for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- proyectos
create policy "proyectos_select" on public.proyectos for select to authenticated
  using (public.puede_ver_proyecto(id));
create policy "proyectos_admin_write" on public.proyectos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- hijos del proyecto
create policy "hitos_select" on public.proyecto_hitos for select to authenticated
  using (public.puede_ver_proyecto(proyecto_id));
create policy "hitos_admin_write" on public.proyecto_hitos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy "novedades_select" on public.proyecto_novedades for select to authenticated
  using (public.puede_ver_proyecto(proyecto_id));
create policy "novedades_admin_write" on public.proyecto_novedades for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy "documentos_select" on public.proyecto_documentos for select to authenticated
  using (public.puede_ver_proyecto(proyecto_id));
create policy "documentos_admin_write" on public.proyecto_documentos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- El admin necesita listar perfiles para asignar clientes y miembros.
create policy "profiles_admin_select" on public.profiles for select to authenticated
  using (public.es_admin());

-- ---------------------------------------------------------------------------
-- Storage: bucket privado; ruta = <proyecto_id>/<archivo>
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit)
values ('proyecto-documentos', 'proyecto-documentos', false, 52428800)
on conflict (id) do nothing;

create policy "proyecto_docs_select" on storage.objects for select to authenticated
  using (
    bucket_id = 'proyecto-documentos'
    and public.puede_ver_proyecto(((storage.foldername(name))[1])::uuid)
  );
create policy "proyecto_docs_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'proyecto-documentos' and public.es_admin());
create policy "proyecto_docs_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'proyecto-documentos' and public.es_admin());
create policy "proyecto_docs_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'proyecto-documentos' and public.es_admin());

-- Las funciones de permisos solo las necesitan usuarios con sesión (RLS).
revoke execute on function public.es_admin() from public, anon;
revoke execute on function public.puede_ver_proyecto(uuid) from public, anon;
grant execute on function public.es_admin() to authenticated;
grant execute on function public.puede_ver_proyecto(uuid) to authenticated;
