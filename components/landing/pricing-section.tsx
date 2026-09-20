"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight } from "lucide-react"

export function PricingSection() {
  const features = [
    "Agendamentos ilimitados",
    "Gestão completa de múltiplos barbeiros",
    "Página de agendamento personalizada (/agendar/sua-marca)",
    "Controle financeiro e relatórios de ocupação",
    "Lembretes e avisos automáticos",
    "Suba seu próprio logotipo e branding",
    "Suporte prioritário via WhatsApp"
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-background via-secondary/5 to-background border-t border-border/40" id="preco">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            Plano Simples
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-rye)" }}>
            Um Único Plano, Tudo Liberado
          </h2>
          <p className="font-playfair text-muted-foreground italic text-sm sm:text-base">
            Sem pegadinhas ou limites ocultos. Crie sua conta, personalize sua marca e comece a receber agendamentos hoje mesmo.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-xl mx-auto">
          <div className="relative rounded-2xl bg-card border border-border p-8 md:p-10 shadow-[0_20px_50px_rgba(202,163,74,0.06)] overflow-hidden">
            {/* Tag decorative */}
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-bl-lg uppercase tracking-wider">
              Popular
            </div>

            <div className="text-center space-y-4 mb-8">
              <h3 className="font-playfair text-xl md:text-2xl font-bold text-foreground">Trimly Pro</h3>
              <p className="text-xs text-muted-foreground">Tudo o que sua barbearia precisa para escalar.</p>
              
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground line-through">De R$ 49,90/mês</span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl sm:text-6xl text-primary font-bold" style={{ fontFamily: "var(--font-rye)" }}>
                    R$ 29,90
                  </span>
                  <span className="font-playfair text-muted-foreground text-sm sm:text-base">/mês</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic">Preço promocional de lançamento. Cancele quando quiser.</p>
            </div>

            <Separator className="my-6 bg-border/60" />

            <div className="space-y-4 mb-8">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">O que está incluso:</h4>
              <ul className="space-y-3.5">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-xs sm:text-sm text-foreground/80">
                    <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link href="/assinar" className="block">
              <Button size="lg" className="w-full gap-2 text-base font-semibold py-6 shadow-md hover:shadow-primary/20 transition-all">
                Começar a Organizar Minha Barbearia <ArrowRight className="size-4" />
              </Button>
            </Link>

            <div className="text-center mt-4">
              <span className="text-[10px] text-muted-foreground">Garantia de 7 dias ou seu dinheiro de volta.</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

function Separator({ className = "", ...props }) {
  return <div className={`h-px w-full bg-border ${className}`} {...props} />
}
