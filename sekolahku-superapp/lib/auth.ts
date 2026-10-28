import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent'

export async function requireRole(allowedRoles: UserRole[]) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/login')
  }

  if (!allowedRoles.includes(profile.role as UserRole)) {
    redirect('/')
  }

  return {
    user,
    profile: {
      role: profile.role as UserRole,
      fullName: profile.full_name as string,
    },
  }
}
