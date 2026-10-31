-- SekolahKu: penyelarasan role, keamanan RLS, dan tabel relasi orang tua.
-- Tidak ada baris data yang dihapus. Hanya nilai role yang diganti namanya.

-- 1. Nama role sesuai aturan proyek: admin, guru, siswa, orang_tua
alter table public.profiles drop constraint if exists profiles_role_check;

update public.profiles
   set role = case role
                when 'teacher' then 'guru'
                when 'student' then 'siswa'
                when 'parent'  then 'orang_tua'
                else role
              end
 where role in ('teacher', 'student', 'parent');

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'guru', 'siswa', 'orang_tua'));

alter table public.profiles alter column role set default 'siswa';

-- 2. Cabut hak yang tidak dilindungi RLS (TRUNCATE melewati RLS sepenuhnya)
revoke truncate, trigger, references on all tables in schema public from anon, authenticated;

-- 3. Pengumuman yang diterbitkan boleh dibaca publik (policy sudah ada, grant belum)
grant select on public.announcements to anon;

-- 4. current_user_role: jalan sebagai pemanggil (INVOKER), tidak bisa dipanggil anon
create or replace function public.current_user_role()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select p.role
    from public.profiles p
   where p.id = (select auth.uid())
   limit 1
$$;

revoke execute on function public.current_user_role() from public, anon;
grant execute on function public.current_user_role() to authenticated;

-- 5. Tabel relasi sekolah
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete set null,
  full_name text not null,
  status text not null default 'aktif' check (status in ('aktif', 'nonaktif')),
  created_at timestamptz not null default now()
);

create table if not exists public.parents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete set null,
  full_name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.student_parents (
  student_id uuid not null references public.students(id) on delete cascade,
  parent_id uuid not null references public.parents(id) on delete cascade,
  relationship text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (student_id, parent_id)
);

create index if not exists student_parents_parent_id_idx on public.student_parents (parent_id);
create index if not exists students_class_id_idx on public.students (class_id);
create index if not exists students_user_id_idx on public.students (user_id);
create index if not exists attendance_records_student_id_idx on public.attendance_records (student_id);
create index if not exists schedules_class_id_idx on public.schedules (class_id);

alter table public.subjects enable row level security;
alter table public.teachers enable row level security;
alter table public.parents enable row level security;
alter table public.student_parents enable row level security;

revoke all on public.subjects, public.teachers, public.parents, public.student_parents from anon, authenticated;
grant select, insert, update, delete on public.subjects, public.teachers, public.parents, public.student_parents to authenticated;

-- 6. Policy ulang dengan nama role yang benar. Pemeriksaan staf: admin atau guru.
drop policy if exists "School staff manage announcements" on public.announcements;
create policy "School staff manage announcements" on public.announcements
  for all to authenticated
  using ((select public.current_user_role()) in ('admin', 'guru'))
  with check ((select public.current_user_role()) in ('admin', 'guru'));

drop policy if exists "Staff manage attendance records" on public.attendance_records;
create policy "Staff manage attendance records" on public.attendance_records
  for all to authenticated
  using ((select public.current_user_role()) in ('admin', 'guru'))
  with check ((select public.current_user_role()) in ('admin', 'guru'));

drop policy if exists "School staff manage classes" on public.classes;
create policy "School staff manage classes" on public.classes
  for all to authenticated
  using ((select public.current_user_role()) in ('admin', 'guru'))
  with check ((select public.current_user_role()) in ('admin', 'guru'));

drop policy if exists "Staff manage students" on public.students;
create policy "Staff manage students" on public.students
  for all to authenticated
  using ((select public.current_user_role()) in ('admin', 'guru'))
  with check ((select public.current_user_role()) in ('admin', 'guru'));

-- Jadwal: satu policy untuk staf, menggantikan tiga policy yang memakai profiles langsung
drop policy if exists "School staff can create schedules" on public.schedules;
drop policy if exists "School staff can update schedules" on public.schedules;
drop policy if exists "School staff can delete schedules" on public.schedules;
create policy "School staff manage schedules" on public.schedules
  for all to authenticated
  using ((select public.current_user_role()) in ('admin', 'guru'))
  with check ((select public.current_user_role()) in ('admin', 'guru'));

-- Profil: hapus policy SELECT yang duplikat (logikanya sama dengan "Users can read their own profile")
drop policy if exists "Users read own profile" on public.profiles;

-- Policy untuk tabel baru
create policy "Authenticated read subjects" on public.subjects
  for select to authenticated using (true);
create policy "Staff manage subjects" on public.subjects
  for all to authenticated
  using ((select public.current_user_role()) in ('admin', 'guru'))
  with check ((select public.current_user_role()) in ('admin', 'guru'));

create policy "Staff manage teachers" on public.teachers
  for all to authenticated
  using ((select public.current_user_role()) in ('admin', 'guru'))
  with check ((select public.current_user_role()) in ('admin', 'guru'));
create policy "Teachers read own record" on public.teachers
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Staff manage parents" on public.parents
  for all to authenticated
  using ((select public.current_user_role()) in ('admin', 'guru'))
  with check ((select public.current_user_role()) in ('admin', 'guru'));
create policy "Parents read own record" on public.parents
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Staff manage student_parents" on public.student_parents
  for all to authenticated
  using ((select public.current_user_role()) in ('admin', 'guru'))
  with check ((select public.current_user_role()) in ('admin', 'guru'));
create policy "Parents read own links" on public.student_parents
  for select to authenticated
  using (exists (
    select 1 from public.parents p
     where p.id = student_parents.parent_id
       and p.user_id = (select auth.uid())
  ));

-- Orang tua hanya melihat anak yang hubungannya sudah diverifikasi staf
create policy "Parents read verified children" on public.students
  for select to authenticated
  using (exists (
    select 1 from public.student_parents sp
      join public.parents p on p.id = sp.parent_id
     where sp.student_id = students.id
       and sp.is_verified
       and p.user_id = (select auth.uid())
  ));

create policy "Parents read verified children attendance" on public.attendance_records
  for select to authenticated
  using (exists (
    select 1 from public.student_parents sp
      join public.parents p on p.id = sp.parent_id
     where sp.student_id = attendance_records.student_id
       and sp.is_verified
       and p.user_id = (select auth.uid())
  ));
