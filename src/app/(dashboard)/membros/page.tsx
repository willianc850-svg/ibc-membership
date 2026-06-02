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
  const [membroDeletando, setMembroDeletando] = useState<{id: string; nome: string} | null>(null)
  const [erro, setErro] = useState('')

  async function buscarMembros() {
    setCarregando(true)
    const { data, error } = await supabase
      .from('membros')
      .select('id, nome_completo, telefone, email, status_membresia, bairro, foto_url, created_at')
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
  setMembroDeletando({ id, nome })
}

async function confirmarDeletar() {
  if (!membroDeletando) return

  try {
    await supabase.from('membros_celulas').delete().eq('membro_id', membroDeletando.id)
    await supabase.from('membros_ministerios').delete().eq('membro_id', membroDeletando.id)
    await supabase.from('reuniao_participantes').delete().eq('membro_id', membroDeletando.id)

    const { error } = await supabase.from('membros').delete().eq('id', membroDeletando.id)

    if (error) {
      if (error.code === 'PGRST204') {
        setErro('Este membro está vinculado a outros registros e não pode ser deletado.')
      } else {
        setErro('Erro ao deletar membro: ' + error.message)
      }
      setMembroDeletando(null)
      return
    }

    setMembros(membros.filter(m => m.id !== membroDeletando.id))
    setMembroDeletando(null)
  } catch (err) {
    setErro('Erro inesperado ao deletar')
    setMembroDeletando(null)
  }
}

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Membros</h1>
            <p className="text-sm text-gray-500">{membros.length} cadastrados</p>
          </div>
        </div>
        <Link
          href="/membros/novo"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} />
          Novo membro
        </Link>
      </div>

      {/* Busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 appearance-none">
            <option value="todos">Todos os status</option>
            <option value="Pastor">Pastor</option>
            <option value="Diretoria">Diretoria</option>
            <option value="Líder de Ministério">Líder de Ministério</option>
            <option value="Membro Ativo">Membro Ativo</option>
            <option value="Congregado">Congregado</option>
            <option value="Afastado">Afastado</option>
            <option value="Transferido">Transferido</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {carregando ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            Carregando...
          </div>
        ) : membrosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Nenhum membro encontrado</p>
            <p className="text-sm mt-1">
              {busca || filtroStatus !== 'todos'
                ? 'Tente ajustar os filtros'
                : 'Comece cadastrando o primeiro membro'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Membro</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden sm:table-cell">Contato</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden md:table-cell">Bairro</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {membrosFiltrados.map((membro) => {
                  const status = statusConfig[membro.status_membresia] ?? statusConfig['']
                  return (
                    <tr key={membro.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {membro.foto_url ? (
                            <img
                              src={membro.foto_url}
                              alt={membro.nome_completo}
                              className="w-9 h-9 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {iniciais(membro.nome_completo)}
                            </div>
                          )}
                          <span className="font-medium text-gray-900 text-sm">{membro.nome_completo}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-sm text-gray-700">{membro.telefone ?? '—'}</p>
                        <p className="text-xs text-gray-400">{membro.email ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">
                        {membro.bairro ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${status.cor}`}>
                          {status.icone}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/membros/${membro.id}`}
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            <Eye size={14} />
                            Ver
                          </Link>
                          {isAdmin && (
                            <Link
                              href={`/membros/${membro.id}/editar`}
                              className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium"
                            >
                              <Pencil size={14} />
                              Editar
                            </Link>
                          )}
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeletar(membro.id, membro.nome_completo)}
                              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium"
                            >
                              <Trash2 size={14} />
                              Deletar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ModalConfirmacao
        aberto={!!membroDeletando}
        titulo="Deletar membro"
        mensagem={`Tem certeza que deseja excluir "${membroDeletando?.nome}"? Esta ação não pode ser desfeita.`}
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

      {erro && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
          {erro}
        </div>
      )}
    </div>
  )
}