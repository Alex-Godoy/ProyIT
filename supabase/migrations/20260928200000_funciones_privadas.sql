-- Las funciones de permisos se usan dentro de las políticas RLS, pero no
-- deben quedar publicadas como endpoints /rest/v1/rpc. Se mueven a un
-- esquema que la API no expone (las políticas las referencian por OID).

create schema if not exists privado;
revoke all on schema privado from public, anon;
grant usage on schema privado to authenticated;

alter function public.es_admin() set schema privado;
alter function public.puede_ver_proyecto(uuid) set schema privado;

-- puede_ver_proyecto llama a es_admin por nombre: actualizar la referencia.
create or replace function privado.puede_ver_proyecto(p_proyecto_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select privado.es_admin() or exists (
    select 1
    from public.proyectos p
    join public.cliente_accesos a on a.cliente_id = p.cliente_id
    where p.id = p_proyecto_id and a.user_id = (select auth.uid())
  );
$$;

revoke execute on all functions in schema privado from public, anon;
grant execute on all functions in schema privado to authenticated;
