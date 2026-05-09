'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Save, Search, X } from 'lucide-react'

type Membro = { id: string; nome_completo: string; status_membresia: string }
type Ministerio = { id: string; nome: string }

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

export default function NovaReuniaoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    titulo: '',
    tipo: 'Diretoria',
    ministerio_id: '',
    data_reuniao: '',
    horario: '',
    local: '',
    pauta: '',
  })
  const [ministerios, setMinisterios] = useState<Ministerio[]>([])
  const [participantes, setParticipantes] = useState<Membro[]>([])
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState<Membro[]>([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    supabase.from('ministerios').select('id, nome').order('nome')
      .then(({ data }) => setMinisterios(data ?? []))
  }, [])

  function set(campo: string, valor: string) {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  async function buscarMembros(termo: string) {
    setBusca(termo)
    if (termo.length < 2) { setResultados([]); return }
    const idsAdicionados = participantes.map(p => p.id)
    const { data } = await supabase
      .from('membros')
      .select('id, nome_completo, status_membresia')
      .ilike('nome_completo', `%${termo}%`)
      .limit(8)
    setResultados((data ?? []).filter(m => !idsAdicionados.includes(m.id)))
  }

  function adicionarParticipante(m: Membro) {
    setParticipantes(prev => [...prev, m])
    setBusca('')
    setResultados([])
  }

  function removerParticipante(id: string) {
    setParticipantes(prev => prev.filter(p => p.id !== id))
  }

  async function salvar() {
    if (!form.titulo.trim() || !form.data_reuniao) {
      setErro('Título e data são obrigatórios.')
      return
    }
    setSalvando(true)
    setErro('')

    const { data: { user } } = await supabase.auth.getUser()

    const { data: reuniao, error } = await supabase
      .from('reunioes')
      .insert({
        titulo: form.titulo,
        tipo: form.tipo,
        ministerio_id: form.ministerio_id || null,
        data_reuniao: form.data_reuniao,
        horario: form.horario || null,
        local: form.local || null,
        pauta: form.pauta || null,
        created_by: user?.id,
      })
      .select()
      .single()

    if (error || !reuniao) {
      setErro('Erro ao salvar a reunião.')
      setSalvando(false)
      return
    }

    if (participantes.length > 0) {
      await supabase.from('reuniao_participantes').insert(
        participantes.map(p => ({
          reuniao_id: reuniao.id,
          membro_id: p.id,
          presente: true,
        }))
      )
    }

    router.push(`/reunioes/${reuniao.id}`)
  }

  const statusPermitidos = ['Pastor', 'Diretoria', 'Líder de Ministério']

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/reunioes" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Reunião</h1>
          <p className="text-sm text-gray-500">Registre os dados da reunião</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Dados básicos */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Dados da reunião</h2>

          <Campo label="Título *">
            <input className={inputClass} placeholder="Ex: Reunião de Diretoria — Janeiro 2025"
              value={form.titulo} onChange={e => set('titulo', e.target.value)} />
          </Campo>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Tipo *">
              <select className={inputClass} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                <option>Diretoria</option>
                <option>Ministério</option>
                <option>Assembleia</option>
                <option>Outra</option>
              </select>
            </Campo>

            {form.tipo === 'Ministério' && (
              <Campo label="Ministério">
                <select className={inputClass} value={form.ministerio_id}
                  onChange={e => set('ministerio_id', e.target.value)}>
                  <option value="">Selecione</option>
                  {ministerios.map(m => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </Campo>
            )}

            <Campo label="Data *">
              <input type="date" className={inputClass} value={form.data_reuniao}
                onChange={e => set('data_reuniao', e.target.value)} />
            </Campo>

            <Campo label="Horário">
              <input type="time" className={inputClass} value={form.horario}
                onChange={e => set('horario', e.target.value)} />
            </Campo>

            <div className="sm:col-span-2">
              <Campo label="Local">
                <input className={inputClass} placeholder="Ex: Sala de reuniões, Templo principal..."
                  value={form.local} onChange={e => set('local', e.target.value)} />
              </Campo>
            </div>

            <div className="sm:col-span-2">
              <Campo label="Pauta / Tópicos a serem discutidos">
                <textarea className={inputClass + ' resize-none'} rows={4}
                  placeholder="Liste os tópicos que serão discutidos na reunião..."
                  value={form.pauta} onChange={e => set('pauta', e.target.value)} />
              </Campo>
            </div>
          </div>
        </div>

        {/* Participantes */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Participantes</h2>

          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Buscar membro pelo nome..."
              value={busca}
              onChange={e => buscarMembros(e.target.value)}
            />
          </div>

          {resultados.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
              {resultados.map(m => (
                <button key={m.id} onClick={() => adicionarParticipante(m)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-indigo-50 transition-colors text-left border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-900">{m.nome_completo}</span>
                  <span className="text-xs text-gray-400">{m.status_membresia}</span>
                </button>
              ))}
            </div>
          )}

          {participantes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Nenhum participante adicionado ainda
            </p>
          ) : (
            <div className="space-y-2">
              {participantes.map(p => {
                const podeConfirmar = statusPermitidos.includes(p.status_membresia)
                return (
                  <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.nome_completo}</p>
                      <p className="text-xs text-gray-400">{p.status_membresia}
                        {podeConfirmar && <span className="ml-2 text-indigo-500">· poderá confirmar presença</span>}
                      </p>
                    </div>
                    <button onClick={() => removerParticipante(p.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {erro}
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={salvar} disabled={salvando}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">
            <Save size={16} /> {salvando ? 'Salvando...' : 'Criar reunião'}
          </button>
        </div>
      </div>
    </div>
  )
}