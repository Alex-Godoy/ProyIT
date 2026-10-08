-- Solicitudes de diagnóstico / primera conversación que llegan desde el home
-- público. Cualquier visitante (anon) puede crear una; solo el super usuario
-- las ve y las gestiona.

create table public.solicitudes_diagnostico (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 2 and 120),
  empresa text check (char_length(empresa) <= 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 200),
  telefono text check (char_length(telefono) <= 40),
  interes text check (char_length(interes) <= 80),
  mensaje text check (char_length(mensaje) <= 2000),
  horario text check (horario in ('manana', 'tarde', 'indistinto')),
  origen text check (char_length(origen) <= 40),
  privacidad_version text not null,
  estado text not null default 'nueva' check (estado in ('nueva', 'contactada', 'agendada', 'descartada')),
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index solicitudes_diagnostico_estado_idx on public.solicitudes_diagnostico (estado, created_at desc);

alter table public.solicitudes_diagnostico enable row level security;

-- El visitante solo crea solicitudes nuevas, sin notas internas.
create policy "diagnostico_insert" on public.solicitudes_diagnostico for insert to anon, authenticated
  with check (estado = 'nueva' and notas is null);
create policy "diagnostico_admin_select" on public.solicitudes_diagnostico for select to authenticated
  using (privado.es_admin());
create policy "diagnostico_admin_update" on public.solicitudes_diagnostico for update to authenticated
  using (privado.es_admin()) with check (privado.es_admin());

-- Freno simple al abuso del formulario público: máximo 3 solicitudes por
-- correo cada 24 horas. La fecha la fija el servidor.
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
  if (
    select count(*) from public.solicitudes_diagnostico s
    where s.email = new.email and s.created_at > now() - interval '24 hours'
  ) >= 3 then
    raise exception 'demasiadas_solicitudes' using errcode = 'P0001';
  end if;
  return new;
end; $$;

create trigger solicitudes_diagnostico_limitar
  before insert on public.solicitudes_diagnostico
  for each row execute function public.limitar_solicitud_diagnostico();

create or replace function public.tocar_solicitud_diagnostico()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end; $$;

create trigger solicitudes_diagnostico_tocar
  before update on public.solicitudes_diagnostico
  for each row execute function public.tocar_solicitud_diagnostico();

create trigger auditar_solicitudes_diagnostico after insert or update on public.solicitudes_diagnostico
  for each row execute function public.registrar_auditoria();

revoke execute on function public.limitar_solicitud_diagnostico() from public, anon, authenticated;
revoke execute on function public.tocar_solicitud_diagnostico() from public, anon, authenticated;
