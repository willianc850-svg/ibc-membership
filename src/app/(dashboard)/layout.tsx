'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Users, UsersRound, HandHeart,
  BarChart3, Settings, LogOut, X, Wallet, FileText, CalendarDays, MoreHorizontal,
} from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { usePermissao } from '@/lib/hooks/usePermissao'
import LogoIbc from '@/components/LogoIbc'
import BotaoTema from '@/components/BotaoTema'

type MenuItem = {
  href: string
  label: string
  icon: typeof Wallet
  tesouraria?: boolean
  documentos?: boolean
  hideForUser?: boolean
}

function RodapeSair({ onSair, dataCy }: { onSair: () => void; dataCy: string }) {
  return (
    <button
      type="button"
      onClick={onSair}
      data-cy={dataCy}
      className="flex items-center gap-3 px-3 min-h-11 w-full rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
    >
      <LogOut size={18} />
      Sair
    </button>
  )
}

/** '/membros' -> 'Membros', para compor os data-cy do menu. */
function nomeMenu(href: string) {
  const base = href.replace('/', '')
  return base.charAt(0).toUpperCase() + base.slice(1)
}

const menuBase: MenuItem[] = [
  { href: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/membros',       label: 'Membros',       icon: Users           },
  { href: '/reunioes',      label: 'Reuniões',      icon: CalendarDays, hideForUser: true },
  { href: '/pgm',           label: 'PGMs',          icon: UsersRound      },
  { href: '/ministerios',   label: 'Ministérios',   icon: HandHeart       },
  { href: '/tesouraria',    label: 'Tesouraria',    icon: Wallet, tesouraria: true },
  { href: '/documentos',    label: 'Documentos',    icon: FileText, documentos: true },
  { href: '/relatorios',    label: 'Relatórios',    icon: BarChart3, hideForUser: true },
  { href: '/configuracoes', label: 'Configurações', icon: Settings        },
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
  const { podeTesouraria, podeDocumentos, podeReunioesRelatorios } = usePermissao()
  const menuItems = menuBase.filter((item) => {
    if (item.tesouraria && !podeTesouraria) return false
    if (item.documentos && !podeDocumentos) return false
    if (item.hideForUser && !podeReunioesRelatorios) return false
    return true
  })

  useEffect(() => {
    if (!menuAberto) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = anterior
    }
  }, [menuAberto])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function isAtivo(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  function estiloLink(href: string): CSSProperties {
    const ativo = isAtivo(href)
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      minHeight: '44px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 500,
      marginBottom: '2px',
      textDecoration: 'none',
      backgroundColor: ativo ? 'var(--ibc-active-bg)' : 'transparent',
      color: ativo ? 'var(--ibc-active-text)' : 'var(--ibc-nav)',
    }
  }


  return (
    <div
      className="flex min-h-dvh overflow-x-hidden"
      style={{ backgroundColor: 'var(--ibc-page)' }}
    >
      <aside
        className="hidden lg:flex flex-col print:hidden"
        style={{
          width: '256px',
          backgroundColor: 'var(--ibc-card)',
          borderRight: '1px solid var(--ibc-border)',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100dvh',
          zIndex: 40,
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--ibc-border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LogoIbc size={36} />
            <div>
              <p style={{ fontWeight: 700, color: 'var(--ibc-text)', fontSize: '14px', margin: 0 }}>IBC Membership</p>
              <p style={{ fontSize: '12px', color: 'var(--ibc-muted)', margin: 0 }}>Gestão de Membros</p>
            </div>
          </div>
        </div>

        <nav data-cy="navSidebar" style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {menuItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} data-cy={`linkMenu${nomeMenu(href)}Sidebar`} style={estiloLink(href)}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid var(--ibc-border-subtle)' }}>
          <BotaoTema dataCy="btnTemaSidebar" />
          <RodapeSair onSair={handleLogout} dataCy="btnSairSidebar" />
        </div>
      </aside>

      {menuAberto && (
        <div
          className="lg:hidden"
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}
        >
          <div
            data-cy="overlayMenuMobile"
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setMenuAberto(false)}
          />
          <aside
            className="flex flex-col"
            style={{
              width: '256px',
              maxWidth: '85vw',
              backgroundColor: 'var(--ibc-card)',
              height: '100dvh',
              position: 'relative',
              zIndex: 51,
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            <div style={{
              padding: '16px 16px 16px 20px',
              paddingTop: 'max(16px, env(safe-area-inset-top))',
              borderBottom: '1px solid var(--ibc-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <LogoIbc size={32} />
                <p style={{ fontWeight: 700, color: 'var(--ibc-text)', fontSize: '14px', margin: 0 }}>IBC Membership</p>
              </div>
              <button
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar menu"
                data-cy="btnFecharMenu"
                className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-gray-500"
              >
                <X size={22} />
              </button>
            </div>
            <nav data-cy="navDrawer" style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
              {menuItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuAberto(false)}
                  data-cy={`linkMenu${nomeMenu(href)}Drawer`}
                  style={estiloLink(href)}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </nav>
            <div style={{ padding: '12px', borderTop: '1px solid var(--ibc-border-subtle)' }}>
              <BotaoTema dataCy="btnTemaDrawer" />
              <RodapeSair onSair={handleLogout} dataCy="btnSairDrawer" />
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-h-dvh flex-1 flex-col lg:ml-64">
        <header
          className="sticky top-0 z-30 flex lg:hidden items-center gap-3 px-4 min-h-14 print:hidden"
          style={{
            backgroundColor: 'var(--ibc-card)',
            borderBottom: '1px solid var(--ibc-border)',
            paddingTop: 'max(8px, env(safe-area-inset-top))',
          }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <LogoIbc size={28} />
            <span className="font-bold text-sm truncate" style={{ color: 'var(--ibc-text)' }}>
              IBC Membership
            </span>
          </div>
          <BotaoTema compacto dataCy="btnTemaHeader" />
        </header>

        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6 print:p-4 print:pb-4">
          {children}
        </main>

        <nav
          data-cy="navBarra"
          className="fixed bottom-0 inset-x-0 z-30 grid grid-cols-3 lg:hidden border-t print:hidden"
          style={{
            backgroundColor: 'var(--ibc-card)',
            borderColor: 'var(--ibc-border)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <Link
            href="/dashboard"
            data-cy="linkMenuDashboardBarra"
            className={`flex flex-col items-center justify-center gap-0.5 min-h-14 text-[11px] font-medium ${
              isAtivo('/dashboard') ? 'text-indigo-600' : 'text-gray-500'
            }`}
          >
            <LayoutDashboard size={22} />
            Início
          </Link>
          <Link
            href="/membros"
            data-cy="linkMenuMembrosBarra"
            className={`flex flex-col items-center justify-center gap-0.5 min-h-14 text-[11px] font-medium ${
              isAtivo('/membros') ? 'text-indigo-600' : 'text-gray-500'
            }`}
          >
            <Users size={22} />
            Membros
          </Link>
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            data-cy="btnAbrirMenu"
            className="flex flex-col items-center justify-center gap-0.5 min-h-14 text-[11px] font-medium text-gray-500"
          >
            <MoreHorizontal size={22} />
            Mais
          </button>
        </nav>
      </div>
    </div>
  )
}
