import { NextResponse } from 'next/server'
import { getCaller, origemDoPedido, redirectAuth } from '@/lib/admin/usuarios'

export async function GET() {
  const auth = await getCaller()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { data, error } = await auth.caller.admin
    .from('cadastros_pendentes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ cadastros: data ?? [] })
}

export async function POST(req: Request) {
  const auth = await getCaller()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id, acao } = await req.json() as { id?: string; acao?: 'aprovar' | 'recusar' }
  if (!id || (acao !== 'aprovar' && acao !== 'recusar')) {
    return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 })
  }

  const admin = auth.caller.admin
  const { data: pendente, error: loadError } = await admin
    .from('cadastros_pendentes')
    .select('*')
    .eq('id', id)
    .single()

  if (loadError || !pendente) {
    return NextResponse.json({ error: 'Cadastro não encontrado.' }, { status: 404 })
  }

  if (acao === 'recusar') {
    await admin.from('cadastros_pendentes').delete().eq('id', id)
    return NextResponse.json({ ok: true })
  }

  const { data: membro, error: insertError } = await admin
    .from('membros')
    .insert({
      nome_completo: pendente.nome_completo,
      telefone: pendente.telefone,
      email: pendente.email,
      foto_url: pendente.foto_url,
      status_membresia: 'Congregado',
    })
    .select('id')
    .single()

  if (insertError || !membro) {
    return NextResponse.json(
      { error: insertError?.message ?? 'Erro ao criar membro.' },
      { status: 400 },
    )
  }

  const email = String(pendente.email ?? '').trim().toLowerCase()
  if (email) {
    const origin = origemDoPedido(req)
    const { data: convite } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { nome: pendente.nome_completo, role: 'USER', must_set_password: true },
      redirectTo: redirectAuth(origin),
    })
    if (convite?.user) {
      await admin.from('perfis').upsert({
        id: convite.user.id,
        role: 'USER',
        nome: pendente.nome_completo,
        criado_por: auth.caller.userId,
        convite_pendente: true,
      }, { onConflict: 'id' })
      await admin.from('membros').update({ user_id: convite.user.id }).eq('id', membro.id)
    }
  }

  await admin.from('cadastros_pendentes').delete().eq('id', id)
  return NextResponse.json({ ok: true, membro_id: membro.id })
}
