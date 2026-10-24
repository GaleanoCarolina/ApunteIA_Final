-- Reserva atómica de presupuesto, visible solo para el servidor.
create or replace function public.reserve_ai_request(p_uid uuid,p_day date,p_max integer) returns boolean
language plpgsql security definer set search_path='' as $$
declare n integer;
begin
if auth.role() <> 'service_role' then raise exception 'Solo servicio'; end if;
if p_max<1 or p_max>100 then raise exception 'Cuota inválida';end if;
insert into public.ai_usage(user_id,usage_date,requests) values(p_uid,p_day,0) on conflict do nothing;
select requests into n from public.ai_usage where user_id=p_uid and usage_date=p_day for update;
if n>=p_max then return false;end if;
update public.ai_usage set requests=requests+1 where user_id=p_uid and usage_date=p_day;
return true;
end;$$;
revoke all on function public.reserve_ai_request(uuid,date,integer) from public,anon,authenticated;
grant execute on function public.reserve_ai_request(uuid,date,integer) to service_role;
