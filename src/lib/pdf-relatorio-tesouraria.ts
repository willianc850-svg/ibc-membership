import { formatarMoeda } from '@/lib/tesouraria'

type RGB = [number, number, number]

const NAVY: RGB = [17, 35, 91]
const NAVY_SOFT: RGB = [238, 241, 248]
const GREEN: RGB = [4, 120, 87]
const GREEN_BG: RGB = [236, 253, 245]
const RED: RGB = [185, 28, 28]
const RED_BG: RGB = [254, 242, 242]
const GRAY: RGB = [107, 114, 128]
const INK: RGB = [17, 24, 39]
const LINE: RGB = [229, 231, 235]
const ZEBRA: RGB = [249, 250, 251]
const WHITE: RGB = [255, 255, 255]

export type LinhaValor = { titulo: string; valor: number }
export type LinhaMes = { nome: string; entradas: number; saidas: number }
export type LinhaLancamento = {
  data: string
  descricao: string
  categoria: string
  tipo: 'entrada' | 'saida'
  valor: number
}

export type RelatorioTesourariaPdf = {
  titulo: string
  arquivo: string
  totalEntradas: number
  totalSaidas: number
  receitas: LinhaValor[]
  gastos: LinhaValor[]
  meses: LinhaMes[]
  lancamentos: LinhaLancamento[]
}

async function carregarImagem(src: string) {
  try {
    const res = await fetch(src)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function baixarRelatorioTesourariaPdf(dados: RelatorioTesourariaPdf) {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const logo = await carregarImagem('/logo-ibc-white.png')
  const saldo = dados.totalEntradas - dados.totalSaidas
  let y = desenharCapa(doc, dados.titulo, logo)

  y = desenharCartoes(doc, y, dados.totalEntradas, dados.totalSaidas, saldo)
  y = desenharCategorias(doc, y, dados.receitas, dados.gastos)
  y = desenharMeses(doc, y, dados.titulo, dados.meses)
  desenharLancamentos(doc, y, dados.titulo, dados.lancamentos)
  carimbarRodape(doc)

  doc.save(dados.arquivo)
}

function desenharCapa(doc: import('jspdf').jsPDF, titulo: string, logo: string | null) {
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, 210, 36, 'F')
  let textoX = 14
  if (logo) {
    doc.addImage(logo, 'PNG', 14, 8, 20, 20)
    textoX = 40
  }
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Igreja Batista Central de Ipatinga', textoX, 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Tesouraria', textoX, 23)
  doc.setFontSize(9)
  doc.text(titulo, textoX, 29)
  return 44
}

function desenharCartoes(
  doc: import('jspdf').jsPDF,
  y: number,
  entradas: number,
  saidas: number,
  saldo: number,
) {
  const largura = 58
  const itens: { rotulo: string; valor: number; fundo: RGB; cor: RGB }[] = [
    { rotulo: 'Entradas', valor: entradas, fundo: GREEN_BG, cor: GREEN },
    { rotulo: 'Saídas', valor: saidas, fundo: RED_BG, cor: RED },
    { rotulo: 'Saldo', valor: saldo, fundo: NAVY_SOFT, cor: saldo >= 0 ? NAVY : RED },
  ]
  itens.forEach((item, i) => {
    const x = 14 + i * (largura + 4)
    doc.setFillColor(...item.fundo)
    doc.roundedRect(x, y, largura, 18, 2, 2, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...GRAY)
    doc.text(item.rotulo, x + 4, y + 6)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...item.cor)
    doc.text(formatarMoeda(item.valor), x + 4, y + 13)
  })
  return y + 26
}

function desenharCategorias(
  doc: import('jspdf').jsPDF,
  y: number,
  receitas: LinhaValor[],
  gastos: LinhaValor[],
) {
  const coluna = 88
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...NAVY)
  doc.text('Entradas por categoria', 14, y)
  doc.text('Saídas por categoria', 14 + coluna + 6, y)
  let esquerda = y + 6
  let direita = y + 6
  for (const linha of receitas) esquerda = desenharLinha(doc, 14, esquerda, coluna, linha.titulo, linha.valor)
  for (const linha of gastos) direita = desenharLinha(doc, 14 + coluna + 6, direita, coluna, linha.titulo, linha.valor)
  return Math.max(esquerda, direita) + 6
}

function desenharLinha(
  doc: import('jspdf').jsPDF,
  x: number,
  y: number,
  largura: number,
  nome: string,
  valor: number,
) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text(nome, x, y)
  doc.setTextColor(...INK)
  doc.text(formatarMoeda(valor), x + largura, y, { align: 'right' })
  doc.setDrawColor(...LINE)
  doc.line(x, y + 1.6, x + largura, y + 1.6)
  return y + 6
}

function desenharMeses(
  doc: import('jspdf').jsPDF,
  y: number,
  titulo: string,
  meses: LinhaMes[],
) {
  y = garantirEspaco(doc, y, titulo, 28)
  y = tituloSecao(doc, y, 'Por mês')
  const colunas = [14, 70, 110, 150]
  y = cabecalhoTabela(doc, y, colunas, ['Mês', 'Entradas', 'Saídas', 'Saldo'])
  meses.forEach((mes, i) => {
    y = garantirEspaco(doc, y, titulo, 8)
    if (i % 2 === 0) {
      doc.setFillColor(...ZEBRA)
      doc.rect(14, y - 4, 182, 6, 'F')
    }
    const saldoMes = mes.entradas - mes.saidas
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...INK)
    doc.text(mes.nome, colunas[0], y)
    doc.setTextColor(...GREEN)
    doc.text(formatarMoeda(mes.entradas), colunas[1], y)
    doc.setTextColor(...RED)
    doc.text(formatarMoeda(mes.saidas), colunas[2], y)
    doc.setTextColor(...(saldoMes >= 0 ? NAVY : RED))
    doc.text(formatarMoeda(saldoMes), colunas[3], y)
    y += 6
  })
  return y + 4
}

function desenharLancamentos(
  doc: import('jspdf').jsPDF,
  y: number,
  titulo: string,
  lancamentos: LinhaLancamento[],
) {
  y = garantirEspaco(doc, y, titulo, 20)
  y = tituloSecao(doc, y, 'Lançamentos do trimestre')
  if (lancamentos.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...GRAY)
    doc.text('Nenhum lançamento neste trimestre.', 14, y)
    return
  }
  const colunas = [14, 36, 110, 158]
  const pintarCabecalho = () => {
    y = cabecalhoTabela(doc, y, colunas, ['Data', 'Descrição', 'Categoria', 'Valor'])
  }
  pintarCabecalho()
  for (const item of lancamentos) {
    const descricao = doc.splitTextToSize(item.descricao, 70) as string[]
    const altura = Math.max(6, descricao.length * 4 + 2)
    const antes = y
    y = garantirEspaco(doc, y, titulo, altura + 2)
    if (y < antes) pintarCabecalho()
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...INK)
    doc.text(item.data, colunas[0], y)
    doc.text(descricao, colunas[1], y)
    doc.setTextColor(...GRAY)
    doc.text(doc.splitTextToSize(item.categoria, 44) as string[], colunas[2], y)
    doc.setTextColor(...(item.tipo === 'entrada' ? GREEN : RED))
    const sinal = item.tipo === 'entrada' ? '+' : '-'
    doc.text(`${sinal} ${formatarMoeda(item.valor)}`, colunas[3], y)
    y += altura
  }
}

function tituloSecao(doc: import('jspdf').jsPDF, y: number, texto: string) {
  doc.setFillColor(...NAVY)
  doc.rect(14, y - 3.2, 2.2, 4.2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...NAVY)
  doc.text(texto, 19, y)
  return y + 6
}

function cabecalhoTabela(doc: import('jspdf').jsPDF, y: number, colunas: number[], titulos: string[]) {
  doc.setFillColor(...NAVY)
  doc.rect(14, y - 4, 182, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...WHITE)
  titulos.forEach((titulo, i) => doc.text(titulo, colunas[i], y))
  return y + 6
}

function garantirEspaco(doc: import('jspdf').jsPDF, y: number, titulo: string, altura: number) {
  if (y + altura <= 280) return y
  doc.addPage()
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, 210, 12, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...WHITE)
  doc.text('IBC · Tesouraria', 14, 8)
  doc.setFont('helvetica', 'normal')
  doc.text(titulo, 196, 8, { align: 'right' })
  return 20
}

function carimbarRodape(doc: import('jspdf').jsPDF) {
  const hoje = new Date().toLocaleDateString('pt-BR')
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...GRAY)
    doc.text(`Gerado em ${hoje}`, 14, 290)
    doc.text(`${i} / ${total}`, 196, 290, { align: 'right' })
  }
}
