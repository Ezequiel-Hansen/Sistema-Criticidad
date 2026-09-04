import { useState } from 'react'
import type { MaquinaConArea } from '../types'

type Props = {
  maquinasDisponibles: MaquinaConArea[]
  maquinasVinculadas: MaquinaConArea[]
  onLink: (maquinaId: string) => void
  onUnlink: (maquinaId: string) => void
  onCancel: () => void
}

export function MachineForm({
  maquinasDisponibles,
  maquinasVinculadas,
  onLink,
  onUnlink,
  onCancel,
}: Props) {
  const [selectedId, setSelectedId] = useState('')

  const linkedIds = new Set(maquinasVinculadas.map((m) => m.id))
  const disponibles = maquinasDisponibles.filter((m) => !linkedIds.has(m.id))

  const handleLink = () => {
    if (!selectedId) return
    onLink(selectedId)
    setSelectedId('')
  }

  return (
    <div className="mt-2.5 pt-2.5 border-t border-dashed border-line">
      {maquinasVinculadas.length > 0 && (
        <div className="mb-2.5">
          <div className="text-[11px] font-medium text-ink-soft mb-1.5">Máquinas vinculadas:</div>
          <div className="flex flex-wrap gap-1.5">
            {maquinasVinculadas.map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1 font-mono text-[11px] font-medium px-2 py-0.5 rounded-full bg-navy-deep text-white"
              >
                {m.nombre_equipo} ({m.cod_universal})
                <button
                  type="button"
                  onClick={() => onUnlink(m.id)}
                  aria-label={`Desvincular ${m.nombre_equipo}`}
                  className="ml-0.5 text-white/70 hover:text-white hover:cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 items-end mb-2">
        <div className="flex-1">
          <label htmlFor="machine-select" className="text-[11px] font-medium text-ink-soft mb-1 block">Asignar máquina existente</label>
          <select
            id="machine-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full h-8 rounded-lg border border-line px-2 text-[12.5px] bg-paper text-ink outline-none focus:border-navy-deep"
          >
            <option value="">Seleccionar máquina…</option>
            {disponibles.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre_equipo} — {m.cod_universal}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleLink}
          disabled={!selectedId}
          className="h-8 px-3 rounded-lg border border-navy-deep text-navy-deep text-[12px] font-medium hover:bg-navy-deep hover:text-white disabled:opacity-35 disabled:cursor-not-allowed hover:cursor-pointer transition-colors"
        >
          Vincular
        </button>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="text-[16px] font-medium text-ink-soft hover:underline hover:cursor-pointer"
      >
        Cerrar
      </button>
    </div>
  )
}
