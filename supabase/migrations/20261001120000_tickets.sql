-- Módulo de tickets de soporte.
-- El cliente levanta tickets (con proyecto opcional); el super usuario asigna
-- un responsable del equipo. Solo el cliente, el responsable y el super
-- usuario ven cada ticket. Las notas internas nunca llegan al cliente.

-- ---------------------------------------------------------------------------
-- 1. Tablas
-- ---------------------------------------------------------------------------

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity (start with 1001) unique,
  cliente_id uuid not null references public.clientes (id) on delete restrict,
  proyecto_id uuid references public.proyectos (id) on delete set null,
  creado_por uuid references public.profiles (id) on delete set null,
  asunto text not null check (char_length(asunto) between 3 and 200),
  descripcion text not null check (char_length(descripcion) <= 8000),
  prioridad text not null default 'media' check (prioridad in ('baja', 'media', 'alta', 'urgente')),
  estado text not null default 'abierto'
    check (estado in ('abierto', 'en_progreso', 'esperando_cliente', 'resuelto', 'cerrado')),
  responsable_id uuid references public.equipo (id) on delete set null,
  vence_at timestamptz not null default now(),
  primera_respuesta_at timestamptz,
  resuelto_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tickets_cliente_idx on public.tickets (cliente_id);
create index tickets_responsable_idx on public.tickets (responsable_id);
create index tickets_estado_idx on public.tickets (estado);

create table public.ticket_mensajes (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  autor_id uuid references public.profiles (id) on delete set null,
  autor_tipo text not null default 'cliente' check (autor_tipo in ('cliente', 'equipo')),
  contenido text not null check (char_length(contenido) between 1 and 8000),
  interno boolean not null default false,
  created_at timestamptz not null default now()
);
create index ticket_mensajes_ticket_idx on public.ticket_mensajes (ticket_id);

create table public.ticket_adjuntos (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  mensaje_id uuid references public.ticket_mensajes (id) on delete cascade,
  interno boolean not null default false,
  subido_por uuid references public.profiles (id) on delete set null,
  nombre text not null,
  storage_path text not null unique,
  tamano_bytes bigint,
  mime_type text,
  created_at timestamptz not null default now()
);
create index ticket_adjuntos_ticket_idx on public.ticket_adjuntos (ticket_id);

-- ---------------------------------------------------------------------------
-- 2. Permisos
-- ---------------------------------------------------------------------------

create or replace function privado.es_cliente_de(p_cliente_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.cliente_accesos a
    where a.cliente_id = p_cliente_id and a.user_id = (select auth.uid())
  );
$$;

-- Atiende el ticket: super usuario o su responsable activo.
create or replace function privado.atiende_ticket(p_ticket_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select privado.es_admin() or exists (
    select 1 from public.tickets t
    join public.equipo e on e.id = t.responsable_id
    where t.id = p_ticket_id and e.user_id = (select auth.uid()) and e.activo
  );
$$;

create or replace function privado.puede_ver_ticket(p_ticket_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select privado.atiende_ticket(p_ticket_id) or exists (
    select 1 from public.tickets t
    where t.id = p_ticket_id and privado.es_cliente_de(t.cliente_id)
  );
$$;

-- Un archivo de Storage se puede leer solo si su registro es visible
-- (los adjuntos de notas internas no llegan al cliente).
create or replace function privado.puede_ver_adjunto(p_storage_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.ticket_adjuntos a
    where a.storage_path = p_storage_path
      and privado.puede_ver_ticket(a.ticket_id)
      and (not a.interno or privado.atiende_ticket(a.ticket_id))
  );
$$;

-- El responsable de un ticket ve los datos de contacto de ese cliente.
create or replace function privado.equipo_ve_cliente(p_cliente_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.proyectos p
    join public.proyecto_equipo pe on pe.proyecto_id = p.id
    join public.equipo e on e.id = pe.equipo_id
    where p.cliente_id = p_cliente_id and e.user_id = (select auth.uid()) and e.activo
  ) or exists (
    select 1
    from public.tickets t
    join public.equipo e on e.id = t.responsable_id
    where t.cliente_id = p_cliente_id and e.user_id = (select auth.uid()) and e.activo
  );
$$;

-- El responsable de un ticket ve el nombre del proyecto asociado, aunque no
-- esté asignado a ese proyecto (solo lectura del registro del proyecto).
create or replace function privado.ve_proyecto_por_ticket(p_proyecto_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tickets t
    join public.equipo e on e.id = t.responsable_id
    where t.proyecto_id = p_proyecto_id and e.user_id = (select auth.uid()) and e.activo
  );
$$;

revoke execute on all functions in schema privado from public, anon;
grant execute on all functions in schema privado to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Reglas automáticas
-- ---------------------------------------------------------------------------

-- Plazo de primera respuesta según prioridad (horas corridas).
create or replace function public.ticket_horas_sla(p_prioridad text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case p_prioridad when 'urgente' then 4 when 'alta' then 8 when 'media' then 24 else 72 end;
$$;

create or replace function public.preparar_ticket()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    -- El proyecto debe ser del mismo cliente.
    if new.proyecto_id is not null and not exists (
      select 1 from public.proyectos p where p.id = new.proyecto_id and p.cliente_id = new.cliente_id
    ) then
      raise exception 'El proyecto no pertenece a ese cliente' using errcode = '23514';
    end if;
    new.vence_at := new.created_at + make_interval(hours => public.ticket_horas_sla(new.prioridad));
  elsif new.prioridad is distinct from old.prioridad and new.primera_respuesta_at is null then
    new.vence_at := new.created_at + make_interval(hours => public.ticket_horas_sla(new.prioridad));
  end if;

  if tg_op = 'UPDATE' and new.estado is distinct from old.estado then
    new.resuelto_at := case when new.estado in ('resuelto', 'cerrado') then now() else null end;
  end if;
  new.updated_at := now();
  return new;
end; $$;

create trigger tickets_preparar
  before insert or update on public.tickets
  for each row execute function public.preparar_ticket();

-- Quien atiende (responsable) solo cambia estado y prioridad; asignar,
-- mover de cliente o reescribir el ticket es del super usuario. Los
-- triggers internos se autorizan con una marca local a la transacción.
create or replace function public.guardar_columnas_ticket()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_permitidas text[] := array['estado', 'prioridad', 'vence_at', 'resuelto_at', 'primera_respuesta_at', 'updated_at'];
begin
  if coalesce(current_setting('app.ticket_interno', true), '') = 'on' then
    return new;
  end if;
  if coalesce((select auth.role()), '') = 'authenticated' and not privado.es_admin()
     and (to_jsonb(new) - v_permitidas) is distinct from (to_jsonb(old) - v_permitidas) then
    raise exception 'Solo el super usuario puede modificar esos datos del ticket' using errcode = '42501';
  end if;
  return new;
end; $$;

-- "z" para correr después de tickets_preparar (orden alfabético).
create trigger tickets_z_guardar_columnas
  before update on public.tickets
  for each row execute function public.guardar_columnas_ticket();

-- Cada mensaje: fija autor y tipo, y actualiza el ticket (primera respuesta,
-- reapertura cuando responde el cliente, "en progreso" cuando responde el equipo).
create or replace function public.preparar_mensaje_ticket()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_atiende boolean := privado.atiende_ticket(new.ticket_id);
begin
  new.autor_id := (select auth.uid());
  new.autor_tipo := case when v_atiende then 'equipo' else 'cliente' end;
  if new.interno and not v_atiende then
    raise exception 'Solo el equipo puede dejar notas internas' using errcode = '42501';
  end if;
  return new;
end; $$;

create trigger ticket_mensajes_preparar
  before insert on public.ticket_mensajes
  for each row execute function public.preparar_mensaje_ticket();

create or replace function public.actualizar_ticket_por_mensaje()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform set_config('app.ticket_interno', 'on', true);
  if new.autor_tipo = 'equipo' and not new.interno then
    update public.tickets
      set primera_respuesta_at = coalesce(primera_respuesta_at, now()),
          estado = case when estado = 'abierto' then 'en_progreso' else estado end
      where id = new.ticket_id;
  elsif new.autor_tipo = 'cliente' then
    update public.tickets
      set estado = case when estado in ('esperando_cliente', 'resuelto') then 'abierto' else estado end
      where id = new.ticket_id;
  else
    update public.tickets set updated_at = now() where id = new.ticket_id;
  end if;
  perform set_config('app.ticket_interno', 'off', true);
  return null;
end; $$;

create trigger ticket_mensajes_actualizar_ticket
  after insert on public.ticket_mensajes
  for each row execute function public.actualizar_ticket_por_mensaje();

-- El adjunto hereda "interno" de su mensaje.
create or replace function public.preparar_adjunto_ticket()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.subido_por := (select auth.uid());
  if new.mensaje_id is not null then
    select m.interno into new.interno from public.ticket_mensajes m
    where m.id = new.mensaje_id and m.ticket_id = new.ticket_id;
    if not found then
      raise exception 'El mensaje no pertenece a ese ticket' using errcode = '23514';
    end if;
  else
    new.interno := false;
  end if;
  return new;
end; $$;

create trigger ticket_adjuntos_preparar
  before insert on public.ticket_adjuntos
  for each row execute function public.preparar_adjunto_ticket();

-- ---------------------------------------------------------------------------
-- 4. RLS
-- ---------------------------------------------------------------------------

alter table public.tickets enable row level security;
alter table public.ticket_mensajes enable row level security;
alter table public.ticket_adjuntos enable row level security;

create policy "tickets_select" on public.tickets for select to authenticated
  using (privado.puede_ver_ticket(id));
-- El cliente crea tickets a su nombre, abiertos y sin responsable.
create policy "tickets_insert" on public.tickets for insert to authenticated
  with check (
    privado.es_admin() or (
      privado.es_cliente_de(cliente_id)
      and creado_por = (select auth.uid())
      and estado = 'abierto'
      and responsable_id is null
      and primera_respuesta_at is null
    )
  );
create policy "tickets_update" on public.tickets for update to authenticated
  using (privado.atiende_ticket(id)) with check (privado.atiende_ticket(id));

create policy "mensajes_select" on public.ticket_mensajes for select to authenticated
  using (privado.puede_ver_ticket(ticket_id) and (not interno or privado.atiende_ticket(ticket_id)));
create policy "mensajes_insert" on public.ticket_mensajes for insert to authenticated
  with check (privado.puede_ver_ticket(ticket_id));

create policy "adjuntos_select" on public.ticket_adjuntos for select to authenticated
  using (privado.puede_ver_ticket(ticket_id) and (not interno or privado.atiende_ticket(ticket_id)));
create policy "adjuntos_insert" on public.ticket_adjuntos for insert to authenticated
  with check (privado.puede_ver_ticket(ticket_id));

-- Proyectos: el responsable de un ticket ve el proyecto asociado (solo lectura).
create policy "proyectos_select_por_ticket" on public.proyectos for select to authenticated
  using (privado.ve_proyecto_por_ticket(id));

-- ---------------------------------------------------------------------------
-- 5. Storage: bucket privado; ruta = <ticket_id>/<archivo>
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ticket-adjuntos', 'ticket-adjuntos', false, 20971520,
  array[
    'application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv', 'application/zip', 'application/x-zip-compressed'
  ]
)
on conflict (id) do nothing;

create policy "ticket_adj_select" on storage.objects for select to authenticated
  using (bucket_id = 'ticket-adjuntos' and privado.puede_ver_adjunto(name));
create policy "ticket_adj_insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'ticket-adjuntos'
    and privado.puede_ver_ticket(((storage.foldername(name))[1])::uuid)
  );

-- Nombre y cargo del responsable, visible para quien ve el ticket (incluido
-- el cliente), sin exponer su correo ni teléfono.
create or replace function public.responsable_del_ticket(p_ticket_id uuid)
returns table (nombre text, cargo text)
language sql
stable
security definer
set search_path = ''
as $$
  select e.nombre, e.cargo
  from public.tickets t
  join public.equipo e on e.id = t.responsable_id
  where t.id = p_ticket_id and privado.puede_ver_ticket(p_ticket_id);
$$;
revoke execute on function public.responsable_del_ticket(uuid) from public, anon;
grant execute on function public.responsable_del_ticket(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Auditoría y permisos de funciones internas
-- ---------------------------------------------------------------------------

create trigger auditar_tickets after insert or update or delete on public.tickets
  for each row execute function public.registrar_auditoria();
create trigger auditar_ticket_adjuntos after insert or delete on public.ticket_adjuntos
  for each row execute function public.registrar_auditoria();

revoke execute on function public.preparar_ticket() from public, anon, authenticated;
revoke execute on function public.guardar_columnas_ticket() from public, anon, authenticated;
revoke execute on function public.preparar_mensaje_ticket() from public, anon, authenticated;
revoke execute on function public.actualizar_ticket_por_mensaje() from public, anon, authenticated;
revoke execute on function public.preparar_adjunto_ticket() from public, anon, authenticated;
