'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | null

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
    isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN',
    isUser: role === 'USER',
  }
}