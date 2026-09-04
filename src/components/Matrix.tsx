import type { Activo } from '../types'
import { colorFor, scoreOf, ZONES } from '../constants'

type Props = { activos: Activo[] }

const SCALE = [1, 3, 5, 7, 10]

export function Matrix({ activos }: Props) {
  const verificados = activos.filter((a) => a.verify)
  const cells: { f: number; i: number }[] = []
  for (let i = SCALE.length - 1; i >= 0; i--) {
    for (let f = 0; f < SCALE.length; f++) cells.push({ f: SCALE[f], i: SCALE[i] })
  }

  // group by F-I to offset overlapping markers
  const groups: Record<string, number[]> = {}
  verificados.forEach((_, idx) => {
    const a = verificados[idx]
    const key = `${a.freq_score}-${a.safety_score}-${a.environment_score}-${a.production_score}`
    ;(groups[key] ??= []).push(idx)
  })

  const maxImpact = (a: Activo) => Math.max(a.safety_score, a.environment_score, a.production_score)

  return (
    <div>
      <div className="grid max-w-[720px] mx-auto mb-2"
        style={{ gridTemplateColumns: '26px 1fr', gridTemplateRows: '1fr 26px', gap: 8 }}>
        <div className="[writing-mode:vertical-rl] rotate-180 flex items-center justify-center font-mono text-[11px] tracking-[.1em] text-navy-deep uppercase">
          Frecuencia
        </div>
        <div className="relative aspect-square rounded-[10px] border border-line">
          <div className="absolute inset-0 grid rounded-[9px] overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${SCALE.length},1fr)`, gridTemplateRows: `repeat(${SCALE.length},1fr)` }}>
            {cells.map(({ f, i }) => {
              const score = scoreOf({ freq_score: f, safety_score: i, environment_score: i, production_score: i })
              const zone = ZONES.find((z) => score <= z.max) ?? ZONES[ZONES.length - 1]
              const style: React.CSSProperties = {
                background: zone.color,
                opacity: 0.16 + (score / 100) * 0.34,
              }
              return (
                <div key={`${f}-${i}`} className="relative border-[0.5px] border-white/55" style={style}>
                  <span className="absolute top-[3px] right-[5px] font-mono text-[10px] text-ink/35">
                    {score}
                  </span>
                </div>
              )
            })}
            <div className="pointer-events-none absolute inset-0">
              {verificados.map((a, idx) => {
                const maxI = maxImpact(a)
                const key = `${a.freq_score}-${a.safety_score}-${a.environment_score}-${a.production_score}`
                const group = groups[key]
                const posInGroup = group.indexOf(idx)
                const count = group.length
                const offset = (posInGroup - (count - 1) / 2) * 15
                const fIdx = SCALE.indexOf(a.freq_score)
                const iIdx = SCALE.indexOf(maxI)
                if (fIdx === -1 || iIdx === -1) return null
                const leftPct = ((fIdx + 0.5) / SCALE.length) * 100
                const topPct = ((SCALE.length - iIdx - 0.5) / SCALE.length) * 100
                return (
                  <div
                    key={a.id}
                    title={`${a.name || 'Equipo ' + (idx + 1)} — F${a.freq_score} · max(I)${maxI}`}
                    className="absolute w-[26px] h-[26px] rounded-full flex items-center justify-center font-mono font-bold text-[12px] text-white border-2 border-paper shadow-[0_1px_4px_rgba(20,32,43,.35)] transition-all duration-200"
                    style={{
                      left: `calc(${leftPct}% + ${offset}px)`,
                      top: `${topPct}%`,
                      background: colorFor(idx),
                      transform: 'translate(-50%,-50%)',
                    }}
                  >
                    {idx + 1}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center font-mono text-[11px] tracking-[.1em] text-navy-deep uppercase">
          Impacto (max)
        </div>
      </div>

      <div className="flex gap-2.5 flex-wrap justify-center mt-4">
        {ZONES.map((z, zi) => {
          const prev = ZONES[zi - 1]
          const min = prev ? prev.max + 1 : 1
          return (
            <div key={z.key} className="flex items-center gap-[7px] text-[12px] px-2.5 py-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: z.color }} />
              <span>
                {z.label} ({min}–{z.max}) → <b className="font-mono text-navy-deep">{z.strategy}</b>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}