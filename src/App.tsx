import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useActivos,
  useActualizarActivo,
  useCrearActivo,
  useEliminarActivo,
  useVerificarActivo,
} from './hooks/useActivos'
import {
  useTodasMaquinas,
  useTodosActivoMaquinas,
  useVincularMaquina,
  useDesvincularMaquina,
  useCrearMaquina,
  useActualizarMaquina,
  useEliminarMaquina,
} from './hooks/useMaquinas'
import { onAuthChange, hasActiveSession } from './lib/auth'
import { AssetForm } from './components/AssetForm'
import { MachineManager } from './components/MachineManager'
import { Navbar } from './components/Navbar'
import { exportExcel } from './lib/exportExcel'
import { Matrix } from './components/Matrix'
import { CriticityPieChart } from './components/CriticityPieChart'
import { ResultsTable } from './components/ResultsTable'
import { Toast } from './components/Toast'
import { Login } from './pages/Login'
import { toast } from 'react-toastify'

const qc = new QueryClient()

function AppInner() {
  const location = useLocation()
  const { data: activos = [], isLoading, isError, error } = useActivos()
  const crear = useCrearActivo()
  const actualizar = useActualizarActivo()
  const eliminar = useEliminarActivo()
  const verificar = useVerificarActivo()
  const { data: todasMaquinas = [] } = useTodasMaquinas()
  const { data: activoMaquinas = [] } = useTodosActivoMaquinas()
  const vincular = useVincularMaquina()
  const desvincular = useDesvincularMaquina()
  const crearMaquina = useCrearMaquina()
  const actualizarMaquina = useActualizarMaquina()
  const eliminarMaquina = useEliminarMaquina()
  const [editable, setEditable] = useState(() => !!(location.state as { editable?: boolean })?.editable)
  const [showNewMachineForm, setShowNewMachineForm] = useState(false)
  const [showMachineManager, setShowMachineManager] = useState(false)

  const [nmNombre, setNmNombre] = useState('')
  const [nmCodigo, setNmCodigo] = useState('')
  const [nmArea, setNmArea] = useState('')
  const [nmPlanta, setNmPlanta] = useState('')

  useEffect(() => {
    hasActiveSession().then((has) => setEditable(has)).catch(() => setEditable(false))
  }, [])

  useEffect(() => onAuthChange((event) => {
    if (event === 'SIGNED_OUT') {
      setEditable(false)
      qc.clear()
    } else if (event === 'SIGNED_IN') {
      setEditable(true)
    }
    void qc.refetchQueries({ queryKey: ['activos'] })
  }), [])

  useEffect(() => {
    if (!editable) {
      setShowMachineManager(false)
      setShowNewMachineForm(false)
    }
  }, [editable])

  const handleAdd = async () => {
    try {
      await crear.mutateAsync({
        name: '',
        freq_score: 1,
        safety_score: 1,
        environment_score: 1,
        production_score: 1,
      })
      toast.success('Equipo agregado')
    } catch {
      toast.error('No se pudo agregar el equipo')
    }
  }

  const handleUpdate = async (
    id: string,
    patch: {
      name: string
      freq_score: number
      safety_score: number
      environment_score: number
      production_score: number
    },
  ) => {
    try {
      await actualizar.mutateAsync({ id, ...patch })
    } catch {
      toast.error('No se pudo guardar el cambio')
    }
  }

  const handleRemove = async (id: string) => {
    if (eliminar.isPending) return
    try {
      await eliminar.mutateAsync(id)
      toast.success('Equipo eliminado')
    } catch {
      toast.error('No se pudo eliminar el equipo')
    }
  }

  const handleVerify = async (id: string) => {
    try {
      await verificar.mutateAsync(id)
      toast.success('Activo confirmado')
    } catch {
      toast.error('No se pudo confirmar el activo')
    }
  }

  const handleLinkMachine = async (activoId: string, maquinaId: string) => {
    if (!editable) return
    try {
      await vincular.mutateAsync({ activoId, maquinaId })
      toast.success('Máquina vinculada')
    } catch {
      toast.error('No se pudo vincular la máquina')
    }
  }

  const handleUnlinkMachine = async (activoId: string, maquinaId: string) => {
    if (!editable) return
    try {
      await desvincular.mutateAsync({ activoId, maquinaId })
      toast.success('Máquina desvinculada')
    } catch {
      toast.error('No se pudo desvincular la máquina')
    }
  }

  const handleCreateMachine = async (
    data: { nombre_equipo: string; cod_universal: string; nombre_area: string; planta_area: string },
  ) => {
    try {
      await crearMaquina.mutateAsync(data)
      toast.success('Máquina creada')
      setShowNewMachineForm(false)
      setNmNombre('')
      setNmCodigo('')
      setNmArea('')
      setNmPlanta('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear la máquina')
    }
  }

  const handleUpdateMachine = async (
    data: { id: string; nombre_equipo: string; cod_universal: string; nombre_area: string; planta_area: string },
  ) => {
    try {
      await actualizarMaquina.mutateAsync(data)
      toast.success('Máquina actualizada')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar la máquina')
    }
  }

  const handleDeleteMachine = async (id: string) => {
    try {
      await eliminarMaquina.mutateAsync(id)
      toast.success('Máquina eliminada')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar la máquina')
    }
  }

  return (
    <>
      <Navbar
        editable={editable}
        onToggle={setEditable}
        onExport={() => void exportExcel(activos, todasMaquinas, activoMaquinas)}
      />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-7 pb-16">
      <header className="flex flex-col gap-1.5 mb-6">
        {editable && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowNewMachineForm(!showNewMachineForm)}
              className="shrink-0 px-3 py-2.5 rounded-lg text-[12.5px] font-medium text-white bg-navy-deep hover:cursor-pointer transition-colors"
            >
              + Nueva máquina
            </button>
            <button
              type="button"
              onClick={() => setShowMachineManager(true)}
              className="shrink-0 px-3 py-2.5 rounded-lg text-[12.5px] font-medium text-navy-deep border border-navy-deep hover:bg-navy-deep hover:text-white hover:cursor-pointer transition-colors"
            >
              Administrar máquinas
            </button>
          </div>
        )}
        {editable && showNewMachineForm && (
          <div className="mt-2 p-2.5 rounded-lg border border-line bg-off-white">
            <div className="text-[11px] font-medium text-ink-soft mb-2">Nueva máquina</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                placeholder="Nombre del equipo"
                value={nmNombre}
                onChange={(e) => setNmNombre(e.target.value)}
                className="h-7 rounded-lg border border-line px-2 text-[12px] bg-paper text-ink outline-none focus:border-navy-deep"
              />
              <input
                placeholder="Código universal"
                value={nmCodigo}
                onChange={(e) => setNmCodigo(e.target.value)}
                className="h-7 rounded-lg border border-line px-2 text-[12px] bg-paper text-ink outline-none focus:border-navy-deep"
              />
              <input
                placeholder="Área"
                value={nmArea}
                onChange={(e) => setNmArea(e.target.value)}
                className="h-7 rounded-lg border border-line px-2 text-[12px] bg-paper text-ink outline-none focus:border-navy-deep"
              />
              <input
                placeholder="Planta"
                value={nmPlanta}
                onChange={(e) => setNmPlanta(e.target.value)}
                className="h-7 rounded-lg border border-line px-2 text-[12px] bg-paper text-ink outline-none focus:border-navy-deep"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!nmNombre || !nmCodigo || !nmArea || !nmPlanta) return
                  void handleCreateMachine({ nombre_equipo: nmNombre, cod_universal: nmCodigo, nombre_area: nmArea, planta_area: nmPlanta })
                }}
                disabled={crearMaquina.isPending}
                className="h-7 px-3 rounded-lg bg-navy-deep text-white text-[12px] font-medium hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {crearMaquina.isPending ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => setShowNewMachineForm(false)}
                className="h-7 px-3 rounded-lg border border-line text-ink-soft text-[12px] font-medium hover:cursor-pointer transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="grid lg:grid-cols-[340px_minmax(0,1fr)] gap-4.5 items-start">
        <section aria-label="Activos a evaluar" className="panel">
          <h2 className="h2title text-2xl text-center">Activos</h2>
          {isLoading && <p className="text-ink-soft italic">Cargando equipos…</p>}
          {isError && (
            <p className="text-red text-[13px]">
              Error al cargar: {error instanceof Error ? error.message : 'desconocido'}
              {!import.meta.env.VITE_SUPABASE_URL && (
                <span> — completá .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.</span>
              )}
            </p>
          )}
          <div>
            {activos.map((a, i) => {
              const maquinasIds = activoMaquinas
                .filter((am) => am.activo_id === a.id)
                .map((am) => am.maquina_id)
              const maquinasVinculadas = todasMaquinas.filter((m) => maquinasIds.includes(m.id))

              return (
                <AssetForm
                  key={a.id}
                  activo={a}
                  index={i}
                  editable={editable}
                  maquinasDisponibles={todasMaquinas}
                  maquinasVinculadas={maquinasVinculadas}
                  onRemove={handleRemove}
                  onVerify={handleVerify}
                  onLinkMachine={handleLinkMachine}
                  onUnlinkMachine={handleUnlinkMachine}
                  onUpdate={(p) => void handleUpdate(a.id, p)}
                />
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => void handleAdd()}
            disabled={crear.isPending}
            className="w-full h-10 rounded-3xl border border-navy-deep text-navy-deep text-[13.5px] font-medium hover:cursor-pointer hover:bg-navy-deep hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
          >
            {crear.isPending ? 'Agregando…' : 'Agregar activo'}
          </button>
        </section>

        <section aria-label="Matriz de criticidad" className="panel">
          <h2 className="h2title text-2xl text-center">Matriz</h2>
          {!isLoading && <Matrix activos={activos} />}
          <div className="mt-6 pt-5 border-t border-dashed border-line">
            <div className="font-mono text-[11px] tracking-[.1em] uppercase text-coral mb-2">Cómo leerla</div>
            <p className="text-[13.5px] text-ink-soft leading-relaxed mb-2">
              El eje horizontal indica qué tan seguido falla el activo. El eje vertical, qué tan grave
              es cuando falla. La estrategia no depende de un solo eje: un equipo que falla seguido pero
              sin consecuencia grave no necesita el mismo tratamiento que uno que casi nunca falla pero
              que, si lo hace, detiene toda la planta.
            </p>
            <p className="text-[13.5px] text-ink-soft leading-relaxed">
              Los umbrales de esta matriz (Frecuencia × Impacto) son un punto de partida orientativo.
              Cada planta debería ajustar sus propios criterios de criticidad según su contexto,
              normativa y tolerancia al riesgo.
            </p>
          </div>
        </section>
      </div>

      <section className="panel">
        <h2 className="h2title text-lg text-center">Distribución de Criticidad</h2>
        {!isLoading && <CriticityPieChart activos={activos} />}
      </section>

      <section className="panel">
        <h2 className="h2title text-lg">Estrategia sugerida por activo</h2>
        {!isLoading && <ResultsTable activos={activos} />}
      </section>

      {showMachineManager && (
        <MachineManager
          maquinas={todasMaquinas}
          activoMaquinas={activoMaquinas}
          onUpdate={handleUpdateMachine}
          onDelete={handleDeleteMachine}
          onClose={() => setShowMachineManager(false)}
          isPending={actualizarMaquina.isPending || eliminarMaquina.isPending}
        />
      )}
      </div>
    </>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold text-navy-deep mb-4">404</h1>
        <p className="text-ink-soft mb-6">Esta página no existe.</p>
        <a href="/" className="px-4 py-2 rounded-lg bg-teal text-white font-medium hover:opacity-90 transition-opacity">
          Volver al inicio
        </a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={qc}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppInner />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toast />
      </QueryClientProvider>
    </BrowserRouter>
  )
}
