'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Pencil, Trash2, User, Phone, Heart,
  Church, Shield, Calendar, MapPin, Mail, Smartphone,
} from 'lucide-react'
import { usePermissao } from '@/lib/hooks/usePermissao'

type Membro = {
  id: string
  user_id: string | null
  nome_completo: string
  foto_url: string | null
  data_nascimento: string | null
  genero: string | null
  estado_civil: string | null
  naturalidade: string | null
  escolaridade: string | null
  profissao: string | null
  telefone: string | null
  email: string | null
  rua: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  cep: string | null
  data_casamento: string | null
  tem_filhos: boolean
  filhos_info: string | null
  status_membresia: string
  data_admissao: string | null
  forma_admissao: string | null
  data_batismo_aguas: string | null
  data_batismo_espirito: string | null
  igreja_procedencia: string | null
  cursos_teologicos: string | null
  concluiu_integracao: boolean
  alergias_restricoes: string | null
  tipo_sanguineo: string | null
  contato_emergencia_nome: string | null
  contato_emergencia_telefone: string | null
  habilidades: string | null
  tamanho_camiseta: string | null
  autorizacao_imagem: boolean
  created_at: string
}

const statusCor: Record<string, string> = {
  'Pastor':              'bg-red-100 text-red-700',
  'Diretoria':           'bg-indigo-100 text-indigo-700',
  'Líder de Ministério': 'bg-purple-100 text-purple-700',
  'Membro Ativo':        'bg-green-100 text-green-700',
  'Congregado':          'bg-blue-100 text-blue-700',
  'Afastado':            'bg-yellow-100 text-yellow-700',
  'Transferido':         'bg-gray-100 text-gray-700',
}

function formatarData(data: string | null) {
  if (!data) return '—'
  return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
}

function Secao({ icone: Icone, titulo, children }: {
  icone: React.ElementType
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <Icone size={18} className="text-indigo-600" />
        <h2 className="font-semibold text-gray-900">{titulo}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  )
}

function Item({ label, valor, fullWidth }: {
  label: string
  valor: string | null | undefined
  fullWidth?: boolean
}) {
  return (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900 font-medium">{valor || '—'}</p>
    </div>
  )
}

function ItemBool({ label, valor }: { label: string; valor: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${valor ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {valor ? 'Sim' : 'Não'}
      </span>
    </div>
  )
}

export default function PerfilMembroPage() {
  const { id } = useParams()
  const router = useRouter()
  const [membro, setMembro] = useState<Membro | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [deletando, setDeletando] = useState(false)
  const supabase = createClient()
  const { isSuperAdmin, userId } = usePermissao()
  const podeEditar = isSuperAdmin || membro?.user_id === userId

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from('membros')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) setMembro(data)
      setCarregando(false)
    }
    carregar()
  }, [id, supabase])

  async function handleDeletar() {
    if (!confirm('Tem certeza que deseja excluir este membro? Esta ação não pode ser desfeita.')) return
    setDeletando(true)
    await supabase.from('membros').delete().eq('id', id)
    router.push('/membros')
  }

  function iniciais(nome: string) {
    return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        Carregando...
      </div>
    )
  }

  if (!membro) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <p className="font-medium">Membro não encontrado.</p>
        <Link href="/membros" className="text-indigo-600 text-sm mt-2">Voltar para a lista</Link>
      </div>
    )
  }

  const endereco = [membro.rua, membro.numero, membro.complemento, membro.bairro, membro.cidade, membro.cep]
  .filter(Boolean).join(', ')

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Link href="/membros" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Perfil do Membro</h1>
        </div>
        <div className="flex items-center gap-2">
  {podeEditar && (
    <Link
      href={`/membros/${id}/editar`}
      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <Pencil size={14} /> Editar
    </Link>
  )}
  {isSuperAdmin && (
    <button
      onClick={handleDeletar}
      disabled={deletando}
      className="flex items-center gap-2 px-3 py-2 border border-red-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      <Trash2 size={14} /> {deletando ? 'Excluindo...' : 'Excluir'}
    </button>
  )}
</div>
      </div>

      {/* Card de identidade */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-5">
          {membro.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={membro.foto_url} alt={membro.nome_completo}
              className="w-20 h-20 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-bold shrink-0">
              {iniciais(membro.nome_completo)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{membro.nome_completo}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{membro.profissao || 'Profissão não informada'}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusCor[membro.status_membresia] ?? 'bg-gray-100 text-gray-700'}`}>
                {membro.status_membresia}
              </span>
              {membro.cidade && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={11} /> {membro.cidade}
                </span>
              )}
              {membro.data_admissao && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar size={11} /> Membro desde {formatarData(membro.data_admissao)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contato rápido */}
        {(membro.telefone || membro.email) && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
            {membro.telefone && (
              <a href={`https://wa.me/55${membro.telefone.replace(/\D/g, '')}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                <Smartphone size={14} /> {membro.telefone}
              </a>
            )}
            {membro.email && (
              <a href={`mailto:${membro.email}`}
                className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                <Mail size={14} /> {membro.email}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Informações pessoais */}
      <Secao icone={User} titulo="Informações pessoais">
        <Item label="Data de nascimento" valor={formatarData(membro.data_nascimento)} />
        <Item label="Gênero" valor={membro.genero} />
        <Item label="Estado civil" valor={membro.estado_civil} />
        <Item label="Naturalidade" valor={membro.naturalidade} />
        <Item label="Escolaridade" valor={membro.escolaridade} />
        <Item label="Profissão" valor={membro.profissao} />
      </Secao>

      {/* Contato e endereço */}
      <Secao icone={Phone} titulo="Contato e endereço">
        <Item label="Telefone / WhatsApp" valor={membro.telefone} />
        <Item label="E-mail" valor={membro.email} />
        <Item label="Endereço completo" valor={endereco || null} fullWidth />
      </Secao>

      {/* Família */}
      <Secao icone={Heart} titulo="Família">
        <Item label="Data de casamento" valor={formatarData(membro.data_casamento)} />
        <ItemBool label="Possui filhos" valor={membro.tem_filhos} />
        {membro.tem_filhos && (
          <Item label="Filhos" valor={membro.filhos_info} fullWidth />
        )}
      </Secao>

      {/* Igreja */}
      <Secao icone={Church} titulo="Dados eclesiásticos">
        <Item label="Status de membresia" valor={membro.status_membresia} />
        <Item label="Forma de admissão" valor={membro.forma_admissao} />
        <Item label="Data de admissão" valor={formatarData(membro.data_admissao)} />
        <Item label="Igreja de procedência" valor={membro.igreja_procedencia} />
        <Item label="Batismo nas águas" valor={formatarData(membro.data_batismo_aguas)} />
        <Item label="Cursos teológicos" valor={membro.cursos_teologicos} fullWidth />
        <ItemBool label="Concluiu integração" valor={membro.concluiu_integracao} />
      </Secao>

      {/* Saúde & Extra */}
      <Secao icone={Shield} titulo="Saúde e informações extras">
        <Item label="Tipo sanguíneo" valor={membro.tipo_sanguineo} />
        <Item label="Tamanho de camiseta" valor={membro.tamanho_camiseta} />
        <Item label="Alergias / restrições" valor={membro.alergias_restricoes} fullWidth />
        <Item label="Contato de emergência" valor={membro.contato_emergencia_nome} />
        <Item label="Telefone de emergência" valor={membro.contato_emergencia_telefone} />
        <Item label="Habilidades e talentos" valor={membro.habilidades} fullWidth />
        <ItemBool label="Autorização de imagem (LGPD)" valor={membro.autorizacao_imagem} />
      </Secao>

    </div>
  )
}