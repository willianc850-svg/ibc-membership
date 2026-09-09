import { NextResponse } from 'next/server'
import {
  getCaller,
  origemDoPedido,
  podeGerenciarAlvo,
  redirectAuth,
  type Role,
} from '@/lib/admin/usuarios'

type PerfilRow = {
  id: string
  role: Role
  nome: string | null
  criado_por: string | null
  convite_pendente: boolean | null
}

export async function GET() {
  const auth = await getCaller()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { caller } = auth
  let { data: perfis, error } = await caller.admin
    .from('perfis')
    .select('id, role, nome, criado_por, convite_pendente')

  if (error) {
    const fallback = await caller.admin.from('perfis').select('id, role')
    if (fallback.error) return NextResponse.json({ error: fallback.error.message }, { status: 400 })
    perfis = (fallback.data ?? []).map((p) => ({
      ...p,
      nome: null,
      criado_por: null,
      convite_pendente: null,
    }))
    error = null
  }

  const { data: authData, error: authError } = await caller.admin.auth.admin.listUsers({
    perPage: 1000,
  })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  const authById = new Map(authData.users.map((u) => [u.id, u]))

  let lista = ((perfis ?? []) as PerfilRow[]).map((p) => {
    const authUser = authById.get(p.id)
    return {
      id: p.id,
      email: authUser?.email ?? '',
      nome: p.nome ?? (authUser?.user_metadata?.nome as string | undefined) ?? '',
      role: p.role,
      created_at: authUser?.created_at ?? '',
      convite_pendente: Boolean(
        p.convite_pendente ?? authUser?.user_metadata?.must_set_password,
      ),
      criado_por: p.criado_por,
    }
  })

  if (caller.role === 'ADMIN' || caller.role === 'TESOUREIRO') {
    lista = lista.filter((u) => u.role === 'USER' && u.criado_por === caller.userId)
  }

  return NextResponse.json({ usuarios: lista })
}

export async function POST(req: Request) {
  const auth = await getCaller()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { caller } = auth
  const body = await req.json()
  const email = String(body.email ?? '').trim().toLowerCase()
  const nome = String(body.nome ?? '').trim()
  const role = body.role as Role

  if (!email || !nome) {
    return NextResponse.json({ error: 'Nome e e-mail são obrigatórios.' }, { status: 400 })
  }

  if ((caller.role === 'ADMIN' || caller.role === 'TESOUREIRO') && role !== 'USER') {
    return NextResponse.json({ error: 'Este perfil só pode criar usuário.' }, { status: 403 })
  }

  if (caller.role === 'SUPER_ADMIN' && !['ADMIN', 'TESOUREIRO', 'USER'].includes(role)) {
    return NextResponse.json({ error: 'Role inválida.' }, { status: 400 })
  }

  const origin = origemDoPedido(req)
  const { data, error: inviteError } = await caller.admin.auth.admin.inviteUserByEmail(email, {
    data: { nome, role, must_set_password: true },
    redirectTo: redirectAuth(origin),
  })

  if (inviteError || !data.user) {
    return NextResponse.json(
      { error: inviteError?.message ?? 'Erro ao enviar convite.' },
      { status: 400 },
    )
  }

  const { error: perfilError } = await caller.admin.from('perfis').upsert(
    {
      id: data.user.id,
      role,
      nome,
      criado_por: caller.userId,
      convite_pendente: true,
    },
    { onConflict: 'id' },
  )

  if (perfilError) {
    await caller.admin.auth.admin.deleteUser(data.user.id)
    return NextResponse.json({ error: perfilError.message }, { status: 400 })
  }

  return NextResponse.json({ usuario: { id: data.user.id, email, nome, role } })
}

export async function PUT(req: Request) {
  const auth = await getCaller()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { caller } = auth
  const { usuario_id, role, nome } = await req.json()

  const { data: alvo, error } = await caller.admin
    .from('perfis')
    .select('id, role, criado_por')
    .eq('id', usuario_id)
    .single()

  if (error || !alvo) {
    return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
  }

  if (!podeGerenciarAlvo(caller, alvo as { id: string; role: Role; criado_por: string | null })) {
    return NextResponse.json({ error: 'Não pode editar este usuário.' }, { status: 403 })
  }

  const updates: Record<string, unknown> = {}

  if (typeof nome === 'string' && nome.trim()) {
    updates.nome = nome.trim()
  }

  if (role) {
    if (caller.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Admin não pode alterar o nível de acesso.' }, { status: 403 })
    }
    if (!['ADMIN', 'TESOUREIRO', 'USER'].includes(role)) {
      return NextResponse.json({ error: 'Role inválida.' }, { status: 400 })
    }
    updates.role = role
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nada para atualizar.' }, { status: 400 })
  }

  const { error: updateError } = await caller.admin
    .from('perfis')
    .update(updates)
    .eq('id', usuario_id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })

  return NextResponse.json({ sucesso: true })
}

export async function DELETE(req: Request) {
  const auth = await getCaller()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { caller } = auth
  const { usuario_id } = await req.json()

  if (usuario_id === caller.userId) {
    return NextResponse.json({ error: 'Não pode deletar a si mesmo.' }, { status: 400 })
  }

  const { data: alvo, error } = await caller.admin
    .from('perfis')
    .select('id, role, criado_por')
    .eq('id', usuario_id)
    .single()

  if (error || !alvo) {
    return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
  }

  if (!podeGerenciarAlvo(caller, alvo as { id: string; role: Role; criado_por: string | null })) {
    return NextResponse.json({ error: 'Não pode excluir este usuário.' }, { status: 403 })
  }

  const { error: authError } = await caller.admin.auth.admin.deleteUser(usuario_id)
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  await caller.admin.from('perfis').delete().eq('id', usuario_id)

  return NextResponse.json({ sucesso: true })
}
