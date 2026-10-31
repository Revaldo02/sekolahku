-- Staf dapat melihat nama akun saat menghubungkan orang tua dan guru.
create policy "Staff read all profiles" on public.profiles
  for select to authenticated
  using ((select public.current_user_role()) in ('admin', 'guru'));

-- Hanya admin yang boleh mengubah role akun.
create policy "Admin update profile roles" on public.profiles
  for update to authenticated
  using ((select public.current_user_role()) = 'admin')
  with check ((select public.current_user_role()) = 'admin');

grant update (role) on public.profiles to authenticated;
