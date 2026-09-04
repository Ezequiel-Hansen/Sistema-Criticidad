import { createClient } from '@supabase/supabase-js'
import type { Activo } from '../types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !anonKey) {
  console.warn(
    '[supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env — ¿creaste el proyecto Supabase?',
  )
}

export const supabase = createClient(
  url ?? 'http://localhost:54321',
  anonKey ?? 'missing-anon-key',
)

export type ActivoRow = Pick<Activo, 'id' | 'name' | 'freq_score' | 'safety_score' | 'environment_score' | 'production_score' | 'created_at'>

export const fromActivos = () => supabase.from('activos')