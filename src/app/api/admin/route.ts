import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = createServerComponentClient({ cookies: () => ({}) })
  
  // Pega o usuário logado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  // Pega o role do usuário
  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('usuario_id', user.id)
    .single()

  // Só SUPER_ADMIN e ADMIN podem acessar
  if (!['SUPER_ADMIN', 'ADMIN'].includes(perfil?.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  // SUPER_ADMIN vê todos, ADMIN vê apenas os que criou
  let query = supabase
    .from('perfis')
    .select('*, auth.users(email, created_at)')

  if (perfil.role === 'ADMIN') {
    query = query.eq('criado_por', user.id)
  }

  const { data, error } = await query

  return NextResponse.json({ usuarios: data, error })
}

export async function POST(req: NextRequest) {
  const supabase = createServerComponentClient({ cookies: () => ({}) })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('usuario_id', user.id)
    .single()

  if (!['SUPER_ADMIN', 'ADMIN'].includes(perfil?.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { email, password, role } = await req.json()

  // ADMIN não pode criar SUPER_ADMIN
  if (perfil.role === 'ADMIN' && role === 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'ADMIN não pode criar SUPER_ADMIN' }, { status: 403 })
  }

  // Cria usuário no Auth
  const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  // Cria perfil
  const { error: perfilError } = await supabase.from('perfis').insert({
    usuario_id: newUser.user.id,
    role,
    criado_por: user.id,
  })

  if (perfilError) return NextResponse.json({ error: perfilError.message }, { status: 400 })

  // Log de auditoria
  await supabase.from('audit_logs').insert({
    usuario_id: user.id,
    acao: 'CRIAR_USUARIO',
    tabela: 'perfis',
    registro_id: newUser.user.id,
    dados_novos: { email, role },
  })

  return NextResponse.json({ usuario: newUser.user })
}

export async function PUT(req: NextRequest) {
  const supabase = createServerComponentClient({ cookies: () => ({}) })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('usuario_id', user.id)
    .single()

  if (!['SUPER_ADMIN', 'ADMIN'].includes(perfil?.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { usuario_id, role } = await req.json()

  // Verifica se pode editar (ADMIN só edita quem criou)
  if (perfil.role === 'ADMIN') {
    const { data: alvo } = await supabase
      .from('perfis')
      .select('criado_por')
      .eq('usuario_id', usuario_id)
      .single()

    if (alvo?.criado_por !== user.id) {
      return NextResponse.json({ error: 'Não pode editar este usuário' }, { status: 403 })
    }

    // ADMIN não pode mudar para SUPER_ADMIN
    if (role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'ADMIN não pode criar SUPER_ADMIN' }, { status: 403 })
    }
  }

  const { error } = await supabase
    .from('perfis')
    .update({ role })
    .eq('usuario_id', usuario_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Log de auditoria
  await supabase.from('audit_logs').insert({
    usuario_id: user.id,
    acao: 'EDITAR_USUARIO',
    tabela: 'perfis',
    registro_id: usuario_id,
    dados_novos: { role },
  })

  return NextResponse.json({ sucesso: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerComponentClient({ cookies: () => ({}) })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('usuario_id', user.id)
    .single()

  // Só SUPER_ADMIN pode deletar
  if (perfil?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { usuario_id } = await req.json()

  // Não pode deletar a si mesmo
  if (usuario_id === user.id) {
    return NextResponse.json({ error: 'Não pode deletar a si mesmo' }, { status: 400 })
  }

  // Deleta do Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(usuario_id)

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  // Deleta perfil
  const { error: perfilError } = await supabase
    .from('perfis')
    .delete()
    .eq('usuario_id', usuario_id)

  if (perfilError) return NextResponse.json({ error: perfilError.message }, { status: 400 })

  // Log de auditoria
  await supabase.from('audit_logs').insert({
    usuario_id: user.id,
    acao: 'DELETAR_USUARIO',
    tabela: 'perfis',
    registro_id: usuario_id,
  })

  return NextResponse.json({ sucesso: true })
}