'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ActionResult } from '@/lib/booking/types'

export async function login(formData: FormData): Promise<ActionResult<void>> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'E-mail e senha são obrigatórios' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }
  } catch (err) {
    console.error('[Login Error]', err)
    return { success: false, error: 'Ocorreu um erro ao fazer login' }
  }

  let redirectTo = (formData.get('redirectTo') as string) || '/dashboard'

  // Proteção contra Open Redirect — aceita apenas paths relativos internos
  if (!redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
    redirectTo = '/dashboard'
  }

  // Redireciona para a rota solicitada ou dashboard
  redirect(redirectTo)
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
