import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TESOUREIRO' | 'USER'

export type Caller = {
  userId: string
  role: Role
  admin: ReturnType<typeof createAdminClient>
}

export function origemDoPedido(request: Request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') || 'http'
  if (host) {
    const local = host.startsWith('localhost') || host.startsWith('127.0.0.1')
    return `${local ? 'http' : proto}://${host}`
  }
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000'
}

export function redirectAuth(origin: string) {
  return `${origin}/auth/callback`
}

export async function getCaller(): Promise<
  { ok: true; caller: Caller } | { ok: false; status: number; error: string }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, status: 401, error: 'Não autenticado' }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = perfil?.role as Role | undefined
  if (!role || !['SUPER_ADMIN', 'ADMIN', 'TESOUREIRO'].includes(role)) {
    return { ok: false, status: 403, error: 'Não autorizado' }
  }

  return {
    ok: true,
    caller: { userId: user.id, role, admin: createAdminClient() },
  }
}

export function podeGerenciarAlvo(
  caller: Caller,
  alvo: { id: string; role: Role; criado_por: string | null },
) {
  if (alvo.id === caller.userId) return false
  if (caller.role === 'SUPER_ADMIN') return alvo.role !== 'SUPER_ADMIN'
  return alvo.role === 'USER' && alvo.criado_por === caller.userId
}
