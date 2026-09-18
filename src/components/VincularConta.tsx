'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Link2, Loader2 } from 'lucide-react'

type Usuario = { id: string; nome: string; email: string; membro_id: string | null }
type MembroOpt = { id: string; nome_completo: string; user_id: string | null }

export function VincularContaMembro({
  membroId,
  userIdAtual,
}: {
  membroId: string
  userIdAtual: string | null
}) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [valor, setValor] = useState(userIdAtual ?? '')
  const [userIdVisto, setUserIdVisto] = useState(userIdAtual)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')

  if (userIdAtual !== userIdVisto) {
    setUserIdVisto(userIdAtual)
    setValor(userIdAtual ?? '')
  }

  useEffect(() => {
    fetch('/api/admin/usuarios')
      .then((r) => r.json())
      .then((d) => setUsuarios(d.usuarios ?? []))
  }, [])

  async function salvar(usuarioId: string) {
    setSalvando(true)
    setMsg('')
    const anterior = valor
    const res = await fetch('/api/admin/vincular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario_id: usuarioId || anterior,
        membro_id: usuarioId ? membroId : null,
      }),
    })
    const data = await res.json()
    setSalvando(false)
    if (!res.ok) {
      setMsg(data.error ?? 'Não foi possível vincular.')
      return
    }
    setValor(usuarioId)
    setMsg(usuarioId ? 'Conta vinculada. O usuário já pode editar esta ficha.' : 'Vínculo removido.')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Link2 size={16} className="text-indigo-600" />
        <p className="text-sm font-medium text-gray-900">Conta de login</p>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Sem este vínculo, o membro convidado não consegue editar o próprio cadastro.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          className="flex-1 min-h-11 border border-gray-300 rounded-xl px-3 text-sm bg-white text-gray-900"
          value={valor}
          disabled={salvando}
          onChange={(e) => salvar(e.target.value)}
          data-cy="selectContaLogin"
        >
          <option value="" data-cy="optSemConta">Nenhuma conta</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id} data-cy={`optContaLogin-${u.id}`}>
              {(u.nome || u.email) + (u.membro_id && u.membro_id !== membroId ? ' (já vinculada)' : '')}
            </option>
          ))}
        </select>
        {salvando && <Loader2 data-cy="loadingVinculoConta" size={18} className="animate-spin text-gray-400 self-center" />}
      </div>
      {msg && <p data-cy="msgVinculoConta" className="text-xs text-gray-500 mt-2">{msg}</p>}
    </div>
  )
}

export function VincularFichaUsuario({
  usuarioId,
  membroIdAtual,
  onAtualizado,
}: {
  usuarioId: string
  membroIdAtual: string | null
  onAtualizado: () => void
}) {
  const [membros, setMembros] = useState<MembroOpt[]>([])
  const [valor, setValor] = useState(membroIdAtual ?? '')
  const [membroVisto, setMembroVisto] = useState(membroIdAtual)
  const [salvando, setSalvando] = useState(false)

  if (membroIdAtual !== membroVisto) {
    setMembroVisto(membroIdAtual)
    setValor(membroIdAtual ?? '')
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.from('membros').select('id, nome_completo, user_id').order('nome_completo')
      .then(({ data }) => setMembros(data ?? []))
  }, [])

  async function salvar(membroId: string) {
    setSalvando(true)
    await fetch('/api/admin/vincular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: usuarioId, membro_id: membroId || null }),
    })
    setValor(membroId)
    setSalvando(false)
    onAtualizado()
  }

  return (
    <select
      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 min-h-9 max-w-[160px] bg-white text-gray-700"
      value={valor}
      disabled={salvando}
      title="Ficha de membro vinculada"
      onChange={(e) => salvar(e.target.value)}
      data-cy={`selectFichaUsuario-${usuarioId}`}
    >
      <option value="" data-cy={`optSemFicha-${usuarioId}`}>Sem ficha</option>
      {membros.map((m) => (
        <option key={m.id} value={m.id} data-cy={`optFichaUsuario-${usuarioId}-${m.id}`}>{m.nome_completo}</option>
      ))}
    </select>
  )
}
