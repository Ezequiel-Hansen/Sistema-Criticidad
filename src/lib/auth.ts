import { supabase } from '../lib/supabase'

export async function loginWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function logout() {
  await supabase.auth.signOut({ scope: 'global' })
}

export async function hasActiveSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession()
  return !!data.session
}

export function onAuthChange(cb: (event: string) => void) {
  const { data } = supabase.auth.onAuthStateChange((event) => cb(event))
  return () => data.subscription.unsubscribe()
}
