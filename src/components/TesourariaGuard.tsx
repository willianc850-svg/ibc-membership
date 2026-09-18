'use client'

import { usePermissao } from '@/lib/hooks/usePermissao'

export default function TesourariaGuard({ children }: { children: React.ReactNode }) {
  const { podeTesouraria, carregando } = usePermissao()

  if (carregando) {
    return <div data-cy="loadingPermissao" className="py-24 text-center text-gray-400 text-sm">Carregando...</div>
  }

  if (!podeTesouraria) {
    return (
      <div data-cy="msgAcessoRestrito" className="max-w-lg mx-auto bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">Acesso restrito</h1>
        <p className="text-sm text-gray-500">
          A tesouraria é visível apenas para Super Admin e Tesoureiro.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
