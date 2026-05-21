"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ArrowRight, 
  CheckCircle2, 
  CreditCard,
  Lock,
  Shield
} from "lucide-react"

export default function AssinarPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Aqui você vai integrar com o sistema de pagamento (Stripe, etc.)
    // Após o pagamento aprovado, redireciona para o onboarding
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simula pagamento aprovado e redireciona para onboarding
    router.push("/onboarding")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="MK Barber" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
            <span style={{ fontFamily: "var(--font-rye)" }} className="text-lg text-primary">MK Barber</span>
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Já sou assinante
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-12">
          {/* Left - Plan Details */}
          <div className="order-2 lg:order-1">
            <div className="sticky top-8">
              <h1 className="text-3xl font-bold mb-2">Comece a usar o MK Barber</h1>
              <p className="text-muted-foreground mb-8">
                Assine e configure sua conta em poucos minutos
              </p>

              <div className="p-6 rounded-xl bg-card border border-border mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">MK Barber Completo</h2>
                  <div className="text-right">
                    <span className="text-2xl font-bold">R$ 49</span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <PlanFeature text="Agendamentos ilimitados" />
                  <PlanFeature text="Gestão completa de clientes" />
                  <PlanFeature text="Calendário inteligente" />
                  <PlanFeature text="Relatórios e métricas" />
                  <PlanFeature text="Página de agendamento personalizada" />
                  <PlanFeature text="Suporte prioritário" />
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="size-4" />
                  <span>Pagamento seguro</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="size-4" />
                  <span>Dados protegidos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Payment Form */}
          <div className="order-1 lg:order-2">
            <div className="p-6 md:p-8 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="size-5 text-primary" />
                <span className="font-semibold">Dados de pagamento</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="h-11 bg-secondary/50 border-border"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Você usará este e-mail para acessar sua conta
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Número do cartão</Label>
                  <Input
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    className="h-11 bg-secondary/50 border-border"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Validade</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/AA"
                      className="h-11 bg-secondary/50 border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      className="h-11 bg-secondary/50 border-border"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome no cartão</Label>
                  <Input
                    id="name"
                    placeholder="Nome completo"
                    className="h-11 bg-secondary/50 border-border"
                    required
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full gap-2" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        Assinar por R$ 49/mês
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center pt-2">
                  Ao assinar, você concorda com nossos{" "}
                  <Link href="#" className="text-primary hover:underline">Termos de Serviço</Link>
                  {" "}e{" "}
                  <Link href="#" className="text-primary hover:underline">Política de Privacidade</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function PlanFeature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="size-4 text-primary shrink-0" />
      <span className="text-sm">{text}</span>
    </div>
  )
}
