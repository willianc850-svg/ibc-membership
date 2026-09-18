'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Users,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  UserMinus,
  Eye,
  Smartphone,
} from 'lucide-react'
import { usePermissao } from '@/lib/hooks/usePermissao'
import { Pencil, Trash2 } from 'lucide-react'
import ModalConfirmacao from '@/components/ModalConfirmacao'

type Membro = {
  id: string
  nome_completo: string
  telefone: string | null
  email: string | null
  status_membresia: string
  bairro: string | null
  foto_url: string | null
  created_at: string
  user_id: string | null
}

const statusConfig: Record<string, { label: string; cor: string; icone: React.ReactNode }> = {
  'Pastor':              { label: 'Pastor',              cor: 'bg-red-100 text-red-700',     icone: <UserCheck size={12} /> },
  'Diretoria':           { label: 'Diretoria',           cor: 'bg-indigo-100 text-indigo-700', icone: <UserCheck size={12} /> },
  'Líder de Ministério': { label: 'Líder de Ministério', cor: 'bg-purple-100 text-purple-700', icone: <UserCheck size={12} /> },
  'Membro Ativo':        { label: 'Membro Ativo',        cor: 'bg-green-100 text-green-700',  icone: <UserCheck size={12} /> },
  'Congregado':          { label: 'Congregado',          cor: 'bg-blue-100 text-blue-700',    icone: <Users size={12} /> },
  'Afastado':            { label: 'Afastado',            cor: 'bg-yellow-100 text-yellow-700', icone: <UserMinus size={12} /> },
  'Transferido':         { label: 'Transferido',         cor: 'bg-gray-100 text-gray-700',    icone: <UserX size={12} /> },
  '':                    { label: 'Sem status',          cor: 'bg-gray-50 text-gray-500',    icone: <Users size={12} /> },
}

export default function MembrosPage() {
  const [membros, setMembros] = useState<Membro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const supabase = createClient()
  const { isAdmin, isSuperAdmin, userId } = usePermissao()
  const [membroDeletando, setMembroDeletando] = useState<{
    id: string
    nome: string
    lideracas?: string[]
  } | null>(null)  
  const [erro, setErro] = useState('')

  async function buscarMembros() {
    setCarregando(true)
    const { data, error } = await supabase
      .from('membros')
      .select('id, nome_completo, telefone, email, status_membresia, bairro, foto_url, created_at, user_id')
      .order('nome_completo')

    if (!error && data) setMembros(data)
    setCarregando(false)
  }

useEffect(() => {
    let ativo = true

    async function inicializar() {
      if (!ativo) return
      await buscarMembros()
    }

    inicializar()

    return () => {
      ativo = false
    }
  }, [])

  const membrosFiltrados = membros.filter((m) => {
    const buscaOk = m.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
      m.email?.toLowerCase().includes(busca.toLowerCase()) ||
      m.telefone?.includes(busca)
    const statusOk = filtroStatus === 'todos' || m.status_membresia === filtroStatus
    return buscaOk && statusOk
  })

  function iniciais(nome: string) {
    return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }

async function handleDeletar(id: string, nome: string) {
  try {
    // Busca se o membro é líder de algum ministério
    const { data: ministerios } = await supabase
      .from('ministerios')
      .select('id, nome')
      .eq('lider_id', id)

    // Busca se o membro é líder de algum PGM
    const { data: pgms } = await supabase
      .from('pgm')
      .select('id, nome')
      .eq('lider_id', id)

    const lideracas = [
      ...(ministerios?.map(m => `Ministério: ${m.nome}`) || []),
      ...(pgms?.map(p => `PGM: ${p.nome}`) || []),
    ]

    setMembroDeletando({
      id,
      nome,
      lideracas, // Passa as lideranças
    })
  } catch {
    setErro('Erro ao verificar se o membro é líder')
  }
}

async function confirmarDeletar() {
    if (!membroDeletando) return

    try {
      // Remove as lideranças (set lider_id para NULL)
      await supabase
        .from('ministerios')
        .update({ lider_id: null })
        .eq('lider_id', membroDeletando.id)

      await supabase
        .from('pgm')
        .update({ lider_id: null })
        .eq('lider_id', membroDeletando.id)

      // Remove vínculos com células, ministérios e reuniões
      await supabase.from('membros_celulas').delete().eq('membro_id', membroDeletando.id)
      await supabase.from('membros_ministerios').delete().eq('membro_id', membroDeletando.id)
      await supabase.from('reuniao_participantes').delete().eq('membro_id', membroDeletando.id)

      // Deleta o membro
      const { error } = await supabase.from('membros').delete().eq('id', membroDeletando.id)

      if (error) {
        setErro('Erro ao deletar membro: ' + error.message)
        setMembroDeletando(null)
        return
      }

      // Remove da lista
      setMembros(membros.filter(m => m.id !== membroDeletando.id))
      setMembroDeletando(null)
    } catch {
      setErro('Erro inesperado ao deletar')
      setMembroDeletando(null)
    }
  }

  function Avatar({ membro, tamanho = 'w-11 h-11 text-sm' }: { membro: Membro; tamanho?: string }) {
    if (membro.foto_url) {
      return (
        <img
          src={membro.foto_url}
          alt={membro.nome_completo}
          className={`${tamanho} rounded-full object-cover shrink-0`}
        />
      )
    }
    return (
      <div className={`${tamanho} rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0`}>
        {iniciais(membro.nome_completo)}
      </div>
    )
  }

  function Acoes({ membro, compacto = false }: { membro: Membro; compacto?: boolean }) {
    const btn = compacto
      ? 'inline-flex items-center justify-center min-h-11 min-w-11 rounded-xl text-sm font-medium'
      : 'inline-flex items-center gap-1 min-h-9 px-2 text-xs font-medium'
    const ctx = compacto ? 'Mobile' : 'Desktop'
    return (
      <div className={`flex items-center ${compacto ? 'gap-1' : 'justify-end gap-2'}`}>
        <Link href={`/membros/${membro.id}`} data-cy={`btnVerMembro${ctx}-${membro.id}`} className={`${btn} text-indigo-600 hover:bg-indigo-50`}>
          <Eye size={compacto ? 18 : 14} />
          {!compacto && 'Ver'}
        </Link>
        {(isAdmin || membro.user_id === userId) && (
          <Link href={`/membros/${membro.id}/editar`} data-cy={`btnEditarMembro${ctx}-${membro.id}`} className={`${btn} text-amber-600 hover:bg-amber-50`}>
            <Pencil size={compacto ? 18 : 14} />
            {!compacto && 'Editar'}
          </Link>
        )}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => handleDeletar(membro.id, membro.nome_completo)}
            data-cy={`btnDeletarMembro${ctx}-${membro.id}`}
            className={`${btn} text-red-600 hover:bg-red-50`}
          >
            <Trash2 size={compacto ? 18 : 14} />
            {!compacto && 'Deletar'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div data-cy="pageMembros">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Membros</h1>
            <p data-cy="totalMembros" className="text-sm text-gray-500">{membros.length} cadastrados</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/membros/pendentes"
              data-cy="btnCadastrosPendentes"
              className="inline-flex items-center justify-center min-h-11 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl"
            >
              Cadastros pendentes
            </Link>
            <Link
              href="/membros/qr"
              data-cy="btnQrCadastro"
              className="inline-flex items-center justify-center min-h-11 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl"
            >
              QR de cadastro
            </Link>
            <Link
              href="/membros/novo"
              data-cy="btnNovoMembro"
              className="inline-flex items-center justify-center gap-2 min-h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 rounded-xl transition-colors"
            >
              <Plus size={16} />
              Novo membro
            </Link>
          </div>
        )}
      </div>

      {erro && (
        <div data-cy="msgErroMembros" className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{erro}</div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            data-cy="inputBuscaMembro"
            className="w-full min-h-11 pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
          />
        </div>
        <div className="relative sm:w-56">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            data-cy="selectFiltroStatus"
            className="w-full min-h-11 pl-9 pr-8 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 appearance-none"
          >
            <option value="todos" data-cy="optFiltroStatusTodos">Todos os status</option>
            <option value="Pastor" data-cy="optFiltroStatusPastor">Pastor</option>
            <option value="Diretoria" data-cy="optFiltroStatusDiretoria">Diretoria</option>
            <option value="Líder de Ministério" data-cy="optFiltroStatusLider">Líder de Ministério</option>
            <option value="Membro Ativo" data-cy="optFiltroStatusMembroAtivo">Membro Ativo</option>
            <option value="Congregado" data-cy="optFiltroStatusCongregado">Congregado</option>
            <option value="Afastado" data-cy="optFiltroStatusAfastado">Afastado</option>
            <option value="Transferido" data-cy="optFiltroStatusTransferido">Transferido</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {carregando ? (
          <div data-cy="loadingMembros" className="flex items-center justify-center py-16 text-gray-400">
            Carregando...
          </div>
        ) : membrosFiltrados.length === 0 ? (
          <div data-cy="vazioMembros" className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Nenhum membro encontrado</p>
            <p className="text-sm mt-1">
              {busca || filtroStatus !== 'todos'
                ? 'Tente ajustar os filtros'
                : 'Comece cadastrando o primeiro membro'}
            </p>
          </div>
        ) : (
          <>
            <div data-cy="listaMembrosMobile" className="md:hidden divide-y divide-gray-100">
              {membrosFiltrados.map((membro) => {
                const status = statusConfig[membro.status_membresia] ?? statusConfig['']
                const tel = membro.telefone?.replace(/\D/g, '') ?? ''
                return (
                  <div key={membro.id} data-cy={`membroItemMobile-${membro.id}`} className="p-4 flex gap-3">
                    <Avatar membro={membro} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm leading-snug">{membro.nome_completo}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${status.cor}`}>
                        {status.icone}
                        {status.label}
                      </span>
                      {membro.telefone && (
                        <a
                          href={`https://wa.me/55${tel}`}
                          target="_blank"
                          rel="noreferrer"
                          data-cy={`btnWhatsappMembroMobile-${membro.id}`}
                          className="mt-2 inline-flex items-center gap-1.5 min-h-11 text-sm text-green-700"
                        >
                          <Smartphone size={16} /> {membro.telefone}
                        </a>
                      )}
                    </div>
                    <Acoes membro={membro} compacto />
                  </div>
                )
              })}
            </div>
            <div data-cy="listaMembrosDesktop" className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Membro</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Contato</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Bairro</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {membrosFiltrados.map((membro) => {
                    const status = statusConfig[membro.status_membresia] ?? statusConfig['']
                    return (
                      <tr key={membro.id} data-cy={`membroItemDesktop-${membro.id}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar membro={membro} tamanho="w-9 h-9 text-xs" />
                            <span className="font-medium text-gray-900 text-sm">{membro.nome_completo}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">{membro.telefone ?? '—'}</p>
                          <p className="text-xs text-gray-400">{membro.email ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {membro.bairro ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${status.cor}`}>
                            {status.icone}
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Acoes membro={membro} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <ModalConfirmacao
        aberto={!!membroDeletando}
        titulo="Deletar membro"
        mensagem={
          membroDeletando?.lideracas && membroDeletando.lideracas.length > 0
            ? `${membroDeletando.nome} é líder de:\n\n${membroDeletando.lideracas.join('\n')}\n\nAo deletar, essas lideranças serão removidas. Tem certeza?`
            : `Tem certeza que deseja excluir "${membroDeletando?.nome}"? Esta ação não pode ser desfeita.`
        }
        textoBotaoPrimario="Deletar"
        textoBotaoSecundario="Cancelar"
        carregando={false}
        perigo={true}
        onConfirmar={confirmarDeletar}
        onCancelar={() => {
          setMembroDeletando(null)
          setErro('')
        }}
      />
    </div>
  )
}