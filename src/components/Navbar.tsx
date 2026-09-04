import { useState, useEffect, useRef, useCallback } from 'react'
import { EditGate } from './EditGate'

type Props = {
  editable: boolean
  onToggle: (v: boolean) => void
  onExport: () => void
}

export function Navbar({ editable, onToggle, onExport }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const closeMenu = useCallback(() => {
    setClosing(true)
    timerRef.current = setTimeout(() => {
      setMenuOpen(false)
      setClosing(false)
    }, 200)
  }, [])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu()
    } else {
      setMenuOpen(true)
      setClosing(false)
    }
  }

  return (
    <nav className="p-4 bg-gray-200 w-full relative">
      <div className="flex items-center gap-3">
        {/* Desktop: botones inline */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          {editable && (
            <button
              type="button"
              onClick={onExport}
              className="shrink-0 px-3 py-1.5 rounded-lg text-[12.5px] font-medium border border-[#1FA97A] text-[#1FA97A] hover:bg-[#1FA97A]/5 hover:cursor-pointer transition-colors"
            >
              Exportación en Excel
            </button>
          )}
          <EditGate editable={editable} onToggle={onToggle} />
        </div>

        {/* Mobile: hamburguesa */}
        <button
          type="button"
          onClick={toggleMenu}
          className="md:hidden shrink-0 p-1.5 rounded-lg border border-line hover:bg-off-white hover:cursor-pointer transition-colors ml-auto"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="3" y1="5" x2="17" y2="5" />
            <line x1="3" y1="10" x2="17" y2="10" />
            <line x1="3" y1="15" x2="17" y2="15" />
          </svg>
        </button>
      </div>

      {/* Full-screen mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm md:hidden"
          style={{ animation: `${closing ? 'overlay-out' : 'overlay-in'} 200ms ease forwards` }}
          onClick={closeMenu}
        >
          <div
            className="absolute inset-x-0 top-0 bg-paper border-b border-line shadow-xl"
            style={{ animation: `${closing ? 'slide-up' : 'slide-down'} 200ms ease forwards` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <span className="font-display font-semibold text-ink text-sm">Menú</span>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="p-1.5 rounded-lg hover:bg-off-white hover:cursor-pointer transition-colors"
                  aria-label="Cerrar menú"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="5" y1="5" x2="15" y2="15" />
                    <line x1="15" y1="5" x2="5" y2="15" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {editable && (
                  <button
                    type="button"
                    onClick={() => { onExport(); closeMenu() }}
                    className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium border border-[#1FA97A] text-[#1FA97A] hover:bg-[#1FA97A]/5 hover:cursor-pointer transition-colors"
                  >
                    Exportación en Excel
                  </button>
                )}
                <div onClick={closeMenu}>
                  <EditGate editable={editable} onToggle={(v) => { onToggle(v); closeMenu() }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
