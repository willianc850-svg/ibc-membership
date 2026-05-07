'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, HandHeart, UserPlus, Trash2,
  Search, Crown, X, Plus,
} from 'lucide-react'

type Membro = {
  id: string
  nome_completo: string
  telefone: string | null
  foto_url: string | null
  funcao: string | null
  is_lider: boolean
}

type MembroBusca = {
  id: string
  nome_completo: string
  status_membresia: string
}

type Ministerio = {
  id: string
  nome: string
  descricao: string | null
  lider_id: string | null
}

const coresFuncao = [
  'bg-indigo-100 text-indigo-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-blue-100 text-blue-700',
  'bg-teal-100 text-teal-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-orange-100 text-orange-700',
]

function corDaFuncao(funcao: string) {
  let hash = 0
  for (let i = 0; i < funcao.length; i++) hash += funcao.charCodeAt(i)
  return coresFuncao[hash % coresFuncao.length]
}

export default function MinisterioDetalhesPage() {
  const { id } = useParams()
  const [ministerio, setMinisterio] = useState<Ministerio | null>(null)
  const [membros, setMembros] = useState<Membro[]>([])
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState<MembroBusca[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mostrarBusca, setMostrarBusca] = useState(false)
  const [novaFuncao, setNovaFuncao] = useState('')
  const [membroSelecionado, setMembroSelecionado] = useState<MembroBusca | null>(null)
  const [editandoFuncao, setEditandoFuncao] = useState<string | null>(null)
  const [funcaoEditada, setFuncaoEditada] = useState('')
  const supabase = createClient()

  useEffect(() => { carregar() }, [id])

  async function carregar() {
    setCarregando(true)

    const { data: min } = await supabase
      .from('ministerios').select('*').eq('id', id).single()
    setMinisterio(min)

    const { data: vinculos } = await supabase
      .from('membros_ministerios')
      .select('funcao, membro_id, membros(id, nome_completo, telefone, foto_url)')
      .eq('ministerio_id', id)

    const lista: Membro[] = (vinculos ?? []).map((v: any) => ({
      ...v.membros,
      funcao: v.funcao,
      is_lider: v.membros.id === min?.lider_id,
    }))

    // Líder sempre primeiro
    lista.sort((a, b) => (b.is_lider ? 1 : 0) - (a.is_lider ? 1 : 0))
    setMembros(lista)
    setCarregando(false)
  }

  async function buscarMembros(termo: string) {
    setBusca(termo)
    if (termo.length < 2) { setResultados([]); return }
    const idsVinculados = membros.map(m => m.id)
    const { data } = await supabase
      .from('membros')
      .select('id, nome_completo, status_membresia')
      .ilike('nome_completo', `%${termo}%`)
      .limit(8)
    setResultados((data ?? []).filter(m => !idsVinculados.includes(m.id)))
  }

  function selecionarMembro(m: MembroBusca) {
    setMembroSelecionado(m)
    setResultados([])
    setBusca(m.nome_completo)
  }

  async function vincular() {
    if (!membroSelecionado) return
    await supabase.from('membros_ministerios').insert({
      membro_id: membroSelecionado.id,
      ministerio_id: id,
      funcao: novaFuncao.trim() || null,
    })
    setBusca('')
    setNovaFuncao('')
    setMembroSelecionado(null)
    setMostrarBusca(false)
    carregar()
  }

  async function desvincular(membroId: string) {
    if (!confirm('Remover este membro do ministério?')) return
    await supabase
      .from('membros_ministerios')
      .delete()
      .eq('membro_id', membroId)
      .eq('ministerio_id', id)
    if (ministerio?.lider_id === membroId) {
      await supabase.from('ministerios').update({ lider_id: null }).eq('id', id)
    }
    carregar()
  }

  async function definirLider(membroId: string) {
    const novoLider = ministerio?.lider_id === membroId ? null : membroId
    await supabase.from('ministerios').update({ lider_id: novoLider }).eq('id', id)
    carregar()
  }

  async function salvarFuncao(membroId: string) {
    await supabase
      .from('membros_ministerios')
      .update({ funcao: funcaoEditada.trim() || null })
      .eq('membro_id', membroId)
      .eq('ministerio_id', id)
    setEditandoFuncao(null)
    setFuncaoEditada('')
    carregar()
  }

  function iniciais(nome: string) {
    return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }

  if (carregando) return (
    <div className="flex items-center justify-center py-24 text-gray-400">Carregando...</div>
  )

  const lider = membros.find(m => m.is_lider)

  return (
    <div className="max-w-3xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/ministerios" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <HandHeart size={20} className="text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">{ministerio?.nome}</h1>
          </div>
          {ministerio?.descricao && (
            <p className="text-sm text-gray-500 mt-0.5">{ministerio.descricao}</p>
          )}
        </div>
        <button
          onClick={() => { setMostrarBusca(!mostrarBusca); setBusca(''); setMembroSelecionado(null); setNovaFuncao('') }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <UserPlus size={16} /> Adicionar
        </button>
      </div>

      {/* Card do líder */}
      {lider && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <div className="relative">
            {lider.foto_url ? (
              <img src={lider.foto_url} alt={lider.nome_completo}
                className="w-11 h-11 rounded-full object-cover" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-sm font-bold">
                {iniciais(lider.nome_completo)}
              </div>
            )}
            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
              <Crown size={10} className="text-yellow-900" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-indigo-600 mb-0.5">Líder do ministério</p>
            <p className="text-sm font-semibold text-indigo-900">{lider.nome_completo}</p>
            {lider.funcao && (
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${corDaFuncao(lider.funcao)}`}>
                {lider.funcao}
              </span>
            )}
          </div>
          <Link href={`/membros/${lider.id}`}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex-shrink-0">
            Ver perfil
          </Link>
        </div>
      )}

      {/* Formulário de adição */}
      {mostrarBusca && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 space-y-3">
          <p className="text-sm font-medium text-gray-700">Adicionar membro ao ministério</p>

          {/* Busca */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Buscar membro</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Digite o nome..."
                value={busca}
                onChange={e => { buscarMembros(e.target.value); setMembroSelecionado(null) }}
                autoFocus
              />
              {membroSelecionado && (
                <button onClick={() => { setBusca(''); setMembroSelecionado(null) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            {resultados.length > 0 && (
              <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden">
                {resultados.map(m => (
                  <button key={m.id} onClick={() => selecionarMembro(m)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-indigo-50 transition-colors text-left border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-900">{m.nome_completo}</span>
                    <span className="text-xs text-gray-400">{m.status_membresia}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Função */}
          {membroSelecionado && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Função no ministério <span className="text-gray-400">(opcional)</span>
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Cantor, Baterista, Professor..."
                value={novaFuncao}
                onChange={e => setNovaFuncao(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') vincular() }}
              />
              {novaFuncao && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Prévia:</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${corDaFuncao(novaFuncao)}`}>
                    {novaFuncao}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={vincular}
              disabled={!membroSelecionado}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={14} /> Adicionar
            </button>
            <button
              onClick={() => { setMostrarBusca(false); setBusca(''); setMembroSelecionado(null); setNovaFuncao('') }}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de membros */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {membros.length} {membros.length === 1 ? 'membro' : 'membros'}
          </span>
          <span className="text-xs text-gray-400">
            Clique em ★ para definir o líder
          </span>
        </div>

        {membros.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <HandHeart size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Nenhum membro neste ministério</p>
            <p className="text-sm mt-1">Clique em "Adicionar" para vincular membros</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {membros.map(m => (
              <div key={m.id} className={`flex items-center gap-3 px-5 py-3 ${m.is_lider ? 'bg-indigo-50/50' : ''}`}>
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {m.foto_url ? (
                    <img src={m.foto_url} alt={m.nome_completo}
                      className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      {iniciais(m.nome_completo)}
                    </div>
                  )}
                  {m.is_lider && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                      <Crown size={9} className="text-yellow-900" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{m.nome_completo}</p>

                  {/* Função — exibição ou edição */}
                  {editandoFuncao === m.id ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        autoFocus
                        className="border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36"
                        value={funcaoEditada}
                        onChange={e => setFuncaoEditada(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') salvarFuncao(m.id)
                          if (e.key === 'Escape') { setEditandoFuncao(null); setFuncaoEditada('') }
                        }}
                        placeholder="Ex: Cantor..."
                      />
                      <button onClick={() => salvarFuncao(m.id)}
                        className="text-xs text-indigo-600 font-medium hover:text-indigo-800">
                        Salvar
                      </button>
                      <button onClick={() => { setEditandoFuncao(null); setFuncaoEditada('') }}
                        className="text-xs text-gray-400 hover:text-gray-600">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditandoFuncao(m.id); setFuncaoEditada(m.funcao ?? '') }}
                      className="flex items-center gap-1.5 mt-1 group"
                    >
                      {m.funcao ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${corDaFuncao(m.funcao)}`}>
                          {m.funcao}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300 group-hover:text-indigo-400 transition-colors">
                          + adicionar função
                        </span>
                      )}
                    </button>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Botão líder */}
                  <button
                    onClick={() => definirLider(m.id)}
                    title={m.is_lider ? 'Remover como líder' : 'Definir como líder'}
                    className={`p-1.5 rounded-lg transition-colors text-sm ${
                      m.is_lider
                        ? 'text-yellow-500 hover:bg-yellow-50'
                        : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'
                    }`}
                  >
                    ★
                  </button>
                  <Link href={`/membros/${m.id}`}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-1">
                    Ver
                  </Link>
                  <button onClick={() => desvincular(m.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}