import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { Activo, MaquinaConArea } from '../types'
import {
  colorFor,
  FREQ_LEVELS,
  SAFETY_LEVELS,
  ENVIRONMENT_LEVELS,
  PRODUCTION_LEVELS,
  nivel,
  scoreOf,
  zoneFor,
  hasSpecialCase,
} from '../constants'
import { MachineForm } from './MachineForm'

type Props = {
  activo: Activo
  index: number
  editable: boolean
  maquinasDisponibles: MaquinaConArea[]
  maquinasVinculadas: MaquinaConArea[]
  onRemove: (id: string) => void
  onVerify: (id: string) => void
  onLinkMachine: (activoId: string, maquinaId: string) => void
  onUnlinkMachine: (activoId: string, maquinaId: string) => void
  onUpdate: (patch: {
    name: string
    freq_score: number
    safety_score: number
    environment_score: number
    production_score: number
  }) => void
}

export function AssetForm({
  activo,
  index,
  editable,
  maquinasDisponibles,
  maquinasVinculadas,
  onRemove,
  onVerify,
  onLinkMachine,
  onUnlinkMachine,
  onUpdate,
}: Props) {
  const [showMachineForm, setShowMachineForm] = useState(false)
  const { register, watch, setValue, getValues, reset } = useForm({
    defaultValues: {
      name: activo.name,
      freq_score: activo.freq_score,
      safety_score: activo.safety_score,
      environment_score: activo.environment_score,
      production_score: activo.production_score,
    },
  })

  useEffect(() => {
    reset({
      name: activo.name,
      freq_score: activo.freq_score,
      safety_score: activo.safety_score,
      environment_score: activo.environment_score,
      production_score: activo.production_score,
    })
  }, [activo.id, activo.name, activo.freq_score, activo.safety_score, activo.environment_score, activo.production_score, reset])

  const freq_score = watch('freq_score')
  const safety_score = watch('safety_score')
  const environment_score = watch('environment_score')
  const production_score = watch('production_score')

  const score = scoreOf({ freq_score, safety_score, environment_score, production_score })
  const zone = zoneFor(score)
  const special = hasSpecialCase({ safety_score, environment_score, production_score })

  const isDisabled = activo.verify && !editable

  const push = () =>
    onUpdate({
      name: getValues('name') || '',
      freq_score: getValues('freq_score'),
      safety_score: getValues('safety_score'),
      environment_score: getValues('environment_score'),
      production_score: getValues('production_score'),
    })

  return (
    <div className="rounded-xl border border-line p-3.5 mb-3.5 bg-off-white">
      <div className="flex items-center gap-2.5 mb-3">
        <span
          className="w-[26px] h-[26px] rounded-full flex items-center justify-center font-mono font-semibold text-[12px] text-white shrink-0"
          style={{ background: colorFor(index) }}
        >
          {index + 1}
        </span>
        <input
          {...register('name')}
          onChange={(e) => {
            register('name').onChange(e)
            void push()
          }}
          disabled={isDisabled}
          placeholder="Nombre del equipo"
          className="flex-1 h-8 rounded-lg border border-line px-2.5 text-[13.5px] bg-paper text-ink outline-none focus:border-navy-deep disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => onRemove(activo.id)}
          disabled={!editable}
          title="Quitar equipo"
          className="shrink-0 w-7 h-7 rounded-lg border border-line bg-paper text-ink-soft text-[15px] hover:text-red hover:border-red hover:cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
        >
          ×
        </button>
      </div>

      <ScaleInput
        label="Frecuencia de ocurrencia del MRO"
        levels={FREQ_LEVELS}
        value={freq_score}
        disabled={isDisabled}
        onChange={(v) => {
          setValue('freq_score', v)
          void push()
        }}
      />
      <ScaleInput
        label="Impacto en Seguridad"
        levels={SAFETY_LEVELS}
        value={safety_score}
        disabled={isDisabled}
        onChange={(v) => {
          setValue('safety_score', v)
          void push()
        }}
      />
      <ScaleInput
        label="Impacto en Medio Ambiente"
        levels={ENVIRONMENT_LEVELS}
        value={environment_score}
        disabled={isDisabled}
        onChange={(v) => {
          setValue('environment_score', v)
          void push()
        }}
      />
      <ScaleInput
        label="Impacto en Instalaciones/Negocio/Cliente"
        levels={PRODUCTION_LEVELS}
        value={production_score}
        disabled={isDisabled}
        onChange={(v) => {
          setValue('production_score', v)
          void push()
        }}
      />

      {editable && (
        <>
          {!showMachineForm && (
            <button
              type="button"
              onClick={() => setShowMachineForm(true)}
              className="mt-2 text-[16px] font-medium text-navy-deep hover:underline hover:cursor-pointer"
            >
              {maquinasVinculadas.length > 0 ? 'Gestionar máquinas' : 'Asignar máquina'}
            </button>
          )}
          {showMachineForm && (
            <MachineForm
              maquinasDisponibles={maquinasDisponibles}
              maquinasVinculadas={maquinasVinculadas}
              onLink={(mId) => onLinkMachine(activo.id, mId)}
              onUnlink={(mId) => onUnlinkMachine(activo.id, mId)}
              onCancel={() => setShowMachineForm(false)}
            />
          )}
        </>
      )}

      {!editable && maquinasVinculadas.length > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-dashed border-line">
          <div className="text-[11px] font-medium text-ink-soft mb-1">Máquinas:</div>
          <div className="flex flex-wrap gap-1.5">
            {maquinasVinculadas.map((m) => (
              <span
                key={m.id}
                className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full bg-navy-deep/10 text-navy-deep"
              >
                {m.nombre_equipo} ({m.cod_universal})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-dashed border-line">
        <span className="font-mono text-[12px] text-ink-soft">
          Score: <b className="text-navy-deep">{score}</b> / 100
        </span>
        <div className="flex items-center gap-2">
          {special && (
            <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red text-white">
              Caso especial
            </span>
          )}
          <span
            className="font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-white"
            style={{ background: zone.color }}
          >
            {zone.label}
          </span>
          {editable && !activo.verify && (
            <button
              type="button"
              onClick={() => onVerify(activo.id)}
              className="font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-600 text-white hover:bg-green-700 hover:cursor-pointer transition-colors"
            >
              Confirmar activo
            </button>
          )}
          {activo.verify && (
            <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-600 text-white">
              Verificado
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function ScaleInput({
  label,
  levels,
  value,
  disabled,
  onChange,
}: {
  label: string
  levels: { v: number; label: string; desc: string }[]
  value: number
  disabled: boolean
  onChange: (v: number) => void
}) {
  const desc = nivel(levels, value)
  return (
    <div className="mb-2.5">
      <div className="text-[12px] font-medium text-ink-soft mb-1.5">{label}</div>
      <div className="flex gap-[5px]">
        {levels.map((l) => (
          <button
            key={l.v}
            type="button"
            disabled={disabled}
            onClick={() => onChange(l.v)}
            className={
              `flex-1 ` +
              (l.v === value
                ? 'bg-navy-deep border-navy-deep text-white'
                : 'bg-paper border-line text-ink-soft hover:border-navy-deep ' + (!disabled ? 'cursor-pointer' : 'cursor-not-allowed')) +
              ' h-[30px] rounded-lg border font-mono text-[12.5px] font-semibold transition-colors'
            }
          >
            {l.v}
          </button>
        ))}
      </div>
      <div className="text-[11.5px] text-ink-soft mt-1.5 leading-tight min-h-[29px]">
        {desc?.label} — {desc?.desc}
      </div>
    </div>
  )
}