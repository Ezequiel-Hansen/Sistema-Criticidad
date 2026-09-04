import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { logout } from '../lib/auth'

type Props = {
  editable: boolean
  onToggle: (v: boolean) => void
}

export function EditGate({ editable, onToggle }: Props) {
  const navigate = useNavigate()

  const exit = async () => {
    try {
      await logout()
      onToggle(false)
      toast.info('Sesión cerrada')
    } catch {
      toast.error('No se pudo cerrar la sesión')
    }
  }

  if (editable) {
    return (
      <button
        type="button"
        onClick={() => void exit()}
        className="ml-auto shrink-0 px-3 py-1.5 rounded-lg text-[12.5px] font-medium border border-red/40 text-red hover:bg-red/5"
      >
        Cerrar sesión
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => navigate('/login')}
      className="ml-auto shrink-0 w-22 px-3 py-1.5 rounded-xl text-[14px] font-medium text-white bg-teal-600 hover:cursor-pointer"
    >
      Login
    </button>
  )
}
