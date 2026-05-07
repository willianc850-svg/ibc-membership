'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, HandHeart, UserPlus, Trash2, Search } from 'lucide-react'

type Membro = {
  id: string
  nome_completo: string
  telefone: string | null
  foto_url: string | null
  funcao: string | null
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
}

export default function MinisterioDetalhesPage() {
  const { id } = useParams()
  const [ministerio, setMinisterio] = useState<Ministerio | null>(null)
  const [membros, setMembros] = useState<Membro[]>([])
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState<MembroBusca[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mostrarBusca, setMostrarBusca] = useState(false)
  const supabase = createClient()

  useEffect(() => { carregar() }, [id])

  async function carregar() {
    setCarregando(true)

    const { data: min } = await supabase
      .from('ministerios').select('*').eq('id', id).single()
    setMinisterio(min)

    const { data: vinculos } = await supabase
      .from('membros_ministerios')
      .select('funcao, membros(id, nome_completo, telefone, foto_url)')
      .eq('ministerio_id', id)

    const lista: Membro[] = (vinculos ?? []).map((v: any) => ({
      ...v.membros,
      funcao: v.funcao,
    }))
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

  async function vincular(membro: MembroBusca) {
    await supabase.from('membros_ministerios').insert({
      membro_id: membro.id,
      ministerio_id: id,
      funcao: null,
    })
    setBusca('')
    setResultados([])
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
    carregar()
  }

  function iniciais(nome: string) {
    return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }

  if (carregando) return (
    <div className="flex items-center justify-center py-24 text-gray-400">Carregando...</div>
  )

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
          onClick={() => setMostrarBusca(!mostrarBusca)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <UserPlus size={16} /> Adicionar
        </button>
      </div>

      {/* Busca para adicionar membro */}
      {mostrarBusca && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Buscar membro para adicionar</p>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Digite o nome do membro..."
              value={busca}
              onChange={e => buscarMembros(e.target.value)}
              autoFocus
            />
          </div>
          {resultados.length > 0 && (
            <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
              {resultados.map(m => (
                <button
                  key={m.id}
                  onClick={() => vincular(m)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-indigo-50 transition-colors text-left border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm text-gray-900">{m.nome_completo}</span>
                  <span className="text-xs text-gray-400">{m.status_membresia}</span>
                </button>
              ))}
            </div>
          )}
          {busca.length >= 2 && resultados.length === 0 && (
            <p className="text-sm text-gray-400 mt-2 text-center">Nenhum membro encontrado</p>
          )}
        </div>
      )}

      {/* Lista de membros */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">
            {membros.length} {membros.length === 1 ? 'membro' : 'membros'}
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
              <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                {m.foto_url ? (
                  <img src={m.foto_url} alt={m.nome_completo}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {iniciais(m.nome_completo)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{m.nome_completo}</p>
                  <p className="text-xs text-gray-400">{m.funcao ?? 'Sem função definida'}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/membros/${m.id}`}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    Ver perfil
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