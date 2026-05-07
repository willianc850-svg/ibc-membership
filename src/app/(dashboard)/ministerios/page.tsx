'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { HandHeart, Plus, Users, Pencil, Trash2 } from 'lucide-react'

type Ministerio = {
  id: string
  nome: string
  descricao: string | null
  total_membros?: number
}

export default function MinisteriosPage() {
  const [ministerios, setMinisterios] = useState<Ministerio[]>([])
  const [carregando, setCarregando] = useState(true)
  const [novoNome, setNovoNome] = useState('')
  const [novaDescricao, setNovaDescricao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState<Ministerio | null>(null)
  const supabase = createClient()

  useEffect(() => { carregar() }, [])

  async function carregar() {
  setCarregando(true)
  const { data: mins } = await supabase
    .from('ministerios')
    .select('id, nome, descricao, lider_id')
    .order('nome')

  if (!mins) { setCarregando(false); return }

  const { data: vinculos } = await supabase
    .from('membros_ministerios')
    .select('ministerio_id')

  const { data: lideres } = await supabase
    .from('membros')
    .select('id, nome_completo')

  const contagem: Record<string, number> = {}
  vinculos?.forEach(v => {
    contagem[v.ministerio_id] = (contagem[v.ministerio_id] ?? 0) + 1
  })

  const liderMap: Record<string, string> = {}
  lideres?.forEach(l => { liderMap[l.id] = l.nome_completo })

  setMinisterios(mins.map(m => ({
    ...m,
    total_membros: contagem[m.id] ?? 0,
    lider_nome: m.lider_id ? liderMap[m.lider_id] : undefined,
  })))
  setCarregando(false)
}

  async function salvar() {
    if (!novoNome.trim()) return
    setSalvando(true)

    if (editando) {
      await supabase
        .from('ministerios')
        .update({ nome: novoNome, descricao: novaDescricao || null })
        .eq('id', editando.id)
    } else {
      await supabase
        .from('ministerios')
        .insert({ nome: novoNome, descricao: novaDescricao || null })
    }

    setNovoNome('')
    setNovaDescricao('')
    setMostrarForm(false)
    setEditando(null)
    setSalvando(false)
    carregar()
  }

  async function deletar(id: string) {
    if (!confirm('Excluir este ministério? Os vínculos com membros também serão removidos.')) return
    await supabase.from('ministerios').delete().eq('id', id)
    carregar()
  }

  function abrirEdicao(m: Ministerio) {
    setEditando(m)
    setNovoNome(m.nome)
    setNovaDescricao(m.descricao ?? '')
    setMostrarForm(true)
  }

  function cancelar() {
    setMostrarForm(false)
    setEditando(null)
    setNovoNome('')
    setNovaDescricao('')
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <HandHeart size={24} className="text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ministérios</h1>
            <p className="text-sm text-gray-500">{ministerios.length} cadastrados</p>
          </div>
        </div>
        {!mostrarForm && (
          <button
            onClick={() => setMostrarForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} /> Novo ministério
          </button>
        )}
      </div>

      {/* Formulário */}
      {mostrarForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            {editando ? 'Editar ministério' : 'Novo ministério'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Música, Ensino..."
                value={novoNome}
                onChange={e => setNovoNome(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Descrição breve"
                value={novaDescricao}
                onChange={e => setNovaDescricao(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={salvar}
              disabled={salvando || !novoNome.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar ministério'}
            </button>
            <button
              onClick={cancelar}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {carregando ? (
        <div className="flex items-center justify-center py-16 text-gray-400">Carregando...</div>
      ) : ministerios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <HandHeart size={40} className="mb-3 opacity-30" />
          <p className="font-medium">Nenhum ministério cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ministerios.map(m => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
  <h3 className="font-semibold text-gray-900">{m.nome}</h3>
  {m.descricao && (
    <p className="text-sm text-gray-500 mt-0.5">{m.descricao}</p>
  )}
  {m.lider_nome && (
    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
      <span className="text-yellow-500 text-xs">★</span>
      {m.lider_nome}
    </p>
  )}
</div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <button
                    onClick={() => abrirEdicao(m)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deletar(m.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Users size={14} />
                  {m.total_membros} {m.total_membros === 1 ? 'membro' : 'membros'}
                </span>
                <Link
                  href={`/ministerios/${m.id}`}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Ver membros →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}