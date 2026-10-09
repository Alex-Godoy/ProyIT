-- A quién avisar por correo cuando pasa algo en un ticket. Cada acción corre
-- con los permisos de quien la hace (RLS), y ni el equipo puede leer el perfil
-- del cliente ni el cliente la ficha del equipo. Esta función entrega solo el
-- correo que corresponde a cada aviso y solo a quien tiene derecho a darlo:
--
--   'cliente'      quien atiende el ticket (super usuario o su responsable)
--                  obtiene el correo de quien lo abrió (o el del cliente).
--   'responsable'  el super usuario (al asignar) o el cliente del ticket (al
--                  responder) obtiene el correo del responsable asignado.

create or replace function public.destinatarios_aviso_ticket(p_ticket_id uuid, p_evento text)
returns text[]
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_cliente_id uuid;
  v_creado_por uuid;
  v_responsable_id uuid;
  v_correos text[];
begin
  select t.cliente_id, t.creado_por, t.responsable_id
    into v_cliente_id, v_creado_por, v_responsable_id
  from public.tickets t
  where t.id = p_ticket_id;
  if not found then
    return '{}';
  end if;

  if p_evento = 'cliente' then
    if not privado.atiende_ticket(p_ticket_id) then
      return '{}';
    end if;
    select array_remove(array[coalesce(p.email, c.email)], null)
      into v_correos
    from public.clientes c
    left join public.profiles p on p.id = v_creado_por
    where c.id = v_cliente_id;

  elsif p_evento = 'responsable' then
    if not (privado.es_admin() or privado.es_cliente_de(v_cliente_id)) then
      return '{}';
    end if;
    select array_remove(array[e.email], null)
      into v_correos
    from public.equipo e
    where e.id = v_responsable_id and e.activo;
  end if;

  return coalesce(v_correos, '{}');
end; $$;

revoke execute on function public.destinatarios_aviso_ticket(uuid, text) from public, anon;
grant execute on function public.destinatarios_aviso_ticket(uuid, text) to authenticated;
