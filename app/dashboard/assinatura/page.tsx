import { getSubscriptionInfo } from "@/lib/actions/stripe/subscription"
import { createBillingPortalSession } from "@/lib/actions/stripe/portal"
import { hasActiveAccess, getSubscriptionMessage } from "@/lib/stripe/access"
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  CreditCard,
  ExternalLink,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date: Date | null): string {
  if (!date) return "—"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function getDaysRemaining(date: Date | null): number | null {
  if (!date) return null
  const diff = date.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    trialing: {
      label: "Período de teste",
      icon: <Clock className="size-3.5" />,
      className: "bg-blue-500/10 text-blue-500",
    },
    active: {
      label: "Ativa",
      icon: <CheckCircle2 className="size-3.5" />,
      className: "bg-primary/10 text-primary",
    },
    past_due: {
      label: "Pagamento pendente",
      icon: <AlertTriangle className="size-3.5" />,
      className: "bg-yellow-500/10 text-yellow-500",
    },
    canceled: {
      label: "Cancelada",
      icon: <XCircle className="size-3.5" />,
      className: "bg-destructive/10 text-destructive",
    },
    unpaid: {
      label: "Suspensa",
      icon: <XCircle className="size-3.5" />,
      className: "bg-destructive/10 text-destructive",
    },
  }

  const config = status ? (map[status] ?? null) : null

  if (!config) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
        <XCircle className="size-3.5" />
        Sem assinatura
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  )
}

// ─── Server Action para portal ────────────────────────────────────────────────

async function openPortal() {
  "use server"
  const result = await createBillingPortalSession()
  if (result.success) {
    redirect(result.data)
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic'

export default async function AssinaturaPage() {
  const result = await getSubscriptionInfo()

  if (!result.success) {
    return (
      <div className="max-w-2xl space-y-2">
        <h1 className="text-2xl font-bold">Assinatura</h1>
        <p className="text-muted-foreground text-sm">Erro ao carregar informações da assinatura.</p>
      </div>
    )
  }

  const { status, trialEnd, subscriptionEnd, stripeCustomerId } = result.data
  const isActive = hasActiveAccess(status)
  const message = getSubscriptionMessage(status)
  const daysRemainingInTrial = status === "trialing" ? getDaysRemaining(trialEnd) : null
  const hasPortalAccess = !!stripeCustomerId

  return (
    <div className="max-w-2xl space-y-6">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold mb-1">Assinatura</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie seu plano e informações de pagamento.
        </p>
      </div>

      {/* Card principal */}
      <div className="rounded-xl bg-card border border-border p-6 space-y-5">

        {/* Status + plano */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <p className="font-semibold">Trimly — Plano completo</p>
            <p className="text-sm text-muted-foreground">
              {isActive ? "R$\u00a029,90/mês (oferta de lançamento)" : "—"}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="border-t border-border" />

        {/* Mensagem contextual */}
        <p className="text-sm text-muted-foreground">{message}</p>

        {/* Detalhes do trial */}
        {status === "trialing" && trialEnd && (
          <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 px-4 py-3 flex items-start gap-3">
            <Calendar className="size-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">
                {daysRemainingInTrial !== null && daysRemainingInTrial > 0
                  ? `${daysRemainingInTrial} dia${daysRemainingInTrial !== 1 ? "s" : ""} restante${daysRemainingInTrial !== 1 ? "s" : ""} no período de teste`
                  : "Período de teste encerrando hoje"}
              </p>
              <p className="text-xs text-muted-foreground">
                Após {formatDate(trialEnd)}, você será cobrado R$\u00a029,90/mês automaticamente.
              </p>
            </div>
          </div>
        )}

        {/* Próxima cobrança */}
        {status === "active" && subscriptionEnd && (
          <div className="rounded-lg bg-secondary/60 border border-border px-4 py-3 flex items-start gap-3">
            <Calendar className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Próxima cobrança</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(subscriptionEnd)} · R$\u00a029,90
              </p>
            </div>
          </div>
        )}

        {/* Alerta past_due */}
        {status === "past_due" && (
          <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="size-4 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-500">Ação necessária</p>
              <p className="text-xs text-muted-foreground">
                Atualize seu método de pagamento para evitar a suspensão da conta.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Ações */}
      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="size-4 text-muted-foreground" />
          <p className="font-medium text-sm">Gerenciar assinatura</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Para alterar o método de pagamento, cancelar ou ver faturas, acesse o portal de assinatura.
        </p>

        {hasPortalAccess ? (
          <form action={openPortal}>
            <Button type="submit" variant="outline" className="gap-2">
              <ExternalLink className="size-4" />
              Abrir portal de assinatura
            </Button>
          </form>
        ) : (
          <Button asChild variant="default" className="gap-2">
            <a href="/assinar">Assinar o Trimly</a>
          </Button>
        )}
      </div>

      {/* Cancelamento durante trial */}
      {status === "trialing" && (
        <div className="rounded-xl bg-card border border-border p-6 space-y-3">
          <p className="font-medium text-sm">Cancelamento durante o período de teste</p>
          <p className="text-xs text-muted-foreground">
            Se você cancelar antes do término do período de teste, sua assinatura será encerrada e <strong>nenhuma cobrança será realizada</strong>. Você manterá acesso até o final do período de teste.
          </p>
          {hasPortalAccess && (
            <form action={openPortal}>
              <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-2">
                <XCircle className="size-4" />
                Cancelar assinatura
              </Button>
            </form>
          )}
        </div>
      )}

    </div>
  )
}
