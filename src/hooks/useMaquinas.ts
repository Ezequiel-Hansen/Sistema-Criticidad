import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Area, MaquinaConArea } from '../types'

type ActualizarMaquinaInput = {
  id: string
  nombre_equipo: string
  cod_universal: string
  nombre_area: string
  planta_area: string
}

const KEYS = {
  maquinas: ['maquinas'] as const,
  activoMaquinas: ['activo_maquinas'] as const,
}

export function useTodasMaquinas() {
  return useQuery({
    queryKey: KEYS.maquinas,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maquina')
        .select('id, cod_universal, nombre_equipo, id_area, area:id_area(id, nombre_area, planta_area)')
      if (error) throw error
      return (data ?? []).map((m) => ({
        ...m,
        area: m.area as unknown as Area,
      })) as MaquinaConArea[]
    },
  })
}

export function useTodosActivoMaquinas() {
  return useQuery({
    queryKey: KEYS.activoMaquinas,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activo_maquina')
        .select('activo_id, maquina_id')
      if (error) throw error
      return (data ?? []) as { activo_id: string; maquina_id: string }[]
    },
  })
}

export function useVincularMaquina() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ activoId, maquinaId }: { activoId: string; maquinaId: string }) => {
      const { error } = await supabase
        .from('activo_maquina')
        .insert({ activo_id: activoId, maquina_id: maquinaId })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.activoMaquinas })
    },
  })
}

export function useDesvincularMaquina() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ activoId, maquinaId }: { activoId: string; maquinaId: string }) => {
      const { error } = await supabase
        .from('activo_maquina')
        .delete()
        .eq('activo_id', activoId)
        .eq('maquina_id', maquinaId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.activoMaquinas })
    },
  })
}

type CrearMaquinaInput = {
  nombre_equipo: string
  cod_universal: string
  nombre_area: string
  planta_area: string
}

export function useCrearMaquina() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CrearMaquinaInput) => {
      const { data: existing, error: checkError } = await supabase
        .from('maquina')
        .select('id')
        .eq('cod_universal', input.cod_universal)
        .maybeSingle()
      if (checkError) throw new Error('Error al verificar código universal: ' + checkError.message)
      if (existing) {
        throw new Error('Ya existe una máquina con ese código universal')
      }

      let areaId: string
      const { data: existingArea, error: areaLookupError } = await supabase
        .from('area')
        .select('id')
        .eq('nombre_area', input.nombre_area)
        .eq('planta_area', input.planta_area)
        .maybeSingle()

      if (areaLookupError) throw new Error('Error al buscar área: ' + areaLookupError.message)

      if (existingArea) {
        areaId = existingArea.id
      } else {
        const { data: newArea, error: areaError } = await supabase
          .from('area')
          .insert({ nombre_area: input.nombre_area, planta_area: input.planta_area })
          .select('id')
          .single()
        if (areaError) throw new Error('Error al crear área: ' + areaError.message)
        areaId = newArea.id
      }

      const { data: newMaquina, error: maquinaError } = await supabase
        .from('maquina')
        .insert({
          nombre_equipo: input.nombre_equipo,
          cod_universal: input.cod_universal,
          id_area: areaId,
        })
        .select('id')
        .single()
      if (maquinaError) throw new Error('Error al crear máquina: ' + maquinaError.message)
      return newMaquina.id as string
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.maquinas })
    },
  })
}

export function useActualizarMaquina() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: ActualizarMaquinaInput) => {
      let areaId: string
      const { data: existingArea, error: areaLookupError } = await supabase
        .from('area')
        .select('id')
        .eq('nombre_area', input.nombre_area)
        .eq('planta_area', input.planta_area)
        .maybeSingle()

      if (areaLookupError) throw new Error('Error al buscar área: ' + areaLookupError.message)

      if (existingArea) {
        areaId = existingArea.id
      } else {
        const { data: newArea, error: areaError } = await supabase
          .from('area')
          .insert({ nombre_area: input.nombre_area, planta_area: input.planta_area })
          .select('id')
          .single()
        if (areaError) throw new Error('Error al crear área: ' + areaError.message)
        areaId = newArea.id
      }

      const { error } = await supabase
        .from('maquina')
        .update({
          nombre_equipo: input.nombre_equipo,
          cod_universal: input.cod_universal,
          id_area: areaId,
        })
        .eq('id', input.id)
      if (error) throw new Error('Error al actualizar máquina: ' + error.message)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.maquinas })
    },
  })
}

export function useEliminarMaquina() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('maquina')
        .delete()
        .eq('id', id)
      if (error) throw new Error('Error al eliminar máquina: ' + error.message)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.maquinas })
      qc.invalidateQueries({ queryKey: KEYS.activoMaquinas })
    },
  })
}
