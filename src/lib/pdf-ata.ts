type RGB = [number, number, number]

const NAVY: RGB = [17, 35, 91]
const INK: RGB = [17, 24, 39]
const GRAY: RGB = [107, 114, 128]

const MARGEM = 14
const LIMITE_Y = 274
const LARGURA = 182

export type AtaPdf = {
  titulo: string
  data: string
  horario: string | null
  local: string | null
  texto: string
  arquivo: string
}

async function carregarImagem(src: string) {
  try {
    const res = await fetch(src)
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binario = ''
    for (const byte of bytes) binario += String.fromCharCode(byte)
    return `data:image/png;base64,${btoa(binario)}`
  } catch {
    return null
  }
}

function desenharMoldura(doc: import('jspdf').jsPDF) {
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.4)
  doc.rect(8, 8, 194, 281, 'S')
}

function desenharCabecalho(
  doc: import('jspdf').jsPDF,
  dados: AtaPdf,
  logo: string | null,
) {
  if (logo) doc.addImage(logo, 'PNG', MARGEM, 14, 18, 18)

  const textoX = logo ? 36 : MARGEM
  doc.setTextColor(...NAVY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Igreja Batista Central', textoX, 21)
  doc.setFontSize(11)
  doc.text('ATA', textoX, 28)

  let y = 42
  doc.setTextColor(...INK)
  doc.setFontSize(12)
  const titulo = doc.splitTextToSize(dados.titulo, LARGURA) as string[]
  doc.text(titulo, MARGEM, y)
  y += titulo.length * 5.5

  const meta = [dados.data, dados.horario, dados.local].filter(Boolean).join('  ·  ')
  if (meta) {
    y += 1
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...GRAY)
    const linhas = doc.splitTextToSize(meta, LARGURA) as string[]
    doc.text(linhas, MARGEM, y)
    y += linhas.length * 4.5
  }

  y += 3
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.2)
  doc.line(MARGEM, y, 196, y)
  return y + 8
}

function escreverCorpo(doc: import('jspdf').jsPDF, texto: string, yInicial: number) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(...INK)

  let y = yInicial
  const paragrafos = texto.replace(/\r\n/g, '\n').split('\n')

  function novaPagina() {
    doc.addPage()
    desenharMoldura(doc)
    y = 18
  }

  for (const paragrafo of paragrafos) {
    const linhas = paragrafo.trim()
      ? (doc.splitTextToSize(paragrafo, LARGURA) as string[])
      : ['']
    for (const linha of linhas) {
      if (y > LIMITE_Y) novaPagina()
      if (linha) doc.text(linha, MARGEM, y)
      y += linha ? 5.5 : 3
    }
  }
}

function carimbarRodape(doc: import('jspdf').jsPDF) {
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...GRAY)
    doc.text(`${i} / ${total}`, 105, 283, { align: 'center' })
  }
}

export async function montarAtaPdf(dados: AtaPdf, logo: string | null) {
  const modulo = await import('jspdf')
  const jsPDF = typeof modulo.default === 'function' ? modulo.default : modulo.jsPDF
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  desenharMoldura(doc)
  const y = desenharCabecalho(doc, dados, logo)
  escreverCorpo(doc, dados.texto, y)
  carimbarRodape(doc)
  return doc
}

export async function baixarAtaPdf(dados: AtaPdf) {
  const logo = await carregarImagem('/logo-ibc.png')
  const doc = await montarAtaPdf(dados, logo)
  doc.save(dados.arquivo)
}
