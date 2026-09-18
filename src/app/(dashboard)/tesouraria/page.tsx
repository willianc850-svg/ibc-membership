'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import TesourariaGuard from '@/components/TesourariaGuard'
import {
  BLOCOS_GASTO, BLOCOS_RECEITA, MESES, formatarMoeda, soma,
  type CategoriaLancamento, type Lancamento,
} from '@/lib/tesouraria'
import { FileText, Wallet } from 'lucide-react'

export default function TesourariaPage() {
  return (
    <TesourariaGuard>
      <ResumoAnual />
    </TesourariaGuard>
  )
}

function ResumoAnual() {
  const supabase = createClient()
  const anoAtual = new Date().getFullYear()
  const [ano, setAno] = useState(anoAtual)
  const [lista, setLista] = useState<Lancamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      setErro('')
      const { data, error } = await supabase
        .from('lancamentos_financeiros')
        .select('*')
        .gte('data', `${ano}-01-01`)
        .lte('data', `${ano}-12-31`)
      if (error) setErro(error.message)
      setLista((data ?? []) as Lancamento[])
      setCarregando(false)
    }
    carregar()
  }, [ano])

  const linhas = useMemo(() => {
    return MESES.reduce<Array<{
      mes: number
      nome: string
      entradas: number
      saidas: number
      saldoMes: number
      saldoAnterior: number
      saldoAtual: number
      dizimos: number
      ofertas: number
      missoes: number
      outros: number
      fixas: number
      variaveis: number
      outrosGastos: number
      ofertasSaida: number
      temDados: boolean
    }>>((acc, nome, idx) => {
      const mes = idx + 1
      const doMes = lista.filter((l) => Number(l.data.slice(5, 7)) === mes)
      const entradas = soma(doMes.filter((l) => l.tipo === 'entrada'))
      const saidas = soma(doMes.filter((l) => l.tipo === 'saida'))
      const saldoMes = entradas - saidas
      const saldoAnterior = acc.at(-1)?.saldoAtual ?? 0
      const saldoAtual = saldoAnterior + saldoMes
      const porCat = (cat: CategoriaLancamento) =>
        soma(doMes.filter((l) => l.categoria === cat))
      acc.push({
        mes, nome, entradas, saidas, saldoMes, saldoAnterior, saldoAtual,
        dizimos: porCat('dizimos'),
        ofertas: porCat('ofertas'),
        missoes: porCat('missoes'),
        outros: porCat('outros'),
        fixas: porCat('gastos_fixos'),
        variaveis: porCat('gastos_variaveis'),
        outrosGastos: porCat('outros_gastos'),
        ofertasSaida: porCat('ofertas_saida'),
        temDados: doMes.length > 0,
      })
      return acc
    }, [])
  }, [lista])

  const mesesComDados = linhas.filter((l) => l.temDados)
  const media = (fn: (l: typeof linhas[0]) => number) =>
    mesesComDados.length ? mesesComDados.reduce((a, l) => a + fn(l), 0) / mesesComDados.length : 0

  return (
    <div data-cy="pageTesouraria" className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Wallet className="text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tesouraria</h1>
            <p className="text-sm text-gray-500">Resumo financeiro anual</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select data-cy="selectAnoTesouraria" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={ano}
            onChange={(e) => setAno(Number(e.target.value))}>
            {[anoAtual - 1, anoAtual, anoAtual + 1].map((a) => (
              <option key={a} value={a} data-cy={`optAnoTesouraria-${a}`}>{a}</option>
            ))}
          </select>
          <Link href="/tesouraria/relatorio" data-cy="btnRelatorioTrimestral" className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <FileText size={14} /> Relatório trimestral
          </Link>
        </div>
      </div>

      {erro && <div data-cy="msgErroTesouraria" className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{erro}</div>}

      {carregando ? (
        <p data-cy="loadingTesouraria" className="text-sm text-gray-400 py-8 text-center">Carregando...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniCard rotulo="Média de entradas" valor={media((l) => l.entradas)} dataCy="totalMediaEntradas" />
            <MiniCard rotulo="Média de saídas" valor={media((l) => l.saidas)} dataCy="totalMediaSaidas" />
            <MiniCard rotulo="Média de dízimos" valor={media((l) => l.dizimos)} dataCy="totalMediaDizimos" />
            <MiniCard rotulo="Média de ofertas" valor={media((l) => l.ofertas)} dataCy="totalMediaOfertas" />
          </div>

          <Tabela titulo="Movimento mensal" colunas={['Mês', 'Saldo anterior', 'Entradas', 'Saídas', 'Saldo do mês', 'Saldo atual']}>
            {linhas.map((l) => (
              <tr key={l.mes} className="border-b border-gray-50">
                <td className="py-2 pr-3">
                  <Link href={`/tesouraria/${ano}/${l.mes}`} data-cy={`linkMesTesouraria-${l.mes}`} className="text-indigo-600 hover:underline">{l.nome}</Link>
                </td>
                <td className="py-2 pr-3">{formatarMoeda(l.saldoAnterior)}</td>
                <td className="py-2 pr-3 text-emerald-700">{formatarMoeda(l.entradas)}</td>
                <td className="py-2 pr-3 text-red-700">{formatarMoeda(l.saidas)}</td>
                <td className={`py-2 pr-3 ${l.saldoMes >= 0 ? 'text-gray-900' : 'text-red-700'}`}>{formatarMoeda(l.saldoMes)}</td>
                <td className="py-2 font-medium">{formatarMoeda(l.saldoAtual)}</td>
              </tr>
            ))}
          </Tabela>

          <Tabela titulo="Descrição de entradas" colunas={['Mês', ...BLOCOS_RECEITA.map((b) => b.titulo.replace('Receita — ', '').replace('Receitas — ', ''))]}>
            {linhas.map((l) => (
              <tr key={l.mes} className="border-b border-gray-50">
                <td className="py-2 pr-3">{l.nome}</td>
                <td className="py-2 pr-3">{formatarMoeda(l.dizimos)}</td>
                <td className="py-2 pr-3">{formatarMoeda(l.ofertas)}</td>
                <td className="py-2 pr-3">{formatarMoeda(l.missoes)}</td>
                <td className="py-2">{formatarMoeda(l.outros)}</td>
              </tr>
            ))}
            <tr className="font-medium">
              <td className="pt-3">Total</td>
              <td className="pt-3">{formatarMoeda(soma(linhas.map((l) => ({ valor: l.dizimos }))))}</td>
              <td className="pt-3">{formatarMoeda(soma(linhas.map((l) => ({ valor: l.ofertas }))))}</td>
              <td className="pt-3">{formatarMoeda(soma(linhas.map((l) => ({ valor: l.missoes }))))}</td>
              <td className="pt-3">{formatarMoeda(soma(linhas.map((l) => ({ valor: l.outros }))))}</td>
            </tr>
          </Tabela>

          <Tabela titulo="Descrição de saídas" colunas={['Mês', ...BLOCOS_GASTO.map((b) => b.titulo)]}>
            {linhas.map((l) => (
              <tr key={l.mes} className="border-b border-gray-50">
                <td className="py-2 pr-3">{l.nome}</td>
                <td className="py-2 pr-3">{formatarMoeda(l.fixas)}</td>
                <td className="py-2 pr-3">{formatarMoeda(l.variaveis)}</td>
                <td className="py-2 pr-3">{formatarMoeda(l.outrosGastos)}</td>
                <td className="py-2">{formatarMoeda(l.ofertasSaida)}</td>
              </tr>
            ))}
            <tr className="font-medium">
              <td className="pt-3">Total</td>
              <td className="pt-3">{formatarMoeda(soma(linhas.map((l) => ({ valor: l.fixas }))))}</td>
              <td className="pt-3">{formatarMoeda(soma(linhas.map((l) => ({ valor: l.variaveis }))))}</td>
              <td className="pt-3">{formatarMoeda(soma(linhas.map((l) => ({ valor: l.outrosGastos }))))}</td>
              <td className="pt-3">{formatarMoeda(soma(linhas.map((l) => ({ valor: l.ofertasSaida }))))}</td>
            </tr>
          </Tabela>
        </>
      )}
    </div>
  )
}

function MiniCard({ rotulo, valor, dataCy }: { rotulo: string; valor: number; dataCy: string }) {
  return (
    <div data-cy={dataCy} className="bg-white border border-gray-200 rounded-2xl p-4">
      <p className="text-xs text-gray-500">{rotulo}</p>
      <p className="text-lg font-semibold text-gray-900 mt-1">{formatarMoeda(valor)}</p>
    </div>
  )
}

function Tabela({ titulo, colunas, children }: { titulo: string; colunas: string[]; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 overflow-x-auto">
      <h2 className="font-semibold text-gray-900 mb-4">{titulo}</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            {colunas.map((c) => <th key={c} className="py-2 pr-3 font-medium">{c}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
