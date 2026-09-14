'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TESOUREIRO' | 'USER' | null

export function usePermissao() {
  const [role, setRole] = useState<Role>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setCarregando(false); return }

      setUserId(user.id)

      const { data } = await supabase
        .from('perfis')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole((data?.role as Role) ?? 'USER')
      setCarregando(false)
    }
    carregar()
  }, [])

  return {
    role,
    userId,
    carregando,
    isSuperAdmin: role === 'SUPER_ADMIN',
    isTesoureiro: role === 'TESOUREIRO',
    podeTesouraria: role === 'SUPER_ADMIN' || role === 'TESOUREIRO',
    podeDocumentos: role === 'SUPER_ADMIN' || role === 'ADMIN',
    podeReunioesRelatorios: role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'TESOUREIRO',
    isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'TESOUREIRO',
    isUser: role === 'USER',
  }
}
