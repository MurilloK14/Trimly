"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Shield,
  Lock,
  Calendar,
  Users,
  Scissors,
  Clock,
  LayoutDashboard,
  Star,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { createCheckoutSession } from "@/lib/actions/stripe/checkout"
import { toast } from "sonner"

const FEATURES = [
  { icon: Calendar,       label: "Agenda online" },
  { icon: Star,           label: "Link personalizado de agendamento" },
  { icon: Users,          label: "Cadastro de clientes" },
  { icon: Scissors,       label: "Cadastro de serviços" },
  { icon: Users,          label: "Cadastro de barbeiros" },
  { icon: Clock,          label: "Gerenciamento de horários" },
  { icon: Calendar,       label: "Gestão de agendamentos" },
  { icon: Scissors,       label: "Personalização da barbearia" },
  { icon: LayoutDashboard, label: "Painel administrativo" },
  { icon: LayoutDashboard, label: "Recursos de gerenciamento" },
]

const BENEFITS = [
  "Organize sua agenda e elimine conflitos de horário",
  "Facilite o agendamento dos seus clientes 24h por dia",
  "Tenha sua própria página de agendamento online",
  "Gerencie sua barbearia em um só lugar",
]

export default function AssinarPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        toast.error(data.error ?? 'Erro ao iniciar o checkout do Stripe.')
        setIsLoading(false)
        return
      }

      // Redireciona diretamente para o Stripe Checkout oficial
      window.location.href = data.url
    } catch {
      toast.error('Erro ao conectar com o sistema de pagamentos.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Trimly"
              width={200}
              height={60}
              className="object-contain"
            />
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Já sou assinante
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center p-6 pt-10 pb-16">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-14">

          {/* ─── Coluna esquerda: Benefícios ─────────────────────────────── */}
          <div className="order-2 lg:order-1 space-y-8">

            {/* Headline */}
            <div>
              <h1 className="text-3xl font-bold leading-tight mb-3">
                Tudo que sua barbearia precisa em um único lugar
              </h1>
              <ul className="space-y-2">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-muted-foreground text-sm">
                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                O que está incluído
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FEATURES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="size-4 text-primary shrink-0" />
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Segurança */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5">
                <Shield className="size-4" />
                <span>Pagamento seguro via Stripe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="size-4" />
                <span>Dados protegidos</span>
              </div>
            </div>
          </div>

          {/* ─── Coluna direita: Plano + CTA ─────────────────────────────── */}
          <div className="order-1 lg:order-2">
            <div className="p-7 rounded-2xl bg-card border border-border shadow-sm">

              {/* Badge de lançamento */}
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-5">
                <Star className="size-3" />
                Oferta especial de lançamento
              </div>

              {/* Nome do plano */}
              <h2 className="text-xl font-bold mb-1">Trimly</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Plano completo · Cobrado mensalmente
              </p>

              {/* Ancoragem de preço */}
              <div className="mb-2">
                <span className="text-sm text-muted-foreground line-through">
                  R$&nbsp;49,90/mês
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold tracking-tight">R$&nbsp;29,90</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Preço normal: <span className="line-through">R$&nbsp;49,90/mês</span>
              </p>

              {/* Trial */}
              <div className="rounded-xl bg-secondary/60 border border-border px-4 py-4 mb-6 space-y-1">
                <p className="font-semibold text-sm">
                  🎉 7 dias grátis para começar
                </p>
                <p className="text-xs text-muted-foreground">
                  Sem cobrança durante o período de teste. Após os 7 dias, você será cobrado automaticamente <strong>R$&nbsp;29,90/mês</strong> enquanto a promoção de lançamento estiver vigente. Cancele a qualquer momento antes do fim do período de teste e não será cobrado.
                </p>
              </div>

              {/* CTA */}
              <Button
                id="btn-comecar-trial"
                size="lg"
                className="w-full gap-2 text-base h-12"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Aguarde...
                  </>
                ) : (
                  <>
                    Começar 7 dias grátis
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                Ao continuar, você concorda com nossos{" "}
                <Link href="#" className="text-primary hover:underline">
                  Termos de Serviço
                </Link>{" "}
                e{" "}
                <Link href="#" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
                .
              </p>

              {/* Resumo pós-CTA */}
              <div className="mt-5 pt-5 border-t border-border space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>7 dias de teste</span>
                  <span className="font-medium text-foreground">Grátis</span>
                </div>
                <div className="flex justify-between">
                  <span>Após o período de teste</span>
                  <span className="font-medium text-foreground">R$&nbsp;29,90/mês</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4 px-2">
              Você será direcionado para o ambiente seguro do Stripe para inserir os dados do cartão. O Trimly não armazena informações de pagamento.
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}
