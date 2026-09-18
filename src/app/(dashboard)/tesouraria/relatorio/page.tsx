'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import TesourariaGuard from '@/components/TesourariaGuard'
import {
  BLOCOS_GASTO, BLOCOS_RECEITA, MESES, TRIMESTRES,
  formatarDataISO, formatarMoeda, labelCategoria, soma, type Lancamento,
} from '@/lib/tesouraria'
import { FileDown } from 'lucide-react'

export default function RelatorioTesourariaPage() {
  return (
    <TesourariaGuard>
      <RelatorioTrimestral />
    </TesourariaGuard>
  )
}

function RelatorioTrimestral() {
  const supabase = createClient()
  const anoAtual = new Date().getFullYear()
  const trimestreAtual = Math.ceil((new Date().getMonth() + 1) / 3)
  const [ano, setAno] = useState(anoAtual)
  const [trimestre, setTrimestre] = useState(trimestreAtual)
  const [lista, setLista] = useState<Lancamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const meses = TRIMESTRES.find((t) => t.id === trimestre)?.meses ?? [1, 2, 3]
  const inicio = `${ano}-${String(meses[0]).padStart(2, '0')}-01`
  const fimDia = new Date(ano, meses[meses.length - 1], 0).getDate()
  const fim = `${ano}-${String(meses[meses.length - 1]).padStart(2, '0')}-${String(fimDia).padStart(2, '0')}`

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      setErro('')
      const { data, error } = await supabase
        .from('lancamentos_financeiros')
        .select('*')
        .gte('data', inicio)
        .lte('data', fim)
        .order('data')
      if (error) setErro(error.message)
      setLista((data ?? []) as Lancamento[])
      setCarregando(false)
    }
    carregar()
  }, [ano, trimestre])

  const entradas = lista.filter((l) => l.tipo === 'entrada')
  const saidas = lista.filter((l) => l.tipo === 'saida')
  const totalEntradas = soma(entradas)
  const totalSaidas = soma(saidas)
  const porCat = (cat: string) => soma(lista.filter((l) => l.categoria === cat))
  const titulo = `Relatório ${TRIMESTRES.find((t) => t.id === trimestre)?.label} / ${ano}`

  const porMes = useMemo(() => meses.map((mes) => {
    const doMes = lista.filter((l) => Number(l.data.slice(5, 7)) === mes)
    return {
      mes,
      nome: MESES[mes - 1],
      entradas: soma(doMes.filter((l) => l.tipo === 'entrada')),
      saidas: soma(doMes.filter((l) => l.tipo === 'saida')),
    }
  }), [lista, meses])

  async function exportarPdf() {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    let y = 18
    doc.setFontSize(14)
    doc.text('IBC Membership — Tesouraria', 14, y)
    y += 8
    doc.setFontSize(11)
    doc.text(titulo, 14, y)
    y += 10
    doc.setFontSize(10)
    doc.text(`Entradas: ${formatarMoeda(totalEntradas)}`, 14, y)
    y += 6
    doc.text(`Saídas: ${formatarMoeda(totalSaidas)}`, 14, y)
    y += 6
    doc.text(`Saldo: ${formatarMoeda(totalEntradas - totalSaidas)}`, 14, y)
    y += 10
    doc.text('Entradas por categoria', 14, y)
    y += 6
    for (const b of BLOCOS_RECEITA) {
      doc.text(`${b.titulo}: ${formatarMoeda(porCat(b.categoria))}`, 18, y)
      y += 5
    }
    y += 4
    doc.text('Saídas por categoria', 14, y)
    y += 6
    for (const b of BLOCOS_GASTO) {
      doc.text(`${b.titulo}: ${formatarMoeda(porCat(b.categoria))}`, 18, y)
      y += 5
    }
    y += 6
    doc.text('Por mês', 14, y)
    y += 6
    for (const m of porMes) {
      doc.text(`${m.nome}: +${formatarMoeda(m.entradas)} / -${formatarMoeda(m.saidas)}`, 18, y)
      y += 5
    }
    y += 8
    doc.text('Lançamentos', 14, y)
    y += 6
    doc.setFontSize(8)
    for (const item of lista) {
      if (y > 280) { doc.addPage(); y = 16 }
      const linha = `${formatarDataISO(item.data)}  ${item.tipo === 'entrada' ? '+' : '-'} ${formatarMoeda(Number(item.valor))}  ${item.descricao}`
      doc.text(linha.slice(0, 110), 14, y)
      y += 4
    }
    doc.save(`relatorio-tesouraria-${ano}-t${trimestre}.pdf`)
  }

  return (
    <div data-cy="pageRelatorioTesouraria" className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatório trimestral</h1>
          <p className="text-sm text-gray-500">{titulo}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select data-cy="selectAnoRelatorio" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={ano}
            onChange={(e) => setAno(Number(e.target.value))}>
            {[anoAtual - 1, anoAtual, anoAtual + 1].map((a) => <option key={a} value={a} data-cy={`optAnoRelatorio-${a}`}>{a}</option>)}
          </select>
          <select data-cy="selectTrimestre" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={trimestre}
            onChange={(e) => setTrimestre(Number(e.target.value))}>
            {TRIMESTRES.map((t) => <option key={t.id} value={t.id} data-cy={`optTrimestre-${t.id}`}>{t.label}</option>)}
          </select>
          <button onClick={exportarPdf} data-cy="btnExportarPdfTesouraria" className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
            <FileDown size={14} /> Exportar PDF
          </button>
          <Link href="/tesouraria" data-cy="btnResumoAnual" className="px-3 py-2 text-sm border border-gray-300 rounded-lg">Resumo</Link>
        </div>
      </div>

      {erro && <div data-cy="msgErroRelatorioTesouraria" className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{erro}</div>}

      {carregando ? (
        <p data-cy="loadingRelatorioTesouraria" className="text-sm text-gray-400 py-8 text-center">Carregando...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card rotulo="Entradas" valor={totalEntradas} classe="text-emerald-700" dataCy="totalEntradasTrimestre" />
            <Card rotulo="Saídas" valor={totalSaidas} classe="text-red-700" dataCy="totalSaidasTrimestre" />
            <Card rotulo="Saldo" valor={totalEntradas - totalSaidas} classe={totalEntradas - totalSaidas >= 0 ? 'text-indigo-700' : 'text-red-700'} dataCy="totalSaldoTrimestre" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Entradas por categoria</h2>
              {BLOCOS_RECEITA.map((b) => (
                <Linha key={b.categoria} nome={b.titulo} valor={porCat(b.categoria)} />
              ))}
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Saídas por categoria</h2>
              {BLOCOS_GASTO.map((b) => (
                <Linha key={b.categoria} nome={b.titulo} valor={porCat(b.categoria)} />
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Por mês</h2>
            {porMes.map((m) => (
              <div key={m.mes} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                <Link href={`/tesouraria/${ano}/${m.mes}`} data-cy={`linkMesTesouraria-${m.mes}`} className="text-indigo-600 hover:underline">{m.nome}</Link>
                <span>{formatarMoeda(m.entradas - m.saidas)}</span>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 overflow-x-auto">
            <h2 className="font-semibold text-gray-900 mb-3">Lançamentos do trimestre</h2>
            {lista.length === 0 ? (
              <p data-cy="vazioRelatorioTesouraria" className="text-sm text-gray-400">Nenhum lançamento neste trimestre.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="py-2 pr-3">Data</th>
                    <th className="py-2 pr-3">Descrição</th>
                    <th className="py-2 pr-3">Categoria</th>
                    <th className="py-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((item) => (
                    <tr key={item.id} data-cy={`lancamentoRelatorioItem-${item.id}`} className="border-b border-gray-50">
                      <td className="py-2 pr-3 whitespace-nowrap">{formatarDataISO(item.data)}</td>
                      <td className="py-2 pr-3">{item.descricao}</td>
                      <td className="py-2 pr-3 text-gray-500">{labelCategoria(item.categoria)}</td>
                      <td className={`py-2 ${item.tipo === 'entrada' ? 'text-emerald-700' : 'text-red-700'}`}>
                        {item.tipo === 'entrada' ? '+' : '−'} {formatarMoeda(Number(item.valor))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Card({ rotulo, valor, classe, dataCy }: { rotulo: string; valor: number; classe: string; dataCy: string }) {
  return (
    <div data-cy={dataCy} className="bg-white border border-gray-200 rounded-2xl p-4">
      <p className="text-xs text-gray-500">{rotulo}</p>
      <p className={`text-lg font-semibold mt-1 ${classe}`}>{formatarMoeda(valor)}</p>
    </div>
  )
}

function Linha({ nome, valor }: { nome: string; valor: number }) {
  return (
    <div className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-600">{nome}</span>
      <span className="text-gray-900">{formatarMoeda(valor)}</span>
    </div>
  )
}
