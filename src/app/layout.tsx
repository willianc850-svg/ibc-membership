import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IBC Membership',
  description: 'Sistema de gestão de membros',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="light">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}