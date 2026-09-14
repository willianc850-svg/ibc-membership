import { NextResponse } from 'next/server'
import { getCaller } from '@/lib/admin/usuarios'

export async function POST(req: Request) {
  const auth = await getCaller()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { usuario_id, membro_id } = await req.json() as {
    usuario_id?: string
    membro_id?: string | null
  }

  if (!usuario_id) {
    return NextResponse.json({ error: 'Usuário obrigatório.' }, { status: 400 })
  }

  const { caller } = auth

  await caller.admin.from('membros').update({ user_id: null }).eq('user_id', usuario_id)

  if (membro_id) {
    const { error } = await caller.admin
      .from('membros')
      .update({ user_id: usuario_id })
      .eq('id', membro_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
