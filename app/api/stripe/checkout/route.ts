import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'

const TRIAL_PERIOD_DAYS = 7

/**
 * POST /api/stripe/checkout
 *
 * Gera a sessão do Stripe Checkout diretamente.
 * Abre a página oficial de pagamento do Stripe com 7 dias de teste e R$ 29,90/mês.
 *
 * Segurança:
 *   - URL base vem exclusivamente da variável de ambiente (nunca do header Origin)
 */
export async function POST(req: NextRequest) {
  try {
    const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim()
    const priceId = (process.env.STRIPE_PRICE_ID || '').trim()

    if (!secretKey) {
      console.error('[stripe/checkout] STRIPE_SECRET_KEY não configurada')
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta.' },
        { status: 500 }
      )
    }

    if (!priceId) {
      console.error('[stripe/checkout] STRIPE_PRICE_ID não configurada')
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta.' },
        { status: 500 }
      )
    }

    // Segurança: usar SOMENTE a variável de ambiente, nunca o header Origin
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trimly-mk.vercel.app'

    // Cria a sessão de checkout no Stripe diretamente
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: TRIAL_PERIOD_DAYS,
      },
      payment_method_collection: 'always',
      allow_promotion_codes: true,
      success_url: `${baseUrl}/cadastro?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/assinar/cancelado`,
      locale: 'pt-BR',
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Não foi possível gerar a sessão de checkout.' },
        { status: 500 }
      )
    }

    // Retorna a URL do Stripe Checkout diretamente
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[POST /api/stripe/checkout] Erro:', err)
    return NextResponse.json(
      { error: 'Erro ao conectar com o sistema de pagamentos.' },
      { status: 500 }
    )
  }
}
