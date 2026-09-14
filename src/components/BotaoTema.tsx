'use client'

import { Moon, Sun } from 'lucide-react'
import { useTema } from '@/lib/hooks/useTema'

export default function BotaoTema({ compacto = false }: { compacto?: boolean }) {
  const { alternar } = useTema()

  return (
    <button
      type="button"
      onClick={alternar}
      className={
        compacto
          ? 'inline-flex items-center justify-center min-h-11 min-w-11 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors'
          : 'flex items-center gap-3 px-3 min-h-11 w-full rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors'
      }
      aria-label="Alternar tema claro e escuro"
    >
      <Moon size={18} className="dark:hidden" />
      <Sun size={18} className="hidden dark:block" />
      {!compacto && (
        <>
          <span className="dark:hidden">Modo escuro</span>
          <span className="hidden dark:inline">Modo claro</span>
        </>
      )}
    </button>
  )
}
