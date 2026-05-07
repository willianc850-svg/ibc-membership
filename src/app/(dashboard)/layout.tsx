'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Users, UsersRound, HandHeart,
  BarChart3, Settings, LogOut, Church, Menu, X,
} from 'lucide-react'
import { useState } from 'react'

const menuItems = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/membros',      label: 'Membros',      icon: Users           },
  { href: '/pgm',          label: 'PGMs',         icon: UsersRound      },
  { href: '/ministerios',  label: 'Ministérios',  icon: HandHeart       },
  { href: '/relatorios',   label: 'Relatórios',   icon: BarChart3       },
  { href: '/configuracoes',label: 'Configurações',icon: Settings        },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [menuAberto, setMenuAberto] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function isAtivo(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>

      {/* Sidebar desktop */}
      <aside style={{
        width: '256px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 40,
      }}
        className="hidden lg:flex"
      >
        {/* Logo */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#4f46e5', borderRadius: '12px', padding: '8px' }}>
              <Church size={20} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#111827', fontSize: '14px', margin: 0 }}>IBC Membership</p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Gestão de Membros</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {menuItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '2px',
                textDecoration: 'none',
                backgroundColor: isAtivo(href) ? '#eef2ff' : 'transparent',
                color: isAtivo(href) ? '#4338ca' : '#4b5563',
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Sair */}
        <div style={{ padding: '12px', borderTop: '1px solid #f3f4f6' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              width: '100%',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#4b5563',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fef2f2'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#dc2626'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#4b5563'
            }}
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {menuAberto && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}
          className="lg:hidden"
        >
          <div
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setMenuAberto(false)}
          />
          <aside style={{
            width: '256px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'relative',
            zIndex: 51,
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ backgroundColor: '#4f46e5', borderRadius: '12px', padding: '8px' }}>
                  <Church size={20} color="white" />
                </div>
                <p style={{ fontWeight: 700, color: '#111827', fontSize: '14px', margin: 0 }}>IBC Membership</p>
              </div>
              <button onClick={() => setMenuAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>
            <nav style={{ flex: 1, padding: '12px' }}>
              {menuItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuAberto(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '2px',
                    textDecoration: 'none',
                    backgroundColor: isAtivo(href) ? '#eef2ff' : 'transparent',
                    color: isAtivo(href) ? '#4338ca' : '#4b5563',
                  }}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </nav>
            <div style={{ padding: '12px', borderTop: '1px solid #f3f4f6' }}>
              <button onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', width: '100%', borderRadius: '12px', fontSize: '14px', fontWeight: 500, color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer' }}>
                <LogOut size={18} /> Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Conteúdo */}
      <div style={{ flex: 1, marginLeft: '256px', display: 'flex', flexDirection: 'column' }} className="lg:ml-64">

        {/* Header mobile */}
        <header
          style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          className="lg:hidden"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ backgroundColor: '#4f46e5', borderRadius: '8px', padding: '6px' }}>
              <Church size={16} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>IBC Membership</span>
          </div>
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}
          >
            <Menu size={20} />
          </button>
        </header>

        <main style={{ flex: 1, padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}