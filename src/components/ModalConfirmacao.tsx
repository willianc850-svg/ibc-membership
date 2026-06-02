'use client'

type Props = {
  aberto: boolean
  titulo: string
  mensagem: string
  textoBotaoPrimario: string
  textoBotaoSecundario?: string
  carregando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
  perigo?: boolean
}

export default function ModalConfirmacao({
  aberto,
  titulo,
  mensagem,
  textoBotaoPrimario,
  textoBotaoSecundario = 'Cancelar',
  carregando = false,
  onConfirmar,
  onCancelar,
  perigo = false,
}: Props) {
  if (!aberto) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
        <h2 className="text-lg font-bold text-gray-900 mb-2">{titulo}</h2>
        <p className="text-sm text-gray-600 mb-6">{mensagem}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            disabled={carregando}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {textoBotaoSecundario}
          </button>
          <button
            onClick={onConfirmar}
            disabled={carregando}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${
              perigo
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {carregando ? 'Processando...' : textoBotaoPrimario}
          </button>
        </div>
      </div>
    </div>
  )
}