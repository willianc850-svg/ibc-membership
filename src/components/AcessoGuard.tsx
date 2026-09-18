'use client'

export default function AcessoGuard({
  permitido,
  carregando = false,
  mensagem,
  children,
}: {
  permitido: boolean
  carregando?: boolean
  mensagem: string
  children: React.ReactNode
}) {
  if (carregando) {
    return <div data-cy="loadingPermissao" className="py-24 text-center text-gray-400 text-sm">Carregando...</div>
  }

  if (!permitido) {
    return (
      <div data-cy="msgAcessoRestrito" className="max-w-lg mx-auto bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">Acesso restrito</h1>
        <p className="text-sm text-gray-500">{mensagem}</p>
      </div>
    )
  }

  return <>{children}</>
}
