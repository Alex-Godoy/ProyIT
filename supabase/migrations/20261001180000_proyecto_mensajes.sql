-- Mensajes del proyecto: espacio de conversación entre el cliente y las
-- personas asignadas al proyecto (y el super usuario). Lo ven y escriben
-- todos los que ven el proyecto (privado.puede_ver_proyecto). Cada usuario
-- lleva su marca de lectura para mostrar los mensajes sin leer.

-- ---------------------------------------------------------------------------
-- 1. Tablas
-- ---------------------------------------------------------------------------

create table public.proyecto_mensajes (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyectos (id) on delete cascade,
  autor_id uuid references public.profiles (id) on delete set null,
  autor_tipo text not null default 'cliente' check (autor_tipo in ('cliente', 'equipo')),
  -- Nombre y cargo al momento de escribir: el cliente no puede leer la tabla
  -- equipo, y el mensaje no cambia si la persona deja el proyecto.
  autor_nombre text not null default '',
  autor_cargo text,
  contenido text not null check (char_length(contenido) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index proyecto_mensajes_proyecto_idx on public.proyecto_mensajes (proyecto_id, created_at);

create table public.proyecto_lecturas (
  proyecto_id uuid not null references public.proyectos (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  leido_at timestamptz not null default now(),
  primary key (proyecto_id, user_id)
);
create index proyecto_lecturas_user_idx on public.proyecto_lecturas (user_id);

-- ---------------------------------------------------------------------------
-- 2. Autor fijado por la base de datos
-- ---------------------------------------------------------------------------

create or replace function public.preparar_mensaje_proyecto()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_nombre text;
  v_cargo text;
begin
  new.autor_id := v_uid;
  new.created_at := now();

  if privado.es_admin() then
    new.autor_tipo := 'equipo';
    select coalesce(nullif(trim(p.full_name), ''), 'ProyIT') into v_nombre
    from public.profiles p where p.id = v_uid;
    new.autor_nombre := coalesce(v_nombre, 'ProyIT');
    new.autor_cargo := 'admin';
  elsif privado.puede_en_proyecto(new.proyecto_id, 'ver') then
    new.autor_tipo := 'equipo';
    select e.nombre, e.cargo into v_nombre, v_cargo
    from public.equipo e where e.user_id = v_uid and e.activo;
    new.autor_nombre := coalesce(v_nombre, 'Equipo ProyIT');
    new.autor_cargo := v_cargo;
  else
    new.autor_tipo := 'cliente';
    select coalesce(nullif(trim(a.nombre_contacto), ''), nullif(trim(pr.full_name), ''))
      into v_nombre
    from public.proyectos p
    join public.cliente_accesos a on a.cliente_id = p.cliente_id and a.user_id = v_uid
    left join public.profiles pr on pr.id = v_uid
    where p.id = new.proyecto_id
    limit 1;
    new.autor_nombre := coalesce(v_nombre, 'Cliente');
    new.autor_cargo := null;
  end if;
  return new;
end; $$;

create trigger proyecto_mensajes_preparar
  before insert on public.proyecto_mensajes
  for each row execute function public.preparar_mensaje_proyecto();

-- ---------------------------------------------------------------------------
-- 3. RLS
-- ---------------------------------------------------------------------------

alter table public.proyecto_mensajes enable row level security;
alter table public.proyecto_lecturas enable row level security;

create policy "mensajes_proyecto_select" on public.proyecto_mensajes for select to authenticated
  using (privado.puede_ver_proyecto(proyecto_id));
create policy "mensajes_proyecto_insert" on public.proyecto_mensajes for insert to authenticated
  with check (privado.puede_ver_proyecto(proyecto_id));
-- Sin edición; solo el super usuario borra (moderación).
create policy "mensajes_proyecto_delete" on public.proyecto_mensajes for delete to authenticated
  using (privado.es_admin());

create policy "lecturas_propias" on public.proyecto_lecturas for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and privado.puede_ver_proyecto(proyecto_id));

-- ---------------------------------------------------------------------------
-- 4. Mensajes sin leer del usuario actual, por proyecto (RLS filtra)
-- ---------------------------------------------------------------------------

create or replace function public.mensajes_sin_leer()
returns table (proyecto_id uuid, cantidad integer)
language sql
stable
security invoker
set search_path = ''
as $$
  select m.proyecto_id, count(*)::integer
  from public.proyecto_mensajes m
  left join public.proyecto_lecturas l
    on l.proyecto_id = m.proyecto_id and l.user_id = (select auth.uid())
  where m.autor_id is distinct from (select auth.uid())
    and (l.leido_at is null or m.created_at > l.leido_at)
  group by m.proyecto_id;
$$;
revoke execute on function public.mensajes_sin_leer() from public, anon;
grant execute on function public.mensajes_sin_leer() to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Auditoría y permisos de funciones internas
-- ---------------------------------------------------------------------------

create trigger auditar_proyecto_mensajes after delete on public.proyecto_mensajes
  for each row execute function public.registrar_auditoria();

revoke execute on function public.preparar_mensaje_proyecto() from public, anon, authenticated;

-- Avisos en vivo de mensajes nuevos (Realtime respeta las políticas RLS).
alter publication supabase_realtime add table public.proyecto_mensajes;
