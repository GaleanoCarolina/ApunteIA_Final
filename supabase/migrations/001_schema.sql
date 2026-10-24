-- ApunteIA: esquema privado. Aplicar con una cuenta administradora en SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade,display_name text not null default '',created_at timestamptz not null default now());
create table if not exists public.subjects (id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,name text not null check(length(name) between 1 and 120),color text not null default '#0876D5',description text,archived boolean not null default false,created_at timestamptz not null default now(),unique(id,user_id));
create table if not exists public.folders (id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,subject_id uuid not null,parent_id uuid,name text not null check(length(name) between 1 and 120),created_at timestamptz not null default now(),unique(id,user_id),foreign key(subject_id,user_id) references public.subjects(id,user_id) on delete cascade,foreign key(parent_id,user_id) references public.folders(id,user_id));
create table if not exists public.notes (id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,subject_id uuid,folder_id uuid,title text not null check(length(title) between 1 and 250),raw_text text not null default '',edited_text text not null default '',ai_summary text not null default '',processing_status text not null default 'pendiente' check(processing_status in ('pendiente','subiendo','analizando','completado','fallido')),favorite boolean not null default false,deleted_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(id,user_id),foreign key(subject_id,user_id) references public.subjects(id,user_id),foreign key(folder_id,user_id) references public.folders(id,user_id));
create table if not exists public.note_assets(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,note_id uuid not null,storage_path text not null unique,mime text not null check(mime in ('image/jpeg','image/png','image/webp')),size_bytes integer not null check(size_bytes between 1 and 8388608),page_order integer not null check(page_order>=0),created_at timestamptz not null default now(),foreign key(note_id,user_id) references public.notes(id,user_id) on delete cascade,unique(note_id,page_order));
create table if not exists public.flashcards(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,note_id uuid not null,question text not null check(length(question) between 1 and 1500),answer text not null check(length(answer) between 1 and 3000),interval_days integer not null default 1 check(interval_days between 1 and 365),due_at timestamptz not null default now(),created_at timestamptz not null default now(),foreign key(note_id,user_id) references public.notes(id,user_id) on delete cascade);
create table if not exists public.ai_usage(user_id uuid not null references auth.users(id) on delete cascade,usage_date date not null default current_date,requests integer not null default 0 check(requests>=0),primary key(user_id,usage_date));
create index if not exists idx_notes_owner_time on public.notes(user_id,updated_at desc);
create index if not exists idx_notes_subject on public.notes(user_id,subject_id);
create index if not exists idx_assets_note on public.note_assets(user_id,note_id,page_order);
create index if not exists idx_cards_due on public.flashcards(user_id,due_at);
create or replace function public.touch_note() returns trigger language plpgsql set search_path='' as $$begin new.updated_at=now(); return new; end;$$;
drop trigger if exists trg_notes_touch on public.notes;
create trigger trg_notes_touch before update on public.notes for each row execute function public.touch_note();
-- Verificar que una carpeta pertenezca a la misma materia y que no cree ciclos.
create or replace function public.check_folder() returns trigger language plpgsql set search_path='' as $$
declare parent_subject uuid;cursor_id uuid; depth integer:=0;
begin
if new.parent_id is null then return new;end if;
select subject_id into parent_subject from public.folders where id=new.parent_id and user_id=new.user_id;
if parent_subject is distinct from new.subject_id then raise exception 'La carpeta padre pertenece a otra materia';end if;
cursor_id:=new.parent_id;
while cursor_id is not null loop
if cursor_id=new.id then raise exception 'No se permiten ciclos de carpetas';end if;
select parent_id into cursor_id from public.folders where id=cursor_id and user_id=new.user_id;
depth:=depth+1;if depth>30 then raise exception 'Profundidad de carpetas excedida';end if;
end loop;
return new;
end;$$;
drop trigger if exists trg_folder_check on public.folders;
create trigger trg_folder_check before insert or update on public.folders for each row execute function public.check_folder();
-- Una nota colocada en carpeta debe pertenecer a la misma materia.
create or replace function public.check_note_folder() returns trigger language plpgsql set search_path='' as $$
declare folder_subject uuid;begin
if new.folder_id is null then return new;end if;
select subject_id into folder_subject from public.folders where id=new.folder_id and user_id=new.user_id;
if folder_subject is distinct from new.subject_id then raise exception 'Carpeta y materia no coinciden';end if;
return new;end;$$;
drop trigger if exists trg_note_folder on public.notes;
create trigger trg_note_folder before insert or update on public.notes for each row execute function public.check_note_folder();
-- RLS debe permanecer habilitada para cada entidad.
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.folders enable row level security;
alter table public.notes enable row level security;
alter table public.note_assets enable row level security;
alter table public.flashcards enable row level security;
alter table public.ai_usage enable row level security;
create policy "my profile" on public.profiles for all to authenticated using (id=(select auth.uid())) with check(id=(select auth.uid()));
create policy "my subjects" on public.subjects for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "my folders" on public.folders for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "my notes" on public.notes for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "my assets" on public.note_assets for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "my flashcards" on public.flashcards for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "read my usage" on public.ai_usage for select to authenticated using(user_id=(select auth.uid()));
-- Bucket privado. Primer segmento de ruta coincide con el ID del usuario.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('note-images','note-images',false,8388608,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=false,file_size_limit=8388608,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
create policy "read own photos" on storage.objects for select to authenticated using(bucket_id='note-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "upload own photos" on storage.objects for insert to authenticated with check(bucket_id='note-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "delete own photos" on storage.objects for delete to authenticated using(bucket_id='note-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
