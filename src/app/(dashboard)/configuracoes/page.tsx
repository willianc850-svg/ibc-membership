'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePermissao } from '@/lib/hooks/usePermissao'
import {
  Settings, User, Lock, Save, Loader2,
  CheckCircle, UserPlus, Trash2, ShieldCheck, Shield,
} from 'lucide-react'

type UsuarioSistema = {
  id: string
  email: string
  nome: string
  role: 'SUPER_ADMIN' | 'USER'
  created_at: string
}

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"

function Mensagem({ msg }: { msg: { tipo: 'sucesso' | 'erro'; texto: string } }) {
  return (
    <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${
      msg.tipo === 'sucesso'
        ? 'bg-green-50 border border-green-200 text-green-700'
        : 'bg-red-50 border border-red-200 text-red-600'
    }`}>
      {msg.tipo === 'sucesso' && <CheckCircle size={16} />}
      {msg.texto}
    </div>
  )
}

export default function ConfiguracoesPage() {
  const { role, isSuperAdmin, carregando: carregandoRole } = usePermissao()
  // Conta
  const [email, setEmail] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [msgPerfil, setMsgPerfil] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)
  const [msgSenha, setMsgSenha] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  // Usuários (SUPER_ADMIN)
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([])
  const [carregandoUsers, setCarregandoUsers] = useState(false)
  const [mostrarFormUser, setMostrarFormUser] = useState(false)
  const [novoUser, setNovoUser] = useState({ nome: '', email: '', senha: '', role: 'USER' })
  const [criandoUser, setCriandoUser] = useState(false)
  const [msgUser, setMsgUser] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) setEmail(user.email)
    }
    carregar()
  }, [])

  useEffect(() => {
    if (isSuperAdmin) carregarUsuarios()
  }, [isSuperAdmin])

  async function carregarUsuarios() {
    setCarregandoUsers(true)
    const res = await fetch('/api/admin/listar-usuarios')
    const data = await res.json()
    if (Array.isArray(data)) setUsuarios(data)
    setCarregandoUsers(false)
  }

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault()
    setSalvandoPerfil(true)
    setMsgPerfil(null)
    const { error } = await supabase.auth.updateUser({ email })
    setMsgPerfil(error
      ? { tipo: 'erro', texto: 'Erro ao atualizar e-mail.' }
      : { tipo: 'sucesso', texto: 'E-mail atualizado! Verifique sua caixa de entrada.' }
    )
    setSalvandoPerfil(false)
  }

  async function salvarSenha(e: React.FormEvent) {
    e.preventDefault()
    setMsgSenha(null)
    if (novaSenha !== confirmarSenha) {
      setMsgSenha({ tipo: 'erro', texto: 'As senhas não coincidem.' }); return
    }
    if (novaSenha.length < 6) {
      setMsgSenha({ tipo: 'erro', texto: 'Mínimo 6 caracteres.' }); return
    }
    setSalvandoSenha(true)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setMsgSenha(error
      ? { tipo: 'erro', texto: 'Erro ao atualizar senha.' }
      : { tipo: 'sucesso', texto: 'Senha atualizada com sucesso!' }
    )
    if (!error) { setNovaSenha(''); setConfirmarSenha('') }
    setSalvandoSenha(false)
  }

  async function criarUsuario(e: React.FormEvent) {
    e.preventDefault()
    setMsgUser(null)
    setCriandoUser(true)

    const res = await fetch('/api/admin/criar-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoUser),
    })
    const data = await res.json()

    if (!res.ok) {
      setMsgUser({ tipo: 'erro', texto: data.error ?? 'Erro ao criar usuário.' })
    } else {
      setMsgUser({ tipo: 'sucesso', texto: 'Usuário criado com sucesso!' })
      setNovoUser({ nome: '', email: '', senha: '', role: 'USER' })
      setMostrarFormUser(false)
      carregarUsuarios()
    }
    setCriandoUser(false)
  }

  async function deletarUsuario(userId: string, nomeUser: string) {
    if (!confirm(`Excluir o usuário "${nomeUser}"? Esta ação não pode ser desfeita.`)) return

    const res = await fetch('/api/admin/deletar-usuario', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    if (res.ok) carregarUsuarios()
    else {
      const data = await res.json()
      alert(data.error ?? 'Erro ao excluir usuário.')
    }
  }

    async function alterarRole(userId: string, novoRole: 'SUPER_ADMIN' | 'ADMIN' | 'USER') {
      await supabase.from('perfis').update({ role: novoRole }).eq('id', userId)
    carregarUsuarios()
  }

  if (carregandoRole) return (
    <div className="flex items-center justify-center py-24 text-gray-400">Carregando...</div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div className="flex items-center gap-3 mb-2">
        <Settings size={24} className="text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-sm text-gray-500">Gerencie sua conta</p>
        </div>
      </div>

      {/* Gestão de usuários — apenas SUPER_ADMIN */}
      {isSuperAdmin && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-600" />
              <h2 className="font-semibold text-gray-900">Usuários do sistema</h2>
            </div>
            <button
              onClick={() => setMostrarFormUser(!mostrarFormUser)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors"
            >
              <UserPlus size={14} /> Novo usuário
            </button>
          </div>

          {/* Form novo usuário */}
          {mostrarFormUser && (
            <form onSubmit={criarUsuario} className="bg-gray-50 rounded-xl p-4 mb-5 space-y-3">
              <p className="text-sm font-medium text-gray-700">Criar novo usuário</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
                  <input className={inputClass} placeholder="Nome completo"
                    value={novoUser.nome} onChange={e => setNovoUser(p => ({ ...p, nome: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
                  <input type="email" className={inputClass} placeholder="email@exemplo.com"
                    value={novoUser.email} onChange={e => setNovoUser(p => ({ ...p, email: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Senha inicial</label>
                  <input type="password" className={inputClass} placeholder="Mínimo 6 caracteres"
                    value={novoUser.senha} onChange={e => setNovoUser(p => ({ ...p, senha: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nível de acesso</label>
                  <select className={inputClass} value={novoUser.role}
                    onChange={e => setNovoUser(p => ({ ...p, role: e.target.value }))}>
                    <option value="USER">Usuário</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>
              {msgUser && <Mensagem msg={msgUser} />}
              <div className="flex gap-2">
                <button type="submit" disabled={criandoUser}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
                  {criandoUser ? <><Loader2 size={14} className="animate-spin" /> Criando...</> : 'Criar usuário'}
                </button>
                <button type="button" onClick={() => setMostrarFormUser(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Lista de usuários */}
          {carregandoUsers ? (
            <p className="text-sm text-gray-400 text-center py-4">Carregando usuários...</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {usuarios.map(u => (
                <div key={u.id} className="flex items-center gap-3 py-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {u.nome?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{u.nome}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={u.role}
                      onChange={e => alterarRole(u.id, e.target.value as 'SUPER_ADMIN' | 'ADMIN' | 'USER')}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="USER">Usuário</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                    <button
                      onClick={() => deletarUsuario(u.id, u.nome)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Badge de nível de acesso */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-3">
        {role === 'SUPER_ADMIN'
          ? <ShieldCheck size={20} className="text-indigo-600" />
          : role === 'ADMIN'
          ? <ShieldCheck size={20} className="text-purple-500" />
          : <Shield size={20} className="text-gray-400" />
        }
        <div>
          <p className="text-sm font-medium text-gray-900">
            Seu nível de acesso: {
              role === 'SUPER_ADMIN' ? 'Super Admin' :
              role === 'ADMIN' ? 'Admin' : 'Usuário'
            }
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {role === 'SUPER_ADMIN'
              ? 'Você tem acesso total ao sistema e pode criar usuários.'
              : role === 'ADMIN'
              ? 'Você pode editar qualquer registro de membro.'
              : 'Você pode visualizar tudo e editar apenas o seu próprio registro.'
            }
          </p>
        </div>
      </div>

      {/* E-mail */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
          <User size={18} className="text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Dados da conta</h2>
        </div>
        <form onSubmit={salvarPerfil} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" className={inputClass} value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>
          {msgPerfil && <Mensagem msg={msgPerfil} />}
          <button type="submit" disabled={salvandoPerfil}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors">
            {salvandoPerfil ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : <><Save size={16} /> Salvar e-mail</>}
          </button>
        </form>
      </div>

      {/* Senha */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
          <Lock size={18} className="text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Alterar senha</h2>
        </div>
        <form onSubmit={salvarSenha} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input type="password" className={inputClass} placeholder="Mínimo 6 caracteres"
              value={novaSenha} onChange={e => setNovaSenha(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
            <input type="password" className={inputClass} placeholder="Repita a nova senha"
              value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} required />
          </div>
          {msgSenha && <Mensagem msg={msgSenha} />}
          <button type="submit" disabled={salvandoSenha}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors">
            {salvandoSenha ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : <><Save size={16} /> Alterar senha</>}
          </button>
        </form>
      </div>

    </div>
  )
}