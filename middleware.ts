import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { hasActiveAccess } from '@/lib/stripe/access'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Apenas inicializar o Supabase e verificar auth em rotas que precisam disso.
  // Isso evita timeouts (504) em rotas públicas como a landing page,
  // especialmente se o Supabase estiver em cold start.
  const needsAuthCheck = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/login') ||
    pathname.startsWith('/assinar')

  if (!needsAuthCheck) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ─── Proteção de autenticação ──────────────────────────────────────────────
  // Se a rota for protegida (/dashboard) e não houver usuário logado
  if (pathname.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // ─── Proteção de assinatura ────────────────────────────────────────────────
  // Usuário está logado mas acessa /dashboard → verificar assinatura
  if (pathname.startsWith('/dashboard') && user) {
    // Bypass para contas de teste/desenvolvimento.
    const bypassEmails = (process.env.SUBSCRIPTION_BYPASS_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)

    if (user.email && bypassEmails.includes(user.email.toLowerCase())) {
      // Conta de bypass — acesso liberado sem verificar assinatura
      return supabaseResponse
    }

    // Busca o status da assinatura direto no banco via Supabase client
    const { data: barbershop } = await supabase
      .from('barbershops')
      .select('subscription_status')
      .eq('owner_id', user.id)
      .single()

    const status = barbershop?.subscription_status ?? null

    if (!hasActiveAccess(status)) {
      const url = request.nextUrl.clone()
      url.pathname = '/assinar'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
