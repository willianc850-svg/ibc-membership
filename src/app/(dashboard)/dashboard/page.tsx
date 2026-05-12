'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, Legend
} from 'recharts'
import {
  Users, UserCheck, UserMinus, Eye,
  UsersRound, HandHeart, TrendingUp
} from 'lucide-react'

type Membro = {
  data_nascimento: string | null
  genero: string | null
  escolaridade: string | null
  bairro: string | null
  status_membresia: string
  data_admissao: string | null
}

const CORES = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']

function calcularIdade(dataNasc: string) {
  const hoje = new Date()
  const nasc = new Date(dataNasc)
  return hoje.getFullYear() - nasc.getFullYear()
}

function faixaEtaria(idade: number) {
  if (idade < 13) return 'Infantil (0-12)'
  if (idade < 18) return 'Adolescente (13-17)'
  if (idade < 30) return 'Jovem (18-29)'
  if (idade < 45) return 'Adulto (30-44)'
  if (idade < 60) return 'Adulto (45-59)'
  return 'Melhor idade (60+)'
}

function CardResumo({ icone: Icone, label, valor, cor }: {
  icone: React.ElementType
  label: string
  valor: number
  cor: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${cor}`}>
        <Icone size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{valor}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

function Grafico({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h3 className="font-semibold text-gray-900 mb-4">{titulo}</h3>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const [membros, setMembros] = useState<Membro[]>([])
  const [totalCelulas, setTotalCelulas] = useState(0)
  const [totalMinisterios, setTotalMinisterios] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const supabase = createClient()

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const [{ data: mems }, { count: cells }, { count: mins }] = await Promise.all([
      supabase.from('membros').select(
        'data_nascimento, genero, escolaridade, bairro, status_membresia, data_admissao'
      ),
      supabase.from('celulas').select('*', { count: 'exact', head: true }),
      supabase.from('ministerios').select('*', { count: 'exact', head: true }),
    ])
    setMembros(mems ?? [])
    setTotalCelulas(cells ?? 0)
    setTotalMinisterios(mins ?? 0)
    setCarregando(false)
  }

  // --- Cálculos ---
  const total = membros.length
  const ativos = membros.filter(m => m.status_membresia === 'Membro Ativo').length
  const visitantes = membros.filter(m => m.status_membresia === 'Visitante').length
  const afastados = membros.filter(m => m.status_membresia === 'Afastado').length

  // Status
  const dadosStatus = ['Membro Ativo', 'Visitante', 'Congregado', 'Afastado', 'Transferido']
    .map(s => ({ name: s, value: membros.filter(m => m.status_membresia === s).length }))
    .filter(d => d.value > 0)

  // Gênero
  const dadosGenero = ['Masculino', 'Feminino', 'Outro']
    .map(g => ({ name: g, value: membros.filter(m => m.genero === g).length }))
    .filter(d => d.value > 0)

  // Faixa etária
  const faixas: Record<string, number> = {}
  membros.forEach(m => {
    if (!m.data_nascimento) return
    const f = faixaEtaria(calcularIdade(m.data_nascimento))
    faixas[f] = (faixas[f] ?? 0) + 1
  })
  const ordemFaixas = ['Infantil (0-12)', 'Adolescente (13-17)', 'Jovem (18-29)', 'Adulto (30-44)', 'Adulto (45-59)', 'Melhor idade (60+)']
  const dadosFaixa = ordemFaixas
    .filter(f => faixas[f])
    .map(f => ({ name: f.split(' ')[0], fullName: f, value: faixas[f] }))

  // Escolaridade
  const escols: Record<string, number> = {}
  membros.forEach(m => {
    if (!m.escolaridade) return
    const abrev = m.escolaridade.replace('Ensino ', '').replace(' Completo', ' C.').replace(' Incompleto', ' I.')
    escols[abrev] = (escols[abrev] ?? 0) + 1
  })
  const dadosEscolaridade = Object.entries(escols)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Cidades
  const bairros: Record<string, number> = {}
  membros.forEach(m => {
    if (!m.bairro) return
    bairros[m.bairro] = (bairros[m.bairro] ?? 0) + 1
  })
  const dadosBairros = Object.entries(bairros)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  // Crescimento mensal (últimos 6 meses)
  const crescimento: Record<string, number> = {}
  const hoje = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const chave = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    crescimento[chave] = 0
  }
  membros.forEach(m => {
    if (!m.data_admissao) return
    const d = new Date(m.data_admissao)
    const chave = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    if (chave in crescimento) crescimento[chave]++
  })
  const dadosCrescimento = Object.entries(crescimento).map(([name, value]) => ({ name, value }))

  const tooltipStyle = {
    contentStyle: {
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      fontSize: '12px',
    }
  }

  if (carregando) return (
    <div className="flex items-center justify-center py-24 text-gray-400">Carregando...</div>
  )

  return (
    <div className="space-y-6">

      {/* Título */}
      <div className="flex items-center gap-3">
        <TrendingUp size={24} className="text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Visão geral da igreja</p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CardResumo icone={Users}      label="Total de membros"  valor={total}          cor="bg-indigo-500" />
        <CardResumo icone={UserCheck}  label="Membros ativos"    valor={ativos}         cor="bg-green-500"  />
        <CardResumo icone={Eye}        label="Visitantes"        valor={visitantes}     cor="bg-blue-500"   />
        <CardResumo icone={UserMinus}  label="Afastados"         valor={afastados}      cor="bg-yellow-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500">
            <UsersRound size={20} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalCelulas}</p>
            <p className="text-sm text-gray-500">PGMs ativos</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-pink-500">
            <HandHeart size={20} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalMinisterios}</p>
            <p className="text-sm text-gray-500">Ministérios</p>
          </div>
        </div>
      </div>

      {/* Gráficos linha 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <Grafico titulo="Status de membresia">
          {dadosStatus.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sem dados</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={dadosStatus} cx="50%" cy="50%" outerRadius={80}
                  dataKey="value" nameKey="name" 
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  } 
                  labelLine={false} fontSize={11}>
                  {dadosStatus.map((_, i) => (
                    <Cell key={i} fill={CORES[i % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Grafico>

        <Grafico titulo="Distribuição por gênero">
          {dadosGenero.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sem dados</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={dadosGenero} cx="50%" cy="50%" outerRadius={80}
                  dataKey="value" nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                  {dadosGenero.map((_, i) => (
                    <Cell key={i} fill={CORES[i % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Grafico>

      </div>

      {/* Gráficos linha 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <Grafico titulo="Faixa etária">
          {dadosFaixa.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sem dados de nascimento</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosFaixa} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip {...tooltipStyle}
                  formatter={(value, _, props) => [value, props.payload.fullName]} />
                <Bar dataKey="value" name="Membros" radius={[6, 6, 0, 0]}>
                  {dadosFaixa.map((_, i) => (
                    <Cell key={i} fill={CORES[i % CORES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Grafico>

        <Grafico titulo="Novos membros (últimos 6 meses)">
          {dadosCrescimento.every(d => d.value === 0) ? (
            <p className="text-sm text-gray-400 text-center py-8">Sem admissões registradas</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosCrescimento} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Admissões" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Grafico>

      </div>

      {/* Gráficos linha 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <Grafico titulo="Escolaridade">
          {dadosEscolaridade.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sem dados</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosEscolaridade} layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Membros" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Grafico>

        <Grafico titulo="Principais bairros">
          {dadosBairros.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sem dados de bairro</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosBairros} layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Membros" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Grafico>

      </div>

    </div>
  )
}