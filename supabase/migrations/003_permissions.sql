-- ApunteIA: privilegios del rol cliente, con las políticas RLS de 001_schema.sql activas.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles,public.subjects,public.folders,public.notes,public.note_assets,public.flashcards to authenticated;
grant select on public.ai_usage to authenticated;
revoke insert, update, delete on public.ai_usage from authenticated;
