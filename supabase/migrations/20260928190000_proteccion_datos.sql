-- Endurecimiento de seguridad y soporte para la Ley 21.719 (protección de
-- datos personales): registro de aceptación de la política de privacidad,
-- solicitudes de derechos de los titulares y bitácora de auditoría.

-- ---------------------------------------------------------------------------
-- 1. Perfiles: constancia de la política aceptada y campos protegidos
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column privacidad_version text,
  add column privacidad_aceptada_at timestamptz;

-- El registro guarda la versión de la política que la persona aceptó.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, company, avatar_url, privacidad_version, privacidad_aceptada_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'privacidad_version',
    case when new.raw_user_meta_data ? 'privacidad_version' then now() end
  );
  return new;
end; $$;

-- Además del rol, el usuario no puede cambiar su correo en el perfil (el
-- correo real vive en auth.users) ni la fecha de aceptación de la política.
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Solo restringe peticiones de usuarios por la API; los procesos internos
  -- (Auth, service_role, migraciones) no traen esos roles en el JWT.
  if coalesce((select auth.role()), '') in ('authenticated', 'anon') then
    new.role := old.role;
    new.email := old.email;
    new.id := old.id;
    -- La aceptación solo se registra con la hora del servidor.
    if new.privacidad_version is distinct from old.privacidad_version then
      new.privacidad_aceptada_at := now();
    else
      new.privacidad_aceptada_at := old.privacidad_aceptada_at;
    end if;
  end if;
  new.updated_at := now();
  return new;
end; $$;

-- Mantener el correo del perfil sincronizado cuando cambia en auth.users.
create or replace function public.sincronizar_email_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end; $$;

create trigger on_auth_user_email_cambiado
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.sincronizar_email_perfil();

-- ---------------------------------------------------------------------------
-- 2. Solicitudes de derechos del titular (acceso, rectificación, supresión,
--    oposición, portabilidad, bloqueo). Plazo legal de respuesta: 30 días
--    corridos, prorrogables por otros 30 con aviso.
-- ---------------------------------------------------------------------------

create table public.solicitudes_derechos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  email text not null,
  tipo text not null check (tipo in ('acceso', 'rectificacion', 'supresion', 'oposicion', 'portabilidad', 'bloqueo')),
  detalle text,
  estado text not null default 'recibida' check (estado in ('recibida', 'en_proceso', 'respondida', 'rechazada')),
  respuesta text,
  plazo_respuesta date not null default ((now() at time zone 'America/Santiago')::date + 30),
  respondida_at timestamptz,
  created_at timestamptz not null default now()
);
create index solicitudes_derechos_user_idx on public.solicitudes_derechos (user_id);

alter table public.solicitudes_derechos enable row level security;

create policy "solicitudes_select" on public.solicitudes_derechos for select to authenticated
  using (public.es_admin() or user_id = (select auth.uid()));
-- El titular solo crea solicitudes a su nombre, con estado inicial.
create policy "solicitudes_insert_propia" on public.solicitudes_derechos for insert to authenticated
  with check (user_id = (select auth.uid()) and estado = 'recibida' and respuesta is null and respondida_at is null);
create policy "solicitudes_admin_update" on public.solicitudes_derechos for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- El correo y el plazo los fija el servidor, no el formulario.
create or replace function public.completar_solicitud()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select u.email into new.email from auth.users u where u.id = new.user_id;
  new.plazo_respuesta := (now() at time zone 'America/Santiago')::date + 30;
  return new;
end; $$;

create trigger solicitudes_completar
  before insert on public.solicitudes_derechos
  for each row execute function public.completar_solicitud();

-- ---------------------------------------------------------------------------
-- 3. Bitácora de auditoría (responsabilidad proactiva). Guarda quién hizo
--    qué y qué columnas cambió, sin copiar los valores personales.
-- ---------------------------------------------------------------------------

create table public.auditoria (
  id bigint generated always as identity primary key,
  actor_id uuid,
  tabla text not null,
  registro_id text,
  accion text not null,
  columnas text[],
  created_at timestamptz not null default now()
);
create index auditoria_created_idx on public.auditoria (created_at desc);

alter table public.auditoria enable row level security;
create policy "auditoria_admin_select" on public.auditoria for select to authenticated
  using (public.es_admin());
-- Sin políticas de escritura: solo el trigger (security definer) inserta.

create or replace function public.registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id text;
  v_columnas text[];
begin
  if tg_op = 'DELETE' then
    v_id := coalesce(to_jsonb(old)->>'id', to_jsonb(old)->>'cliente_id');
  else
    v_id := coalesce(to_jsonb(new)->>'id', to_jsonb(new)->>'cliente_id');
  end if;

  if tg_op = 'UPDATE' then
    select array_agg(n.key order by n.key) into v_columnas
    from jsonb_each(to_jsonb(new)) n
    where n.key not in ('updated_at')
      and n.value is distinct from (to_jsonb(old) -> n.key);
    if v_columnas is null then
      return null;
    end if;
  end if;

  insert into public.auditoria (actor_id, tabla, registro_id, accion, columnas)
  values ((select auth.uid()), tg_table_name, v_id, lower(tg_op), v_columnas);
  return null;
end; $$;

create trigger auditar_clientes after insert or update or delete on public.clientes
  for each row execute function public.registrar_auditoria();
create trigger auditar_cliente_accesos after insert or update or delete on public.cliente_accesos
  for each row execute function public.registrar_auditoria();
create trigger auditar_cliente_notas after insert or update or delete on public.cliente_notas
  for each row execute function public.registrar_auditoria();
create trigger auditar_profiles after update or delete on public.profiles
  for each row execute function public.registrar_auditoria();
create trigger auditar_proyecto_documentos after insert or delete on public.proyecto_documentos
  for each row execute function public.registrar_auditoria();
create trigger auditar_solicitudes after insert or update on public.solicitudes_derechos
  for each row execute function public.registrar_auditoria();

revoke execute on function public.registrar_auditoria() from public, anon, authenticated;
revoke execute on function public.completar_solicitud() from public, anon, authenticated;
revoke execute on function public.sincronizar_email_perfil() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Documentos: solo tipos de archivo esperables (evita subir HTML/SVG/JS
--    que podrían ejecutarse al abrirse desde el dominio de Storage).
-- ---------------------------------------------------------------------------

update storage.buckets
set allowed_mime_types = array[
  'application/pdf',
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv',
  'application/zip', 'application/x-zip-compressed'
]
where id = 'proyecto-documentos';
