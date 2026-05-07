'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { UsersRound, Plus, Users, Pencil, Trash2, Clock, MapPin } from 'lucide-react'

type Pgm = {
  id: string
  nome: string
  bairro: string | null
  dia_semana: string | null
  horario: string | null
  lider_id: string | null
  lider_nome?: string
  total_membros?: number
}

const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export default function PgmsPage() {
  const [pgms, setPgms] = useState<Pgm[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState<Pgm | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({
    nome: '', bairro: '', dia_semana: '', horario: '', lider_id: '',
  })
  const [membros, setMembros] = useState<{ id: string; nome_completo: string }[]>([])
  const supabase = createClient()

  useEffect(() => { carregar(); carregarMembros() }, [])

  async function carregar() {
    setCarregando(true)

    const { data: pgmData } = await supabase
      .from('pgm')
      .select('*')
      .order('nome')

    if (!pgmData) { setCarregando(false); return }

    const { data: vinculos } = await supabase
      .from('membros_pgm')
      .select('pgm_id')

    const { data: lideres } = await supabase
      .from('membros')
      .select('id, nome_completo')

    const contagem: Record<string, number> = {}
    vinculos?.forEach(v => {
      contagem[v.pgm_id] = (contagem[v.pgm_id] ?? 0) + 1
    })

    const liderMap: Record<string, string> = {}
    lideres?.forEach(l => { liderMap[l.id] = l.nome_completo })

    setPgms(pgmData.map(p => ({
      ...p,
      total_membros: contagem[p.id] ?? 0,
      lider_nome: p.lider_id ? liderMap[p.lider_id] : undefined,
    })))
    setCarregando(false)
  }

  async function carregarMembros() {
    const { data } = await supabase
      .from('membros')
      .select('id, nome_completo')
      .order('nome_completo')
    setMembros(data ?? [])
  }

  function setF(campo: string, valor: string) {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  function abrirNovo() {
    setEditando(null)
    setForm({ nome: '', bairro: '', dia_semana: '', horario: '', lider_id: '' })
    setMostrarForm(true)
  }

  function abrirEdicao(p: Pgm) {
    setEditando(p)
    setForm({
      nome: p.nome,
      bairro: p.bairro ?? '',
      dia_semana: p.dia_semana ?? '',
      horario: p.horario ?? '',
      lider_id: p.lider_id ?? '',
    })
    setMostrarForm(true)
  }

  async function salvar() {
    if (!form.nome.trim()) return
    setSalvando(true)

    const payload = {
      nome: form.nome,
      bairro: form.bairro || null,
      dia_semana: form.dia_semana || null,
      horario: form.horario || null,
      lider_id: form.lider_id || null,
    }

    if (editando) {
      await supabase.from('pgm').update(payload).eq('id', editando.id)
    } else {
      await supabase.from('pgm').insert(payload)
    }

    setSalvando(false)
    setMostrarForm(false)
    setEditando(null)
    carregar()
  }

  function cancelar() {
    setMostrarForm(false)
    setEditando(null)
  }

  async function deletar(id: string) {
    if (!confirm('Excluir este PGM? Os vínculos com membros também serão removidos.')) return
    await supabase.from('pgm').delete().eq('id', id)
    carregar()
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UsersRound size={24} className="text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PGMs</h1>
            <p className="text-sm text-gray-500">Pequenos Grupos Multiplicadores — {pgms.length} cadastrados</p>
          </div>
        </div>
        {!mostrarForm && (
          <button
            onClick={abrirNovo}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} /> Novo PGM
          </button>
        )}
      </div>

      {/* Formulário */}
      {mostrarForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            {editando ? 'Editar PGM' : 'Novo PGM'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input className={inputClass} placeholder="Ex: PGM Bela Vista"
                value={form.nome} onChange={e => setF('nome', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
              <input className={inputClass} placeholder="Bairro onde se reúne"
                value={form.bairro} onChange={e => setF('bairro', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Líder</label>
              <select className={inputClass} value={form.lider_id}
                onChange={e => setF('lider_id', e.target.value)}>
                <option value="">Selecione o líder</option>
                {membros.map(m => (
                  <option key={m.id} value={m.id}>{m.nome_completo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dia da semana</label>
              <select className={inputClass} value={form.dia_semana}
                onChange={e => setF('dia_semana', e.target.value)}>
                <option value="">Selecione</option>
                {diasSemana.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
              <input type="time" className={inputClass} value={form.horario}
                onChange={e => setF('horario', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={salvar} disabled={salvando || !form.nome.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar PGM'}
            </button>
            <button onClick={cancelar}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {carregando ? (
        <div className="flex items-center justify-center py-16 text-gray-400">Carregando...</div>
      ) : pgms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <UsersRound size={40} className="mb-3 opacity-30" />
          <p className="font-medium">Nenhum PGM cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pgms.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{p.nome}</h3>
                  {p.lider_nome && (
                    <p className="text-sm text-gray-500 mt-0.5">Líder: {p.lider_nome}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <button onClick={() => abrirEdicao(p)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deletar(p.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {p.bairro && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                    <MapPin size={11} /> {p.bairro}
                  </span>
                )}
                {p.dia_semana && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                    <Clock size={11} /> {p.dia_semana}{p.horario ? ` às ${p.horario}` : ''}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Users size={14} />
                  {p.total_membros} {p.total_membros === 1 ? 'membro' : 'membros'}
                </span>
                <Link href={`/pgm/${p.id}`}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
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