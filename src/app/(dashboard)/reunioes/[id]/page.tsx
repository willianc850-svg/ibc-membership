'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, CalendarDays, Clock, MapPin, Users,
  Sparkles, FileDown, CheckCircle, Loader2, Pencil, Trash2, Save
} from 'lucide-react'

type Reuniao = {
  id: string
  titulo: string
  tipo: string
  data_reuniao: string
  horario: string | null
  local: string | null
  pauta: string | null
  ata_texto: string | null
  status: string
  ministerios?: { nome: string } | null
}

type Participante = {
  id: string
  membro_id: string
  presente: boolean
  confirmado: boolean
  confirmado_at: string | null
  membros: {
    id: string
    nome_completo: string
    status_membresia: string
  }
}

const tipoCor: Record<string, string> = {
  'Ministério':  'bg-indigo-100 text-indigo-700',
  'Diretoria':   'bg-purple-100 text-purple-700',
  'Assembleia':  'bg-amber-100 text-amber-700',
  'Outra':       'bg-gray-100 text-gray-600',
}

const statusPermitidos = ['Pastor', 'Diretoria', 'Líder de Ministério']

export default function ReuniaoDetalhesPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [reuniao, setReuniao] = useState<Reuniao | null>(null)
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [carregando, setCarregando] = useState(true)
  const [meuMembro, setMeuMembro] = useState<{ id: string; status_membresia: string } | null>(null)
  const [editandoAta, setEditandoAta] = useState(false)
  const [ataTexto, setAtaTexto] = useState('')
  const [gerando, setGerando] = useState(false)
  const [salvandoAta, setSalvandoAta] = useState(false)
  const [gerandoPdf, setGerandoPdf] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [deletando, setDeletando] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { carregar() }, [id])

  async function carregar() {
    setCarregando(true)

    const [{ data: reu }, { data: parts }, { data: { user } }] = await Promise.all([
      supabase.from('reunioes').select('*, ministerios(nome)').eq('id', id).single(),
      supabase.from('reuniao_participantes')
        .select('*, membros(id, nome_completo, status_membresia)')
        .eq('reuniao_id', id),
      supabase.auth.getUser(),
    ])

    setReuniao(reu)
    setAtaTexto(reu?.ata_texto ?? '')
    setParticipantes(parts ?? [])

    if (user) {
      const { data: membro } = await supabase
        .from('membros')
        .select('id, status_membresia')
        .eq('user_id', user.id)
        .single()
      setMeuMembro(membro)
    }

    setCarregando(false)
  }

  function formatarData(data: string) {
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    })
  }

async function gerarAtaComIA() {
  if (!reuniao) return
  setGerando(true)

  const nomes = participantes.map(p => p.membros.nome_completo).join(', ')
  const prompt = `Você é um secretário eclesiástico profissional. Gere uma ATA formal de reunião com base nas seguintes informações:

Título: ${reuniao.titulo}
Tipo: ${reuniao.tipo}
Data: ${formatarData(reuniao.data_reuniao)}
Horário: ${reuniao.horario ?? 'Não informado'}
Local: ${reuniao.local ?? 'Não informado'}
Participantes: ${nomes || 'Não informado'}
Pauta/Tópicos discutidos: ${reuniao.pauta ?? 'Não informado'}

Gere uma ATA formal, completa e bem estruturada em português brasileiro, com:
- Cabeçalho com nome da reunião, data, local e horário
- Lista de presentes
- Desenvolvimento dos tópicos discutidos
- Encerramento formal
- Espaço para assinaturas

Use linguagem formal e eclesiástica adequada.`

  try {
    const res = await fetch('/api/gerar-ata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
    const data = await res.json()
    setAtaTexto(data.texto)
    setEditandoAta(true)
  } catch {
    alert('Erro ao gerar ATA. Tente novamente.')
  }
  setGerando(false)
}
  async function salvarAta() {
    setSalvandoAta(true)
    await supabase.from('reunioes').update({ ata_texto: ataTexto }).eq('id', id)
    setEditandoAta(false)
    setSalvandoAta(false)
    carregar()
  }

  async function finalizarReuniao() {
    if (!confirm('Finalizar a reunião? Após finalizada a ATA ficará disponível para confirmação dos participantes.')) return
    await supabase.from('reunioes').update({ status: 'finalizada' }).eq('id', id)
    carregar()
  }

  async function confirmarPresenca() {
    if (!meuMembro) return
    setConfirmando(true)

    await supabase.from('reuniao_participantes')
      .update({ confirmado: true, confirmado_at: new Date().toISOString() })
      .eq('reuniao_id', id)
      .eq('membro_id', meuMembro.id)

    setConfirmando(false)
    carregar()
  }

  async function gerarPDF() {
    if (!reuniao || !ataTexto) return
    setGerandoPdf(true)

    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    const linhas = doc.splitTextToSize(ataTexto, 170)
    let y = 20
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(reuniao.titulo, 20, y)
    y += 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    linhas.forEach((linha: string) => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.text(linha, 20, y)
      y += 6
    })

    const nomeArquivo = `ata-${reuniao.titulo.toLowerCase().replace(/\s+/g, '-')}.pdf`
    doc.save(nomeArquivo)
    setGerandoPdf(false)
  }

  async function deletarReuniao() {
    if (!confirm('Excluir esta reunião? Esta ação não pode ser desfeita.')) return
    setDeletando(true)
    await supabase.from('reunioes').delete().eq('id', id)
    router.push('/reunioes')
  }

  if (carregando) return (
    <div className="flex items-center justify-center py-24 text-gray-400">Carregando...</div>
  )
  if (!reuniao) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <p>Reunião não encontrada.</p>
      <Link href="/reunioes" className="text-indigo-600 text-sm mt-2">Voltar</Link>
    </div>
  )

  const meuParticipante = participantes.find(p => p.membros.id === meuMembro?.id)
  const podeConfirmar = meuMembro && statusPermitidos.includes(meuMembro.status_membresia)
  const jaConfirmou = meuParticipante?.confirmado ?? false
  const confirmados = participantes.filter(p => p.confirmado).length

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/reunioes" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tipoCor[reuniao.tipo]}`}>
                {reuniao.tipo}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                reuniao.status === 'finalizada'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {reuniao.status === 'finalizada' ? 'Finalizada' : 'Rascunho'}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{reuniao.titulo}</h1>
          </div>
        </div>
        <button onClick={deletarReuniao} disabled={deletando}
          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0">
          <Trash2 size={18} />
        </button>
      </div>

      {/* Info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex flex-wrap gap-4">
          <span className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarDays size={16} className="text-indigo-500" />
            {formatarData(reuniao.data_reuniao)}
          </span>
          {reuniao.horario && (
            <span className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} className="text-indigo-500" />
              {reuniao.horario}
            </span>
          )}
          {reuniao.local && (
            <span className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={16} className="text-indigo-500" />
              {reuniao.local}
            </span>
          )}
          {reuniao.ministerios?.nome && (
            <span className="flex items-center gap-2 text-sm text-gray-600">
              Ministério: {reuniao.ministerios.nome}
            </span>
          )}
        </div>

        {reuniao.pauta && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Pauta</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{reuniao.pauta}</p>
          </div>
        )}
      </div>

      {/* Confirmação de presença */}
      {reuniao.status === 'finalizada' && podeConfirmar && meuParticipante && (
        <div className={`rounded-2xl p-5 border ${jaConfirmou ? 'bg-green-50 border-green-200' : 'bg-indigo-50 border-indigo-200'}`}>
          {jaConfirmou ? (
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <div>
                <p className="font-medium text-green-800">Presença confirmada!</p>
                <p className="text-sm text-green-600">
                  Confirmado em {new Date(meuParticipante.confirmado_at!).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-indigo-900">Confirme sua presença</p>
                <p className="text-sm text-indigo-700 mt-0.5">
                  Ao confirmar, você atesta que esteve presente e concorda com o conteúdo da ATA.
                </p>
              </div>
              <button onClick={confirmarPresenca} disabled={confirmando}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer">
                {confirmando ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Confirmar presença
              </button>
            </div>
          )}
        </div>
      )}

      {/* ATA */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">ATA da Reunião</h2>
          <div className="flex items-center gap-2">
            {!editandoAta && (
              <button onClick={() => setEditandoAta(true)}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Pencil size={14} /> Editar
              </button>
            )}
            {reuniao.ata_texto && !editandoAta && (
              <button onClick={gerarPDF} disabled={gerandoPdf}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                {gerandoPdf ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                Baixar PDF
              </button>
            )}
          </div>
        </div>

        {editandoAta ? (
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
              rows={16}
              value={ataTexto}
              onChange={e => setAtaTexto(e.target.value)}
              placeholder="Digite ou gere a ATA com IA..."
            />
            <div className="flex flex-wrap gap-2">
              <button onClick={gerarAtaComIA} disabled={gerando}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">
                {gerando ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {gerando ? 'Gerando com IA...' : 'Gerar ATA com IA'}
              </button>
              <button onClick={salvarAta} disabled={salvandoAta}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">
                {salvandoAta ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Salvar ATA
              </button>
              <button onClick={() => { setEditandoAta(false); setAtaTexto(reuniao.ata_texto ?? '') }}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        ) : reuniao.ata_texto ? (
          <div className="bg-gray-50 rounded-xl p-4">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
              {reuniao.ata_texto}
            </pre>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Sparkles size={32} className="mb-3 opacity-30" />
            <p className="font-medium text-sm">ATA ainda não gerada</p>
            <p className="text-xs mt-1 mb-4">Clique em Editar e use a IA para gerar automaticamente</p>
            <button onClick={() => setEditandoAta(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">
              <Sparkles size={16} /> Criar ATA
            </button>
          </div>
        )}
      </div>

      {/* Participantes */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-500" />
            <span className="font-medium text-gray-900 text-sm">
              {participantes.length} participante(s)
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {confirmados} confirmado(s)
          </span>
        </div>

        {participantes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nenhum participante registrado</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {participantes.map(p => {
              const podeConf = statusPermitidos.includes(p.membros.status_membresia)
              return (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {p.membros.nome_completo.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{p.membros.nome_completo}</p>
                    <p className="text-xs text-gray-400">{p.membros.status_membresia}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {p.confirmado ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full">
                        <CheckCircle size={12} /> Confirmado
                      </span>
                    ) : podeConf ? (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                        Pendente
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300 px-2.5 py-1">Presente</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Finalizar */}
      {reuniao.status === 'rascunho' && (
        <div className="flex justify-end">
          <button onClick={finalizarReuniao}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">
            <CheckCircle size={16} /> Finalizar reunião
          </button>
        </div>
      )}

    </div>
  )
}