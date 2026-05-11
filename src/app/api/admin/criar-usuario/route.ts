import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
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

    console.log('Perfil do usuário:', perfil)

    if (perfil?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await req.json()
    const { email, senha, nome, role } = body

    console.log('Criando usuário:', { email, nome, role })

    if (!email || !senha || !nome) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const { data: novoUser, error: erroCriar } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    })

    console.log('Resultado criação:', { novoUser, erroCriar })

    if (erroCriar || !novoUser.user) {
      return NextResponse.json({ error: erroCriar?.message ?? 'Erro ao criar usuário' }, { status: 500 })
    }

    const { error: erroPerfil } = await supabaseAdmin.from('perfis').upsert({
      id: novoUser.user.id,
      role: role ?? 'USER',
      nome,
    })

    console.log('Erro perfil:', erroPerfil)

    if (erroPerfil) {
      return NextResponse.json({ error: erroPerfil.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: novoUser.user.id })

  } catch (error: any) {
    console.error('Erro geral:', error)
    return NextResponse.json({ error: error?.message ?? 'Erro interno' }, { status: 500 })
  }
}