-- Perbaikan lanjutan setelah migration 20261101000000.

-- 1. Trigger pendaftaran membuat profil dengan role 'siswa' (sebelumnya 'student' dan ditolak constraint).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.profiles (id, full_name, role)
    values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'Pengguna SekolahKu'),
      'siswa'
    )
    on conflict (id) do nothing;
  return new;
end;
$function$;

-- 2. Pengguna login perlu hak tabel pengumuman. RLS tetap membatasi isinya.
grant select, insert, update, delete on public.announcements to authenticated;
