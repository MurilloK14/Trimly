/**
 * Controle de acesso baseado no status da assinatura.
 *
 * Esta função é a única fonte de verdade para decidir se um usuário
 * tem acesso aos recursos pagos do Trimly.
 *
 * Regras:
 *   trialing → acesso liberado (período de teste ativo)
 *   active   → acesso liberado (assinatura paga ativa)
 *   past_due → acesso negado (pagamento falhou, aguardando retentativa)
 *   canceled → acesso negado
 *   unpaid   → acesso negado
 *   null     → acesso negado (sem assinatura)
 *
 * Preparado para extensão futura:
 *   - Planos com limites diferentes
 *   - Período de graça em past_due
 *   - Plano gratuito
 */

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | null

/**
 * Retorna true se o status permite acesso aos recursos do plano.
 * Somente 'active' e 'trialing' liberam acesso ao sistema.
 */
export function hasActiveAccess(status: SubscriptionStatus | string | null | undefined): boolean {
  return status === 'trialing' || status === 'active'
}

/**
 * Retorna uma mensagem amigável para exibição na UI com base no status.
 */
export function getSubscriptionMessage(status: SubscriptionStatus | string | null | undefined): string {
  switch (status) {
    case 'trialing':
      return 'Você está no período de teste gratuito.'
    case 'active':
      return 'Sua assinatura está ativa.'
    case 'past_due':
      return 'Houve um problema com seu pagamento. Atualize seu método de pagamento.'
    case 'canceled':
      return 'Sua assinatura foi cancelada.'
    case 'unpaid':
      return 'Sua assinatura está suspensa por falta de pagamento.'
    case 'incomplete':
    case 'incomplete_expired':
      return 'O pagamento inicial não foi concluído. Conclua o processo de assinatura.'
    default:
      return 'Você não possui uma assinatura ativa.'
  }
}
