import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'IBC Membership',
  description: 'Sistema de gestão de membros',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'IBC Membership',
    statusBarStyle: 'default',
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#11235B',
}

const scriptTema = `(function(){try{var t=localStorage.getItem('ibc-theme');var d=t==='dark';document.documentElement.classList.toggle('dark',d);document.documentElement.classList.toggle('light',!d);}catch(e){}})();`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Script id="ibc-theme" strategy="beforeInteractive">
          {scriptTema}
        </Script>
        {children}
      </body>
    </html>
  )
}
