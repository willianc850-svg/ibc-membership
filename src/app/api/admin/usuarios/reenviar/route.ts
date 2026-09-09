import { NextResponse } from 'next/server'
import {
  getCaller,
  origemDoPedido,
  podeGerenciarAlvo,
  redirectAuth,
  type Role,
} from '@/lib/admin/usuarios'

export async function POST(req: Request) {
  const auth = await getCaller()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { caller } = auth
  const { usuario_id } = await req.json()
  const redirectTo = redirectAuth(origemDoPedido(req))

  const { data: alvo, error } = await caller.admin
    .from('perfis')
    .select('id, role, criado_por')
    .eq('id', usuario_id)
    .single()

  if (error || !alvo) {
    return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
  }

  if (!podeGerenciarAlvo(caller, alvo as { id: string; role: Role; criado_por: string | null })) {
    return NextResponse.json({ error: 'Não pode reenviar convite deste usuário.' }, { status: 403 })
  }

  const { data: authUser, error: getError } = await caller.admin.auth.admin.getUserById(usuario_id)
  const email = authUser.user?.email
  if (getError || !email) {
    return NextResponse.json({ error: 'E-mail do usuário não encontrado.' }, { status: 400 })
  }

  const { error: resetError } = await caller.admin.auth.resetPasswordForEmail(email, {
    redirectTo,
  })
  if (resetError) {
    return NextResponse.json({ error: resetError.message }, { status: 400 })
  }

  await caller.admin
    .from('perfis')
    .update({ convite_pendente: true })
    .eq('id', usuario_id)

  await caller.admin.auth.admin.updateUserById(usuario_id, {
    user_metadata: { ...authUser.user?.user_metadata, must_set_password: true },
  })

  return NextResponse.json({ sucesso: true })
}
