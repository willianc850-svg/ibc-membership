'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, Download, Filter } from 'lucide-react'
import * as XLSX from 'xlsx'

type Membro = {
  id: string
  nome_completo: string
  data_nascimento: string | null
  genero: string | null
  escolaridade: string | null
  cidade: string | null
  bairro: string | null
  status_membresia: string
  data_admissao: string | null
  data_batismo_aguas: string | null
  profissao: string | null
  telefone: string | null
  email: string | null
  tem_filhos: boolean
  tipo_sanguineo: string | null
  tamanho_camiseta: string | null
  autorizacao_imagem: boolean
  concluiu_integracao: boolean
}

function calcularIdade(dataNasc: string) {
  const hoje = new Date()
  const nasc = new Date(dataNasc)
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

function formatarData(data: string | null) {
  if (!data) return '—'
  return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
}

type Filtros = {
  status: string
  genero: string
  escolaridade: string
  cidade: string
  temFilhos: string
  integrado: string
  autorizacaoImagem: string
  batizado: string
}

const filtrosIniciais: Filtros = {
  status: '', genero: '', escolaridade: '', cidade: '',
  temFilhos: '', integrado: '', autorizacaoImagem: '', batizado: '',
}

export default function RelatoriosPage() {
  const [membros, setMembros] = useState<Membro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtros, setFiltros] = useState<Filtros>(filtrosIniciais)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const supabase = createClient()

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    const { data } = await supabase
      .from('membros')
      .select(`
        id, nome_completo, data_nascimento, genero, escolaridade,
        cidade, bairro, status_membresia, data_admissao, data_batismo_aguas,
        profissao, telefone, email, tem_filhos, tipo_sanguineo,
        tamanho_camiseta, autorizacao_imagem, concluiu_integracao
      `)
      .order('nome_completo')
    setMembros(data ?? [])
    setCarregando(false)
  }

  function setF(campo: keyof Filtros, valor: string) {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
  }

  const cidades = [...new Set(membros.map(m => m.cidade).filter(Boolean))] as string[]

  const membrosFiltrados = membros.filter(m => {
    if (filtros.status && m.status_membresia !== filtros.status) return false
    if (filtros.genero && m.genero !== filtros.genero) return false
    if (filtros.escolaridade && m.escolaridade !== filtros.escolaridade) return false
    if (filtros.cidade && m.cidade !== filtros.cidade) return false
    if (filtros.temFilhos === 'sim' && !m.tem_filhos) return false
    if (filtros.temFilhos === 'nao' && m.tem_filhos) return false
    if (filtros.integrado === 'sim' && !m.concluiu_integracao) return false
    if (filtros.integrado === 'nao' && m.concluiu_integracao) return false
    if (filtros.autorizacaoImagem === 'sim' && !m.autorizacao_imagem) return false
    if (filtros.autorizacaoImagem === 'nao' && m.autorizacao_imagem) return false
    if (filtros.batizado === 'sim' && !m.data_batismo_aguas) return false
    if (filtros.batizado === 'nao' && m.data_batismo_aguas) return false
    return true
  })

  function limparFiltros() {
    setFiltros(filtrosIniciais)
  }

  function exportarExcel() {
  const dados = membrosFiltrados.map(m => ({
    'Nome':                  m.nome_completo,
    'Status':                m.status_membresia,
    'Gênero':                m.genero ?? '',
    'Idade':                 m.data_nascimento ? calcularIdade(m.data_nascimento) : '',
    'Data de Nascimento':    formatarData(m.data_nascimento),
    'Profissão':             m.profissao ?? '',
    'Escolaridade':          m.escolaridade ?? '',
    'Cidade':                m.cidade ?? '',
    'Bairro':                m.bairro ?? '',
    'Telefone':              m.telefone ?? '',
    'E-mail':                m.email ?? '',
    'Data de Admissão':      formatarData(m.data_admissao),
    'Batismo nas Águas':     formatarData(m.data_batismo_aguas),
    'Integração Concluída':  m.concluiu_integracao ? 'Sim' : 'Não',
    'Autorização de Imagem': m.autorizacao_imagem ? 'Sim' : 'Não',
    'Tem Filhos':            m.tem_filhos ? 'Sim' : 'Não',
    'Tipo Sanguíneo':        m.tipo_sanguineo ?? '',
    'Tamanho Camiseta':      m.tamanho_camiseta ?? '',
  }))

  const planilha = XLSX.utils.json_to_sheet(dados)

  // Largura das colunas
  planilha['!cols'] = [
    { wch: 35 }, // Nome
    { wch: 15 }, // Status
    { wch: 12 }, // Gênero
    { wch: 8  }, // Idade
    { wch: 18 }, // Data Nascimento
    { wch: 20 }, // Profissão
    { wch: 30 }, // Escolaridade
    { wch: 18 }, // Cidade
    { wch: 18 }, // Bairro
    { wch: 18 }, // Telefone
    { wch: 28 }, // E-mail
    { wch: 18 }, // Data Admissão
    { wch: 18 }, // Batismo
    { wch: 18 }, // Integração
    { wch: 20 }, // Autorização
    { wch: 12 }, // Filhos
    { wch: 14 }, // Tipo Sanguíneo
    { wch: 16 }, // Camiseta
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, planilha, 'Membros')

  // Aba de resumo
  const hoje = new Date().toLocaleDateString('pt-BR')
  const resumo = [
    ['Relatório IBC Membership'],
    ['Gerado em:', hoje],
    [''],
    ['Total de membros:', membrosFiltrados.length],
    ['Membros ativos:', membrosFiltrados.filter(m => m.status_membresia === 'Membro Ativo').length],
    ['Visitantes:', membrosFiltrados.filter(m => m.status_membresia === 'Visitante').length],
    ['Congregados:', membrosFiltrados.filter(m => m.status_membresia === 'Congregado').length],
    ['Afastados:', membrosFiltrados.filter(m => m.status_membresia === 'Afastado').length],
    [''],
    ['Filtros aplicados:'],
    ['Status:', filtros.status || 'Todos'],
    ['Gênero:', filtros.genero || 'Todos'],
    ['Cidade:', filtros.cidade || 'Todas'],
    ['Escolaridade:', filtros.escolaridade || 'Todas'],
  ]
  const planilhaResumo = XLSX.utils.aoa_to_sheet(resumo)
  planilhaResumo['!cols'] = [{ wch: 25 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(workbook, planilhaResumo, 'Resumo')

  const nomeArquivo = `relatorio-membros-${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(workbook, nomeArquivo)
}

  const filtersAtivos = Object.values(filtros).filter(Boolean).length

  const selectClass = "border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 size={24} className="text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-sm text-gray-500">
              {membrosFiltrados.length} de {membros.length} membros
              {filtersAtivos > 0 && ` — ${filtersAtivos} filtro(s) ativo(s)`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors
              ${filtersAtivos > 0
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Filter size={16} />
            Filtros {filtersAtivos > 0 && `(${filtersAtivos})`}
          </button>
          <button
  onClick={exportarExcel}
  disabled={membrosFiltrados.length === 0}
  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
>
  <Download size={16} /> Exportar Excel
</button>
        </div>
      </div>

      {/* Painel de filtros */}
      {mostrarFiltros && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Filtrar membros</h2>
            {filtersAtivos > 0 && (
              <button onClick={limparFiltros}
                className="text-sm text-red-500 hover:text-red-700 font-medium">
                Limpar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select className={selectClass + ' w-full'} value={filtros.status} onChange={e => setF('status', e.target.value)}>
                <option value="">Todos</option>
                <option>Membro Ativo</option>
                <option>Visitante</option>
                <option>Congregado</option>
                <option>Afastado</option>
                <option>Transferido</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Gênero</label>
              <select className={selectClass + ' w-full'} value={filtros.genero} onChange={e => setF('genero', e.target.value)}>
                <option value="">Todos</option>
                <option>Masculino</option>
                <option>Feminino</option>
                <option>Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Escolaridade</label>
              <select className={selectClass + ' w-full'} value={filtros.escolaridade} onChange={e => setF('escolaridade', e.target.value)}>
                <option value="">Todas</option>
                <option>Ensino Fundamental Incompleto</option>
                <option>Ensino Fundamental Completo</option>
                <option>Ensino Médio Incompleto</option>
                <option>Ensino Médio Completo</option>
                <option>Ensino Superior Incompleto</option>
                <option>Ensino Superior Completo</option>
                <option>Pós-graduação</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cidade</label>
              <select className={selectClass + ' w-full'} value={filtros.cidade} onChange={e => setF('cidade', e.target.value)}>
                <option value="">Todas</option>
                {cidades.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tem filhos</label>
              <select className={selectClass + ' w-full'} value={filtros.temFilhos} onChange={e => setF('temFilhos', e.target.value)}>
                <option value="">Todos</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Integração</label>
              <select className={selectClass + ' w-full'} value={filtros.integrado} onChange={e => setF('integrado', e.target.value)}>
                <option value="">Todos</option>
                <option value="sim">Concluiu</option>
                <option value="nao">Não concluiu</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Autorização imagem</label>
              <select className={selectClass + ' w-full'} value={filtros.autorizacaoImagem} onChange={e => setF('autorizacaoImagem', e.target.value)}>
                <option value="">Todos</option>
                <option value="sim">Autorizou</option>
                <option value="nao">Não autorizou</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Batismo nas águas</label>
              <select className={selectClass + ' w-full'} value={filtros.batizado} onChange={e => setF('batizado', e.target.value)}>
                <option value="">Todos</option>
                <option value="sim">Batizados</option>
                <option value="nao">Não batizados</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {carregando ? (
          <div className="flex items-center justify-center py-16 text-gray-400">Carregando...</div>
        ) : membrosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <BarChart3 size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Nenhum membro encontrado</p>
            <p className="text-sm mt-1">Tente ajustar os filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Nome</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden md:table-cell">Gênero</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden md:table-cell">Idade</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">Cidade</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">Admissão</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden xl:table-cell">Integração</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden xl:table-cell">Img.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {membrosFiltrados.map(m => {
                  const statusCor: Record<string, string> = {
                    'Membro Ativo': 'bg-green-100 text-green-700',
                    'Visitante':    'bg-blue-100 text-blue-700',
                    'Congregado':   'bg-purple-100 text-purple-700',
                    'Afastado':     'bg-yellow-100 text-yellow-700',
                    'Transferido':  'bg-gray-100 text-gray-700',
                  }
                  return (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{m.nome_completo}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusCor[m.status_membresia] ?? 'bg-gray-100 text-gray-700'}`}>
                          {m.status_membresia}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{m.genero ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                        {m.data_nascimento ? `${calcularIdade(m.data_nascimento)} anos` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{m.cidade ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{formatarData(m.data_admissao)}</td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.concluiu_integracao ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {m.concluiu_integracao ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.autorizacao_imagem ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {m.autorizacao_imagem ? 'Sim' : 'Não'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}