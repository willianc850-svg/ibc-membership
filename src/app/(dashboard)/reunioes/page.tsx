'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { CalendarDays, Plus, FileText, Users, Clock } from 'lucide-react'

type Reuniao = {
  id: string
  titulo: string
  tipo: string
  data_reuniao: string
  horario: string | null
  local: string | null
  status: string
  ministerio_id: string | null
  ministerios?: { nome: string } | null
  total_participantes?: number
}

const tipoCor: Record<string, string> = {
  'Ministério':  'bg-indigo-100 text-indigo-700',
  'Diretoria':   'bg-purple-100 text-purple-700',
  'Assembleia':  'bg-amber-100 text-amber-700',
  'Outra':       'bg-gray-100 text-gray-600',
}

const statusCor: Record<string, string> = {
  'rascunho':   'bg-yellow-100 text-yellow-700',
  'finalizada': 'bg-green-100 text-green-700',
}

export default function ReunioesPage() {
  const [reunioes, setReunioes] = useState<Reuniao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const supabase = createClient()

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)

    const { data } = await supabase
      .from('reunioes')
      .select('*, ministerios(nome)')
      .order('data_reuniao', { ascending: false })

    const { data: parts } = await supabase
      .from('reuniao_participantes')
      .select('reuniao_id')

    const contagem: Record<string, number> = {}
    parts?.forEach(p => {
      contagem[p.reuniao_id] = (contagem[p.reuniao_id] ?? 0) + 1
    })

    setReunioes((data ?? []).map(r => ({
      ...r,
      total_participantes: contagem[r.id] ?? 0,
    })))
    setCarregando(false)
  }

  const filtradas = reunioes.filter(r => {
  if (filtroTipo !== 'todos' && r.tipo !== filtroTipo) return false
  if (dataInicio && r.data_reuniao < dataInicio) return false
  if (dataFim && r.data_reuniao > dataFim) return false
  return true
})

  function formatarData(data: string) {
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarDays size={24} className="text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reuniões</h1>
            <p className="text-sm text-gray-500">{reunioes.length} registradas</p>
          </div>
        </div>
        <Link href="/reunioes/nova"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> Nova reunião
        </Link>
      </div>

      {/* Filtros */}
        <div className="mb-6 space-y-4">
        {/* Categorias */}
        <div className="flex flex-wrap gap-2">
            {['todos', 'Ministério', 'Diretoria', 'Assembleia', 'Outra'].map(tipo => (
            <button 
                key={tipo} 
                onClick={() => setFiltroTipo(tipo)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filtroTipo === tipo
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
                {tipo === 'todos' ? 'Todas' : tipo}
            </button>
            ))}
        </div>

  {/* Datas */}
  <div className="flex flex-wrap items-center gap-3">
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-500 whitespace-nowrap">De:</label>
      <input
        type="date"
        value={dataInicio}
        onChange={e => setDataInicio(e.target.value)}
        className="border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-500 whitespace-nowrap">Até:</label>
      <input
        type="date"
        value={dataFim}
        onChange={e => setDataFim(e.target.value)}
        className="border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
    {(dataInicio || dataFim) && (
      <button
        onClick={() => { setDataInicio(''); setDataFim('') }}
        className="text-sm text-red-500 hover:text-red-700 font-medium"
      >
        Limpar datas
      </button>
    )}
  </div>
</div>

      {carregando ? (
        <div className="flex items-center justify-center py-16 text-gray-400">Carregando...</div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <CalendarDays size={40} className="mb-3 opacity-30" />
          <p className="font-medium">Nenhuma reunião encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map(r => (
            <Link key={r.id} href={`/reunioes/${r.id}`}
              className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tipoCor[r.tipo]}`}>
                      {r.tipo}
                    </span>
                    {r.ministerios?.nome && (
                      <span className="text-xs text-gray-500">— {r.ministerios.nome}</span>
                    )}
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusCor[r.status]}`}>
                      {r.status === 'rascunho' ? 'Rascunho' : 'Finalizada'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-base">{r.titulo}</h3>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <CalendarDays size={14} />
                      {formatarData(r.data_reuniao)}
                    </span>
                    {r.horario && (
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Clock size={14} />
                        {r.horario}
                      </span>
                    )}
                    {r.local && (
                      <span className="text-sm text-gray-500">📍 {r.local}</span>
                    )}
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Users size={14} />
                      {r.total_participantes} participante(s)
                    </span>
                  </div>
                </div>
                <FileText size={20} className="text-gray-300 flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}