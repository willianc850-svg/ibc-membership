import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const rotasPublicas = ['/login', '/esqueci-senha', '/auth/callback', '/cadastro']

function ehRotaPublica(pathname: string) {
  return rotasPublicas.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`))
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  if (!user && !ehRotaPublica(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && user.user_metadata?.must_set_password === true && pathname !== '/definir-senha') {
    return NextResponse.redirect(new URL('/definir-senha', request.url))
  }

  if (user && (pathname === '/login' || pathname === '/esqueci-senha')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\.png$).*)'],
}
