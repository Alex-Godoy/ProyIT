-- Rol "equipo" (ingenieros, técnicos, etc.) con permisos por cargo sobre los
-- proyectos asignados. La matriz de permisos vive en privado.puede_en_proyecto
-- y debe coincidir con src/lib/permisos.ts.
--
--   acción            jefe_proyecto  ingeniero  tecnico  soporte
--   ver                     x            x         x        x
--   hito_completar          x            x         x
--   documento_subir         x            x         x
--   novedad_publicar        x            x
--   hito_editar             x            x
--   avance_editar           x
--   eliminar                x
--
-- El super usuario (admin) puede todo.

-- ---------------------------------------------------------------------------
-- 1. Rol y tablas
-- ---------------------------------------------------------------------------

alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('cliente', 'admin', 'equipo'));

create table public.equipo (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  nombre text not null,
  cargo text not null check (cargo in ('jefe_proyecto', 'ingeniero', 'tecnico', 'soporte')),
  telefono text,
  user_id uuid unique references public.profiles (id) on delete set null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger equipo_updated_at
  before update on public.equipo
  for each row execute function public.tocar_updated_at();

-- Reutiliza la vinculación por correo confirmado de cliente_accesos.
create trigger equipo_vincular
  before insert or update of email on public.equipo
  for each row execute function public.vincular_acceso_existente();

create table public.proyecto_equipo (
  proyecto_id uuid not null references public.proyectos (id) on delete cascade,
  equipo_id uuid not null references public.equipo (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (proyecto_id, equipo_id)
);
create index proyecto_equipo_equipo_idx on public.proyecto_equipo (equipo_id);

-- ---------------------------------------------------------------------------
-- 2. El rol del perfil sigue al registro de equipo
-- ---------------------------------------------------------------------------

-- prevent_role_change bloquea cambios de rol hechos por usuarios; los
-- triggers internos se autorizan con una marca local a la transacción.
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce((select auth.role()), '') in ('authenticated', 'anon') then
    if coalesce(current_setting('app.cambio_rol_autorizado', true), '') <> 'on' then
      new.role := old.role;
    end if;
    new.email := old.email;
    new.id := old.id;
    if new.privacidad_version is distinct from old.privacidad_version then
      new.privacidad_aceptada_at := now();
    else
      new.privacidad_aceptada_at := old.privacidad_aceptada_at;
    end if;
  end if;
  new.updated_at := now();
  return new;
end; $$;

create or replace function public.sincronizar_rol_equipo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform set_config('app.cambio_rol_autorizado', 'on', true);

  -- Quien deja de estar vinculado (o se elimina) vuelve a ser cliente.
  if tg_op in ('UPDATE', 'DELETE') and old.user_id is not null
     and (tg_op = 'DELETE' or old.user_id is distinct from new.user_id) then
    update public.profiles set role = 'cliente' where id = old.user_id and role = 'equipo';
  end if;

  if tg_op in ('INSERT', 'UPDATE') and new.user_id is not null then
    update public.profiles
      set role = case when new.activo then 'equipo' else 'cliente' end
      where id = new.user_id and role <> 'admin';
  end if;

  perform set_config('app.cambio_rol_autorizado', 'off', true);
  return null;
end; $$;

create trigger equipo_sincronizar_rol
  after insert or update of user_id, activo or delete on public.equipo
  for each row execute function public.sincronizar_rol_equipo();

-- Al confirmar el correo se vinculan también las invitaciones de equipo.
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
    update public.equipo
      set user_id = new.id
      where email = lower(new.email) and user_id is null;
  end if;
  return new;
end; $$;

-- ---------------------------------------------------------------------------
-- 3. Matriz de permisos
-- ---------------------------------------------------------------------------

create or replace function privado.puede_en_proyecto(p_proyecto_id uuid, p_accion text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select privado.es_admin() or exists (
    select 1
    from public.proyecto_equipo pe
    join public.equipo e on e.id = pe.equipo_id
    where pe.proyecto_id = p_proyecto_id
      and e.user_id = (select auth.uid())
      and e.activo
      and case p_accion
        when 'ver' then true
        when 'hito_completar' then e.cargo in ('jefe_proyecto', 'ingeniero', 'tecnico')
        when 'documento_subir' then e.cargo in ('jefe_proyecto', 'ingeniero', 'tecnico')
        when 'novedad_publicar' then e.cargo in ('jefe_proyecto', 'ingeniero')
        when 'hito_editar' then e.cargo in ('jefe_proyecto', 'ingeniero')
        when 'avance_editar' then e.cargo = 'jefe_proyecto'
        when 'eliminar' then e.cargo = 'jefe_proyecto'
        else false
      end
  );
$$;

-- Ver un proyecto: admin, clientes con acceso y equipo asignado.
create or replace function privado.puede_ver_proyecto(p_proyecto_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select privado.puede_en_proyecto(p_proyecto_id, 'ver') or exists (
    select 1
    from public.proyectos p
    join public.cliente_accesos a on a.cliente_id = p.cliente_id
    where p.id = p_proyecto_id and a.user_id = (select auth.uid())
  );
$$;

-- El equipo ve la ficha (contacto, dirección) de los clientes de sus proyectos,
-- pero nunca sus notas internas ni sus accesos.
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
  );
$$;

revoke execute on all functions in schema privado from public, anon;
grant execute on all functions in schema privado to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Guardas de columnas (RLS no restringe columnas)
-- ---------------------------------------------------------------------------

-- Un jefe de proyecto solo cambia etapa y avance del proyecto.
create or replace function public.guardar_columnas_proyecto()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce((select auth.role()), '') = 'authenticated' and not privado.es_admin()
     and (to_jsonb(new) - array['etapa', 'avance', 'updated_at'])
         is distinct from (to_jsonb(old) - array['etapa', 'avance', 'updated_at']) then
    raise exception 'Solo el super usuario puede modificar esos datos del proyecto'
      using errcode = '42501';
  end if;
  return new;
end; $$;

create trigger proyectos_guardar_columnas
  before update on public.proyectos
  for each row execute function public.guardar_columnas_proyecto();

-- Un técnico solo marca/desmarca hitos; editar el resto exige 'hito_editar'.
create or replace function public.guardar_columnas_hito()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce((select auth.role()), '') = 'authenticated'
     and not privado.puede_en_proyecto(old.proyecto_id, 'hito_editar')
     and (to_jsonb(new) - 'completado_at') is distinct from (to_jsonb(old) - 'completado_at') then
    raise exception 'Tu cargo solo permite marcar hitos como completados'
      using errcode = '42501';
  end if;
  if new.proyecto_id is distinct from old.proyecto_id and not privado.es_admin() then
    raise exception 'No se puede mover un hito a otro proyecto' using errcode = '42501';
  end if;
  return new;
end; $$;

create trigger proyecto_hitos_guardar_columnas
  before update on public.proyecto_hitos
  for each row execute function public.guardar_columnas_hito();

-- Cualquier cambio en hitos, novedades o documentos actualiza la fecha del
-- proyecto (el cliente ve "última actualización"), sin exigir permiso de
-- edición del proyecto a quien hizo el cambio.
create or replace function public.tocar_proyecto_padre()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.proyectos set updated_at = now()
  where id = coalesce(new.proyecto_id, old.proyecto_id);
  return null;
end; $$;

create trigger hitos_tocar_proyecto after insert or update or delete on public.proyecto_hitos
  for each row execute function public.tocar_proyecto_padre();
create trigger novedades_tocar_proyecto after insert or update or delete on public.proyecto_novedades
  for each row execute function public.tocar_proyecto_padre();
create trigger documentos_tocar_proyecto after insert or update or delete on public.proyecto_documentos
  for each row execute function public.tocar_proyecto_padre();

-- ---------------------------------------------------------------------------
-- 5. Políticas RLS
-- ---------------------------------------------------------------------------

-- Proyectos: además del admin, el jefe de proyecto actualiza (solo etapa/avance).
create policy "proyectos_equipo_update" on public.proyectos for update to authenticated
  using (privado.puede_en_proyecto(id, 'avance_editar'))
  with check (privado.puede_en_proyecto(id, 'avance_editar'));

-- Hitos
drop policy "hitos_admin_write" on public.proyecto_hitos;
create policy "hitos_insert" on public.proyecto_hitos for insert to authenticated
  with check (privado.puede_en_proyecto(proyecto_id, 'hito_editar'));
create policy "hitos_update" on public.proyecto_hitos for update to authenticated
  using (privado.puede_en_proyecto(proyecto_id, 'hito_completar') or privado.puede_en_proyecto(proyecto_id, 'hito_editar'))
  with check (privado.puede_en_proyecto(proyecto_id, 'hito_completar') or privado.puede_en_proyecto(proyecto_id, 'hito_editar'));
create policy "hitos_delete" on public.proyecto_hitos for delete to authenticated
  using (privado.puede_en_proyecto(proyecto_id, 'eliminar'));

-- Novedades: quien publica queda como autor.
drop policy "novedades_admin_write" on public.proyecto_novedades;
create policy "novedades_insert" on public.proyecto_novedades for insert to authenticated
  with check (
    privado.puede_en_proyecto(proyecto_id, 'novedad_publicar')
    and (privado.es_admin() or autor_id = (select auth.uid()))
  );
create policy "novedades_update" on public.proyecto_novedades for update to authenticated
  using (privado.es_admin()) with check (privado.es_admin());
create policy "novedades_delete" on public.proyecto_novedades for delete to authenticated
  using (privado.puede_en_proyecto(proyecto_id, 'eliminar'));

-- Documentos
drop policy "documentos_admin_write" on public.proyecto_documentos;
create policy "documentos_insert" on public.proyecto_documentos for insert to authenticated
  with check (privado.puede_en_proyecto(proyecto_id, 'documento_subir'));
create policy "documentos_update" on public.proyecto_documentos for update to authenticated
  using (privado.es_admin()) with check (privado.es_admin());
create policy "documentos_delete" on public.proyecto_documentos for delete to authenticated
  using (privado.puede_en_proyecto(proyecto_id, 'eliminar'));

-- Archivos en Storage (carpeta = id del proyecto)
drop policy "proyecto_docs_admin_insert" on storage.objects;
drop policy "proyecto_docs_admin_delete" on storage.objects;
create policy "proyecto_docs_insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'proyecto-documentos'
    and privado.puede_en_proyecto(((storage.foldername(name))[1])::uuid, 'documento_subir')
  );
create policy "proyecto_docs_delete" on storage.objects for delete to authenticated
  using (
    bucket_id = 'proyecto-documentos'
    and privado.puede_en_proyecto(((storage.foldername(name))[1])::uuid, 'eliminar')
  );

-- Clientes: el equipo ve los clientes de sus proyectos.
create policy "clientes_select_equipo" on public.clientes for select to authenticated
  using (privado.equipo_ve_cliente(id));

-- Equipo: solo el admin administra; cada integrante ve su propio registro.
alter table public.equipo enable row level security;
create policy "equipo_admin" on public.equipo for all to authenticated
  using (privado.es_admin()) with check (privado.es_admin());
create policy "equipo_select_propio" on public.equipo for select to authenticated
  using (user_id = (select auth.uid()));

alter table public.proyecto_equipo enable row level security;
create policy "proyecto_equipo_admin" on public.proyecto_equipo for all to authenticated
  using (privado.es_admin()) with check (privado.es_admin());
create policy "proyecto_equipo_select_propio" on public.proyecto_equipo for select to authenticated
  using (exists (select 1 from public.equipo e where e.id = equipo_id and e.user_id = (select auth.uid())));

-- Quienes ven un proyecto (incluido el cliente) conocen nombre y cargo de su
-- equipo, sin exponer correos ni teléfonos (minimización de datos).
create or replace function public.equipo_del_proyecto(p_proyecto_id uuid)
returns table (nombre text, cargo text)
language sql
stable
security definer
set search_path = ''
as $$
  select e.nombre, e.cargo
  from public.proyecto_equipo pe
  join public.equipo e on e.id = pe.equipo_id
  where pe.proyecto_id = p_proyecto_id
    and e.activo
    and privado.puede_ver_proyecto(p_proyecto_id)
  order by array_position(array['jefe_proyecto', 'ingeniero', 'tecnico', 'soporte'], e.cargo), e.nombre;
$$;
revoke execute on function public.equipo_del_proyecto(uuid) from public, anon;
grant execute on function public.equipo_del_proyecto(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Auditoría y permisos de funciones internas
-- ---------------------------------------------------------------------------

-- La asignación a proyectos no tiene "id": se identifica por proyecto_id.
create or replace function public.registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fila jsonb;
  v_columnas text[];
begin
  v_fila := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;

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
  values (
    (select auth.uid()),
    tg_table_name,
    coalesce(v_fila->>'id', v_fila->>'cliente_id', v_fila->>'proyecto_id'),
    lower(tg_op),
    v_columnas
  );
  return null;
end; $$;

create trigger auditar_equipo after insert or update or delete on public.equipo
  for each row execute function public.registrar_auditoria();
create trigger auditar_proyecto_equipo after insert or delete on public.proyecto_equipo
  for each row execute function public.registrar_auditoria();

revoke execute on function public.sincronizar_rol_equipo() from public, anon, authenticated;
revoke execute on function public.guardar_columnas_proyecto() from public, anon, authenticated;
revoke execute on function public.guardar_columnas_hito() from public, anon, authenticated;
revoke execute on function public.tocar_proyecto_padre() from public, anon, authenticated;
