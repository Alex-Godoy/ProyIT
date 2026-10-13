-- Contactos que no llegan por el formulario del home: reservas de Cal.com
-- (automáticas, por webhook) y conversaciones de WhatsApp (las registra el
-- admin a mano). Además, un conteo anónimo de clics en los botones de WhatsApp.

-- Un contacto de WhatsApp puede no tener correo, y ni Cal.com ni WhatsApp
-- pasan por la aceptación de la política del formulario.
alter table public.solicitudes_diagnostico
  alter column email drop not null,
  alter column privacidad_version drop not null,
  add column reserva_uid text unique check (char_length(reserva_uid) <= 100),
  add column reserva_inicio timestamptz,
  add constraint solicitudes_diagnostico_contacto check (email is not null or telefono is not null);

-- El formulario público sigue exigiendo correo y política aceptada, y no puede
-- hacerse pasar por una reserva de Cal.com ni por un contacto de WhatsApp.
drop policy "diagnostico_insert" on public.solicitudes_diagnostico;
create policy "diagnostico_insert" on public.solicitudes_diagnostico for insert to anon, authenticated
  with check (
    estado = 'nueva' and notas is null and email is not null and privacidad_version is not null
    and reserva_uid is null and reserva_inicio is null
    and coalesce(origen, '') not in ('cal.com', 'whatsapp')
  );
create policy "diagnostico_admin_insert" on public.solicitudes_diagnostico for insert to authenticated
  with check (privado.es_admin());

-- El límite de 3 por correo al día es para el formulario público: no aplica a
-- las reservas de Cal.com ni a lo que registra el admin.
create or replace function public.limitar_solicitud_diagnostico()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.email := lower(trim(new.email));
  new.created_at := now();
  new.updated_at := now();
  if new.reserva_uid is null and not privado.es_admin() and (
    select count(*) from public.solicitudes_diagnostico s
    where s.email = new.email and s.created_at > now() - interval '24 hours'
  ) >= 3 then
    raise exception 'demasiadas_solicitudes' using errcode = 'P0001';
  end if;
  return new;
end; $$;

-- Secretos compartidos con servicios externos. Solo se guarda el hash.
create table if not exists privado.secretos (
  nombre text primary key,
  hash text not null
);
alter table privado.secretos enable row level security;
revoke all on privado.secretos from public, anon, authenticated;

-- El webhook de Cal.com (/api/calcom) verifica la firma y llama a esta función
-- con el secreto; sin el secreto correcto no hace nada.
create or replace function public.registrar_reserva_calcom(
  p_secreto text,
  p_evento text,
  p_uid text,
  p_uid_anterior text,
  p_nombre text,
  p_email text,
  p_telefono text,
  p_mensaje text,
  p_inicio timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash text;
  v_nombre text := left(coalesce(nullif(trim(p_nombre), ''), 'Sin nombre'), 120);
  v_email text := nullif(lower(trim(p_email)), '');
begin
  select s.hash into v_hash from privado.secretos s where s.nombre = 'calcom_webhook';
  if v_hash is null or p_secreto is null
     or encode(pg_catalog.sha256(convert_to(p_secreto, 'UTF8')), 'hex') <> v_hash then
    raise exception 'no_autorizado' using errcode = '42501';
  end if;
  if p_uid is null or char_length(p_uid) > 100 then
    raise exception 'reserva_invalida' using errcode = '22023';
  end if;

  if p_evento = 'BOOKING_CANCELLED' then
    update public.solicitudes_diagnostico
    set estado = 'descartada', notas = concat_ws(E'\n', notas, 'Reunión cancelada en Cal.com.')
    where reserva_uid = p_uid;
    return;
  end if;

  if p_evento = 'BOOKING_RESCHEDULED' and p_uid_anterior is not null then
    update public.solicitudes_diagnostico
    set reserva_uid = p_uid, reserva_inicio = p_inicio, estado = 'agendada'
    where reserva_uid = p_uid_anterior;
    if found then return; end if;
  end if;

  if char_length(v_nombre) < 2 then v_nombre := 'Sin nombre'; end if;
  if v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 200 then v_email := null; end if;

  insert into public.solicitudes_diagnostico
    (nombre, email, telefono, mensaje, origen, estado, reserva_uid, reserva_inicio)
  values (
    v_nombre,
    v_email,
    left(nullif(trim(p_telefono), ''), 40),
    left(nullif(trim(p_mensaje), ''), 2000),
    'cal.com',
    'agendada',
    p_uid,
    p_inicio
  )
  on conflict (reserva_uid) do update set reserva_inicio = excluded.reserva_inicio;
end; $$;

revoke execute on function public.registrar_reserva_calcom(text, text, text, text, text, text, text, text, timestamptz) from public;
-- Solo la llama el webhook, que no tiene sesión.
grant execute on function public.registrar_reserva_calcom(text, text, text, text, text, text, text, text, timestamptz) to anon;
revoke execute on function public.registrar_reserva_calcom(text, text, text, text, text, text, text, text, timestamptz) from authenticated;

-- Clics en los botones de WhatsApp del sitio: solo qué botón y cuándo.
create table public.clics_whatsapp (
  id bigint generated always as identity primary key,
  origen text not null check (origen ~ '^[a-z0-9-]{1,40}$'),
  created_at timestamptz not null default now()
);
create index clics_whatsapp_fecha_idx on public.clics_whatsapp (created_at desc);
alter table public.clics_whatsapp enable row level security;

create policy "clics_whatsapp_insert" on public.clics_whatsapp for insert to anon, authenticated
  with check (created_at > now() - interval '1 minute');
create policy "clics_whatsapp_admin_select" on public.clics_whatsapp for select to authenticated
  using (privado.es_admin());
