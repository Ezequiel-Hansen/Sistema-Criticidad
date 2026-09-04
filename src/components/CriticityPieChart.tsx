import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Activo } from '../types'
import { scoreOf, zoneFor, ZONES } from '../constants'

type Props = { activos: Activo[] }

type PieData = {
  name: string
  value: number
  color: string
  strategy: string
  avgScore: number
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload: PieData }> }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-paper border border-line rounded-lg px-3 py-2 shadow-lg text-[13px]">
      <div className="font-semibold text-navy-deep mb-1">{d.name}</div>
      <div className="text-ink-soft">
        <span className="font-mono font-bold" style={{ color: d.color }}>{d.value}</span> activo{d.value !== 1 ? 's' : ''}
      </div>
      <div className="text-ink-soft">
        Score promedio: <span className="font-mono font-bold text-navy-deep">{d.avgScore.toFixed(1)}</span>
      </div>
      <div className="text-ink-soft">
        Estrategia: <span className="font-semibold text-navy-deep">{d.strategy}</span>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderLegend = (props: any) => {
  const payload = props?.payload as ReadonlyArray<{ value?: string; color: string; payload: PieData }> | undefined
  if (!payload) return null
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-2">
      {payload.map((entry) => {
        const d = entry.payload
        return (
          <div key={entry.value} className="flex items-center gap-2 text-[13px]">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: entry.color }} />
            <span className="text-ink-soft">
              {d.name}: <span className="font-mono font-semibold text-navy-deep">{d.value}</span>
              {' '}({((d.value / (payload.reduce((s: number, p: { payload: PieData }) => s + p.payload.value, 0) || 1)) * 100).toFixed(0)}%)
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function CriticityPieChart({ activos }: Props) {
  const confirmados = activos.filter((a) => a.verify)
  const total = confirmados.length

  const grouped = ZONES.map((z) => {
    const members = confirmados.filter((a) => zoneFor(scoreOf(a)).key === z.key)
    const avgScore = members.length
      ? members.reduce((s, a) => s + scoreOf(a), 0) / members.length
      : 0
    return {
      name: z.label,
      value: members.length,
      color: z.color,
      strategy: z.strategy,
      avgScore,
    }
  }).filter((d) => d.value > 0)

  if (total === 0) {
    return (
      <p className="text-ink-soft italic text-center py-8">
        No hay activos para mostrar en el gráfico.
      </p>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={grouped}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
            animationBegin={0}
            animationDuration={800}
          >
            {grouped.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-[12.5px] text-ink-soft mt-1">
        Total de activos: <span className="font-mono font-semibold text-navy-deep">{total}</span>
      </p>
    </div>
  )
}
