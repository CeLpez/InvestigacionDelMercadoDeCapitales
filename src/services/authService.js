import { supabase, isSupabaseConfigured } from './supabaseClient'

const requireSupabase = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

export const authService = {
  async signUp(email, password) {
    const client = requireSupabase()
    return client.auth.signUp({ email, password })
  },

  async signIn(email, password) {
    const client = requireSupabase()
    return client.auth.signInWithPassword({ email, password })
  },

  async signOut() {
    const client = requireSupabase()
    return client.auth.signOut()
  },

  async getSession() {
    const client = requireSupabase()
    return client.auth.getSession()
  },

  onAuthStateChange(callback) {
    const client = requireSupabase()
    return client.auth.onAuthStateChange(callback)
  }
}
