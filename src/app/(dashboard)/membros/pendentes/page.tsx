'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AcessoGuard from '@/components/AcessoGuard'
import { usePermissao } from '@/lib/hooks/usePermissao'
import { FichaMembroLeitura } from '@/components/FichaMembroCampos'
import { sanitizarFichaPublica, type FichaMembro } from '@/lib/ficha-membro'
import { ChevronLeft, Check, X, Loader2, ClipboardList, ChevronDown } from 'lucide-react'

type Pendente = {
  id: string
  nome_completo: string
  telefone: string | null
  email: string | null
  foto_url: string | null
  created_at: string
  dados?: unknown
}

export default function PendentesPage() {
  const { isAdmin, carregando } = usePermissao()
  return (
    <AcessoGuard
      permitido={isAdmin}
      carregando={carregando}
      mensagem="Somente a diretoria pode aprovar cadastros."
    >
      <PendentesConteudo />
    </AcessoGuard>
  )
}

function fichaDoPendente(c: Pendente): FichaMembro {
  const ficha = sanitizarFichaPublica(c.dados)
  ficha.nome_completo = c.nome_completo || ficha.nome_completo
  ficha.telefone = c.telefone || ficha.telefone
  ficha.email = c.email || ficha.email
  return ficha
}

function PendentesConteudo() {
  const [lista, setLista] = useState<Pendente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [acaoId, setAcaoId] = useState<string | null>(null)
  const [abertoId, setAbertoId] = useState<string | null>(null)
  const [erro, setErro] = useState('')

  async function carregar() {
    const res = await fetch('/api/cadastro/pendentes')
    const data = await res.json()
    if (!res.ok) setErro(data.error ?? 'Erro ao carregar.')
    else setLista(data.cadastros ?? [])
    setCarregando(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregar()
  }, [])

  async function agir(id: string, acao: 'aprovar' | 'recusar') {
    setAcaoId(id)
    setErro('')
    const res = await fetch('/api/cadastro/pendentes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, acao }),
    })
    const data = await res.json()
    setAcaoId(null)
    if (!res.ok) {
      setErro(data.error ?? 'Não foi possível concluir.')
      return
    }
    setLista((atual) => atual.filter((c) => c.id !== id))
    if (abertoId === id) setAbertoId(null)
  }

  return (
    <div data-cy="pageCadastrosPendentes">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/membros" data-cy="btnVoltarMembros" className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cadastros pendentes</h1>
          <p className="text-sm text-gray-500">Enviados pelo QR / formulário público. Abra a ficha antes de aprovar.</p>
        </div>
      </div>

      {erro && (
        <div data-cy="msgErroPendentes" className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{erro}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {carregando ? (
          <p data-cy="loadingPendentes" className="text-center text-gray-400 py-16">Carregando...</p>
        ) : lista.length === 0 ? (
          <div data-cy="vazioPendentes" className="flex flex-col items-center py-16 text-gray-400">
            <ClipboardList size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Nenhum cadastro aguardando</p>
          </div>
        ) : (
          <ul data-cy="listaPendentes" className="divide-y divide-gray-100">
            {lista.map((c) => {
              const aberto = abertoId === c.id
              return (
                <li key={c.id} data-cy={`pendenteItem-${c.id}`} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {c.foto_url ? (
                      <img src={c.foto_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        {c.nome_completo.slice(0, 1)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{c.nome_completo}</p>
                      <p className="text-sm text-gray-500">{c.telefone || 'Sem telefone'} · {c.email || 'Sem e-mail'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(c.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setAbertoId(aberto ? null : c.id)}
                        data-cy={`btnVerFicha-${c.id}`}
                        className="inline-flex items-center justify-center gap-1 min-h-11 px-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium"
                      >
                        <ChevronDown size={16} className={aberto ? 'rotate-180' : ''} />
                        {aberto ? 'Ocultar ficha' : 'Ver ficha'}
                      </button>
                      <button
                        type="button"
                        disabled={acaoId === c.id}
                        onClick={() => agir(c.id, 'aprovar')}
                        data-cy={`btnAprovarCadastro-${c.id}`}
                        className="inline-flex items-center justify-center gap-1 min-h-11 px-3 rounded-xl bg-green-600 text-white text-sm font-medium disabled:opacity-50"
                      >
                        {acaoId === c.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        Aprovar
                      </button>
                      <button
                        type="button"
                        disabled={acaoId === c.id}
                        onClick={() => agir(c.id, 'recusar')}
                        data-cy={`btnRecusarCadastro-${c.id}`}
                        className="inline-flex items-center justify-center gap-1 min-h-11 px-3 rounded-xl border border-red-200 text-red-600 text-sm font-medium disabled:opacity-50"
                      >
                        <X size={16} /> Recusar
                      </button>
                    </div>
                  </div>
                  {aberto && (
                    <div data-cy={`fichaPendente-${c.id}`} className="mt-4 pt-4 border-t border-gray-100">
                      <FichaMembroLeitura form={fichaDoPendente(c)} fotoUrl={c.foto_url} />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
