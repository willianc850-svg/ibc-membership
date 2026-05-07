import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('id', user.id)
    .single()

  if (perfil?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { data: perfis } = await supabase
    .from('perfis')
    .select('id, role, nome, created_at')
    .order('created_at')

  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()

  const resultado = perfis?.map(p => {
    const authUser = users.find(u => u.id === p.id)
    return { ...p, email: authUser?.email ?? '' }
  }) ?? []

  return NextResponse.json(resultado)
}