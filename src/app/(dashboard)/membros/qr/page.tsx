'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AcessoGuard from '@/components/AcessoGuard'
import { usePermissao } from '@/lib/hooks/usePermissao'
import LogoIbc from '@/components/LogoIbc'
import { ChevronLeft, Printer, QrCode } from 'lucide-react'

export default function QrCadastroPage() {
  const { isAdmin, carregando } = usePermissao()
  return (
    <AcessoGuard
      permitido={isAdmin}
      carregando={carregando}
      mensagem="Somente a diretoria pode gerar o QR de cadastro."
    >
      <QrConteudo />
    </AcessoGuard>
  )
}

function QrConteudo() {
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(`${window.location.origin}/cadastro`)
  }, [])

  const qr = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=${encodeURIComponent(url)}`
    : ''

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <Link href="/membros" className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR de cadastro</h1>
          <p className="text-sm text-gray-500">Imprima e cole na igreja. O visitante preenche no celular.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
        <div className="flex justify-center mb-4">
          <LogoIbc size={64} />
        </div>
        <p className="font-bold text-gray-900 text-lg">Igreja Batista Central</p>
        <p className="text-sm text-gray-500 mb-5">Cadastre-se na lista de membros</p>
        {qr ? (
          <img src={qr} alt="QR code para cadastro" className="mx-auto w-56 h-56" />
        ) : (
          <div className="w-56 h-56 mx-auto bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
            <QrCode size={40} />
          </div>
        )}
        <p className="text-xs text-gray-500 mt-4 break-all">{url}</p>
        <button
          type="button"
          onClick={() => window.print()}
          className="print:hidden mt-5 inline-flex items-center justify-center gap-2 min-h-11 px-4 bg-indigo-600 text-white text-sm font-medium rounded-xl"
        >
          <Printer size={16} /> Imprimir
        </button>
      </div>
    </div>
  )
}
