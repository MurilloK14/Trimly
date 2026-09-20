/**
 * Stripe Client — uso exclusivo no servidor.
 *
 * NUNCA importe este módulo em Client Components ou em código que
 * possa ser enviado ao browser. A secret key nunca deve ser exposta
 * ao frontend.
 *
 * Padrão singleton: evita criar múltiplas instâncias do cliente
 * durante hot reload no desenvolvimento.
 */

import Stripe from 'stripe'

const globalForStripe = globalThis as unknown as { _stripe?: Stripe; _cachedKey?: string }

export function getStripe(): Stripe {
  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim()
  if (!globalForStripe._stripe || globalForStripe._cachedKey !== secretKey) {
    globalForStripe._cachedKey = secretKey
    globalForStripe._stripe = new Stripe(secretKey || 'sk_test_placeholder_key_not_configured', {
      apiVersion: '2026-07-29.dahlia',
      typescript: true,
    })
  }
  return globalForStripe._stripe
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})
