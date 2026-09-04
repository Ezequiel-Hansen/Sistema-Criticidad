import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function Toast() {
  return (
    <ToastContainer
      aria-label="Notificaciones"
      position="top-center"
      autoClose={2500}
      hideProgressBar={true}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="colored"
    />
  )
}