export type Activo = {
  id: string
  name: string
  freq_score: number
  safety_score: number
  environment_score: number
  production_score: number
  created_at: string
  verify: boolean
}

export type Area = {
  id: string
  nombre_area: string
  planta_area: string
}

export type Maquina = {
  id: string
  cod_universal: string
  nombre_equipo: string
  id_area: string
}

export type MaquinaConArea = Maquina & { area: Area }

export type ZonaKey = 'baja' | 'media' | 'alta' | 'critica'

export type Zona = {
  key: ZonaKey
  max: number
  label: string
  color: string
  critical: boolean
  strategy: string
  rationale: string
}

export type Nivel = {
  v: number
  label: string
  desc: string
}
