import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('id', user.id)
    .single()

  if (perfil?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { email, senha, nome, role } = await req.json()

  if (!email || !senha || !nome) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  const { data: novoUser, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })

  if (error || !novoUser.user) {
    return NextResponse.json({ error: error?.message ?? 'Erro ao criar usuário' }, { status: 500 })
  }

  await supabaseAdmin.from('perfis').upsert({
    id: novoUser.user.id,
    role: role ?? 'USER',
    nome,
  })

  return NextResponse.json({ ok: true, id: novoUser.user.id })
}