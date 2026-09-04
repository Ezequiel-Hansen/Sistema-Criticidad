import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Activo } from '../types'

const KEYS = {
  activos: ['activos'] as const,
}

export function useActivos() {
  return useQuery({
    queryKey: KEYS.activos,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activos')
        .select('id, name, freq_score, safety_score, environment_score, production_score, created_at, verify')
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as Activo[]
    },
  })
}

type UpsertInput = {
  name: string
  freq_score: number
  safety_score: number
  environment_score: number
  production_score: number
}

export function useCrearActivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpsertInput) => {
      const { error } = await supabase.from('activos').insert(input)
      if (error) throw error
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: KEYS.activos })
      const previous = qc.getQueryData<Activo[]>(KEYS.activos)
      const optimistic: Activo = {
        id: crypto.randomUUID(),
        name: input.name,
        freq_score: input.freq_score,
        safety_score: input.safety_score,
        environment_score: input.environment_score,
        production_score: input.production_score,
        created_at: new Date().toISOString(),
        verify: false,
      }
      qc.setQueryData<Activo[]>(KEYS.activos, (prev) => [...(prev ?? []), optimistic])
      return { previous }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData<Activo[]>(KEYS.activos, ctx.previous)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.activos }),
  })
}

export function useActualizarActivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: UpsertInput & { id: string }) => {
      const { error } = await supabase.from('activos').update(input).eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, ...input }: UpsertInput & { id: string }) => {
      await qc.cancelQueries({ queryKey: KEYS.activos })
      const previous = qc.getQueryData<Activo[]>(KEYS.activos)
      qc.setQueryData<Activo[]>(KEYS.activos, (prev) =>
        (prev ?? []).map((a) => (a.id === id ? { ...a, ...input } : a)),
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData<Activo[]>(KEYS.activos, ctx.previous)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.activos }),
  })
}

export function useVerificarActivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('activos').update({ verify: true }).eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEYS.activos })
      const previous = qc.getQueryData<Activo[]>(KEYS.activos)
      qc.setQueryData<Activo[]>(KEYS.activos, (prev) =>
        (prev ?? []).map((a) => (a.id === id ? { ...a, verify: true } : a)),
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData<Activo[]>(KEYS.activos, ctx.previous)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.activos }),
  })
}

export function useEliminarActivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('activos').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: KEYS.activos })
      const previous = qc.getQueryData<Activo[]>(KEYS.activos)
      qc.setQueryData<Activo[]>(KEYS.activos, (prev) => (prev ?? []).filter((a) => a.id !== id))
      return { previous }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData<Activo[]>(KEYS.activos, ctx.previous)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.activos }),
  })
}