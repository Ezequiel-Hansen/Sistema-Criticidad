import type { Activo, Nivel, Zona } from './types'

export const FREQ_LEVELS: Nivel[] = [
  { v: 1, label: 'EXCLUDED', desc: 'Frecuencia nula; no es posible actualmente.' },
  { v: 3, label: 'IMPROBABLE', desc: '> 1 caso cada 100 años; físicamente posible pero nunca ocurrido.' },
  { v: 5, label: 'INFREQUENT', desc: '> 1 caso cada 10 años; ya ocurrió en la industria.' },
  { v: 7, label: 'FREQUENT', desc: '> 1 caso cada 5 años; ya ocurrió en la instalación.' },
  { v: 10, label: 'VERY FREQUENT', desc: '> 1 caso por año; suceso habitual.' },
]

export const SAFETY_LEVELS: Nivel[] = [
  { v: 1, label: 'NEGLIGABLE', desc: 'Near miss (incidente).' },
  { v: 3, label: 'LOW', desc: 'Primeros auxilios, sin pérdida de días.' },
  { v: 5, label: 'MEDIUM', desc: 'Accidente sin pérdida de días.' },
  { v: 7, label: 'HIGH', desc: 'Accidente con pérdida de días; incapacidad permanente.' },
  { v: 10, label: 'CATASTROPHIC', desc: 'Única o múltiples fatalidades.' },
]

export const ENVIRONMENT_LEVELS: Nivel[] = [
  { v: 1, label: 'NEGLIGABLE', desc: 'Efectos ambientales menores limitados a la planta.' },
  { v: 3, label: 'LOW', desc: 'Superación de parámetro que requiere informar a autoridades.' },
  { v: 5, label: 'MEDIUM', desc: 'Contaminación moderada limitada a la planta, remediable.' },
  { v: 7, label: 'HIGH', desc: 'Contaminación severa interna, no remediable; significativa externa.' },
  { v: 10, label: 'CATASTROPHIC', desc: 'Contaminación severa e inmediata, irreversible, fuera de la planta.' },
]

export const PRODUCTION_LEVELS: Nivel[] = [
  { v: 1, label: 'NEGLIGABLE', desc: 'Daños menores (paro < 1 día o coste < 10k€).' },
  { v: 3, label: 'LOW', desc: 'Paro 1–3 días o coste < 50k€.' },
  { v: 5, label: 'MEDIUM', desc: 'Paro 3–5 días o coste < 100k€; reclamación formal.' },
  { v: 7, label: 'HIGH', desc: 'Paro > 5 días o cierre total > 1 día; pérdida de cliente.' },
  { v: 10, label: 'CATASTROPHIC', desc: 'Cierre total del site > 1 día; riesgo de pérdida de certificación.' },
]

export const ZONES: Zona[] = [
  {
    key: 'baja', max: 25, label: 'Baja', color: '#1FA97A', critical: false, strategy: 'Correctivo',
    rationale: 'Reparar cuando falla es más económico que invertir en prevenirlo.',
  },
  {
    key: 'media', max: 49, label: 'Media', color: '#D9A22B', critical: false, strategy: 'Preventivo',
    rationale: 'Falla con cierta frecuencia y su impacto es moderado.',
  },
  {
    key: 'alta', max: 80, label: 'Alta', color: '#E0733F', critical: true, strategy: 'Predictivo',
    rationale: 'Alto impacto o alta frecuencia. Monitorear su condición permite intervenir a tiempo.',
  },
  {
    key: 'critica', max: 100, label: 'Crítica', color: '#D14343', critical: true, strategy: 'RCM / Rediseño',
    rationale: 'Falla seguido y su impacto es severo. Requiere análisis de causa raíz.',
  },
]

export const PALETTE = ['#1B2B5E', '#00C9A7', '#D4785C', '#534AB7', '#0F6E56', '#993C1D']

export const scoreOf = (a: Pick<Activo, 'freq_score' | 'safety_score' | 'environment_score' | 'production_score'>) =>
  a.freq_score * Math.max(a.safety_score, a.environment_score, a.production_score)

export const hasSpecialCase = (a: Pick<Activo, 'safety_score' | 'environment_score' | 'production_score'>) =>
  a.safety_score === 10 || a.environment_score === 10 || a.production_score === 10

export const zoneFor = (score: number): Zona =>
  ZONES.find((z) => score <= z.max) ?? ZONES[ZONES.length - 1]

export const colorFor = (index: number) => PALETTE[index % PALETTE.length]

export const nivel = (list: Nivel[], v: number) => list.find((l) => l.v === v)