import { useState } from 'react'
import type { MaquinaConArea } from '../types'
import { toast } from 'react-toastify'

type Props = {
  maquinas: MaquinaConArea[]
  activoMaquinas: { activo_id: string; maquina_id: string }[]
  onUpdate: (data: {
    id: string
    nombre_equipo: string
    cod_universal: string
    nombre_area: string
    planta_area: string
  }) => void
  onDelete: (id: string) => void
  onClose: () => void
  isPending: boolean
}

export function MachineManager({ maquinas, activoMaquinas, onUpdate, onDelete, onClose, isPending }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editCodigo, setEditCodigo] = useState('')
  const [editArea, setEditArea] = useState('')
  const [editPlanta, setEditPlanta] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmDeleteName, setConfirmDeleteName] = useState('')

  const startEdit = (m: MaquinaConArea) => {
    setEditingId(m.id)
    setEditNombre(m.nombre_equipo)
    setEditCodigo(m.cod_universal)
    setEditArea(m.area?.nombre_area ?? '')
    setEditPlanta(m.area?.planta_area ?? '')
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = () => {
    if (!editingId) return
    if (!editNombre || !editCodigo || !editArea || !editPlanta) {
      toast.error('Todos los campos son obligatorios')
      return
    }
    onUpdate({
      id: editingId,
      nombre_equipo: editNombre,
      cod_universal: editCodigo,
      nombre_area: editArea,
      planta_area: editPlanta,
    })
    setEditingId(null)
  }

  const handleDelete = (m: MaquinaConArea) => {
    const vinculados = activoMaquinas.filter((am) => am.maquina_id === m.id)
    if (vinculados.length > 0) {
      toast.warning(`"${m.nombre_equipo}" tiene ${vinculados.length} activo(s) vinculado(s). Desvinculá primero.`)
      return
    }
    setConfirmDeleteId(m.id)
    setConfirmDeleteName(m.nombre_equipo)
  }

  const confirmDelete = () => {
    if (confirmDeleteId) {
      onDelete(confirmDeleteId)
      setConfirmDeleteId(null)
      setConfirmDeleteName('')
    }
  }

  const cancelDelete = () => {
    setConfirmDeleteId(null)
    setConfirmDeleteName('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-paper rounded-xl border border-line shadow-lg w-full max-w-[720px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
          <h2 className="font-display text-[18px] font-bold text-navy-deep">Administrar máquinas</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-line bg-paper text-ink-soft text-[15px] hover:text-red hover:border-red hover:cursor-pointer flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="overflow-auto flex-1 p-5">
          {maquinas.length === 0 ? (
            <p className="text-ink-soft text-[13px] italic">No hay máquinas registradas.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="pb-2 pr-3 font-medium text-ink-soft">Nombre</th>
                  <th className="pb-2 pr-3 font-medium text-ink-soft">Código</th>
                  <th className="pb-2 pr-3 font-medium text-ink-soft">Área</th>
                  <th className="pb-2 pr-3 font-medium text-ink-soft">Planta</th>
                  <th className="pb-2 font-medium text-ink-soft text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {maquinas.map((m) => (
                  <tr key={m.id} className="border-b border-line/50 last:border-0">
                    {editingId === m.id ? (
                      <>
                        <td className="py-2 pr-3">
                          <input
                            value={editNombre}
                            onChange={(e) => setEditNombre(e.target.value)}
                            className="h-7 w-full rounded-lg border border-line px-2 text-[12px] bg-white text-ink outline-none focus:border-navy-deep"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            value={editCodigo}
                            onChange={(e) => setEditCodigo(e.target.value)}
                            className="h-7 w-full rounded-lg border border-line px-2 text-[12px] bg-white text-ink outline-none focus:border-navy-deep"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            value={editArea}
                            onChange={(e) => setEditArea(e.target.value)}
                            className="h-7 w-full rounded-lg border border-line px-2 text-[12px] bg-white text-ink outline-none focus:border-navy-deep"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            value={editPlanta}
                            onChange={(e) => setEditPlanta(e.target.value)}
                            className="h-7 w-full rounded-lg border border-line px-2 text-[12px] bg-white text-ink outline-none focus:border-navy-deep"
                          />
                        </td>
                        <td className="py-2">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={saveEdit}
                              disabled={isPending}
                              className="h-7 px-2.5 rounded-lg bg-navy-deep text-white text-[12px] font-medium hover:cursor-pointer disabled:opacity-50 transition-colors"
                            >
                              {isPending ? '…' : '✓'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="h-7 px-2.5 rounded-lg border border-line text-ink-soft text-[12px] font-medium hover:cursor-pointer transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 pr-3 text-ink font-medium">{m.nombre_equipo}</td>
                        <td className="py-2 pr-3 text-ink-soft font-mono text-[12px]">{m.cod_universal}</td>
                        <td className="py-2 pr-3 text-ink-soft">{m.area?.nombre_area ?? '—'}</td>
                        <td className="py-2 pr-3 text-ink-soft">{m.area?.planta_area ?? '—'}</td>
                        <td className="py-2">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEdit(m)}
                              title="Editar"
                              className="w-7 h-7 rounded-lg border border-line bg-paper text-ink-soft text-[13px] hover:text-navy-deep hover:border-navy-deep hover:cursor-pointer flex items-center justify-center transition-colors"
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(m)}
                              title="Eliminar"
                              className="w-7 h-7 rounded-lg border border-line bg-paper text-ink-soft text-[13px] hover:text-red hover:border-red hover:cursor-pointer flex items-center justify-center transition-colors"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-5 py-3 border-t border-line flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 rounded-lg border border-line text-ink-soft text-[12.5px] font-medium hover:cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-paper rounded-xl border border-line shadow-lg w-full max-w-[360px] p-5">
            <h3 className="font-display text-[16px] font-bold text-navy-deep mb-2">Eliminar máquina</h3>
            <p className="text-[13px] text-ink-soft mb-5">
              ¿Eliminar la máquina <b className="text-ink">{confirmDeleteName}</b>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelDelete}
                className="h-8 px-3.5 rounded-lg border border-line text-ink-soft text-[12.5px] font-medium hover:cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending}
                className="h-8 px-3.5 rounded-lg bg-red text-white text-[12.5px] font-medium hover:cursor-pointer disabled:opacity-50 transition-colors"
              >
                {isPending ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
