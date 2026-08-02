"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Renato Souza",
      role: "Dono da Barbearia Navalha Club",
      quote: "Com a página de agendamento personalizada do MK Barber, nossos clientes agendam em segundos. Nosso faturamento aumentou em 30% nas primeiras semanas, e o WhatsApp parou de travar com clientes pedindo horários.",
      rating: 5,
      achievement: "Redução de 90% em faltas"
    },
    {
      name: "Marcus Vinícius",
      role: "Fundador do Studio Elite Barber",
      quote: "A possibilidade de personalizar o link com o nome e logotipo da minha própria barbearia fez toda a diferença. Os clientes elogiam muito a facilidade da interface e nossos barbeiros controlam as próprias agendas com perfeição.",
      rating: 5,
      achievement: "Branding 100% próprio"
    },
    {
      name: "Júlio César",
      role: "Gerente do Império da Barba",
      quote: "O controle financeiro por barbeiro economiza horas de planilhas de comissão todo final de mês. A plataforma se paga sozinha já no primeiro dia de uso. Altamente recomendado para qualquer dono de barbearia.",
      rating: 5,
      achievement: "+350 clientes fidelizados"
    }
  ]

  return (
    <section className="py-20 bg-background border-t border-border/40" id="beneficios">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            Histórias de Sucesso
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-rye)" }}>
            Quem Usa, Comprova o Resultado
          </h2>
          <p className="font-playfair text-muted-foreground italic text-sm sm:text-base">
            Descubra como barbeiros e proprietários de barbearias pelo país estão automatizando seus negócios e faturando mais.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((t, idx) => (
            <Card 
              key={idx} 
              className="bg-card border-border hover:border-primary/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-[0_15px_30px_rgba(202,163,74,0.03)]"
            >
              <CardContent className="p-6 md:p-8 space-y-6 flex flex-col justify-between h-full">
                
                {/* Quote details */}
                <div className="space-y-4">
                  <div className="flex gap-0.5 text-primary">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="size-4 fill-primary text-primary" />
                    ))}
                  </div>
                  
                  <div className="relative">
                    <Quote className="size-10 text-primary/10 absolute -top-4 -left-2 pointer-events-none" />
                    <p className="font-sans text-xs sm:text-sm text-foreground/80 leading-relaxed relative z-10 font-normal">
                      "{t.quote}"
                    </p>
                  </div>
                </div>

                {/* Author profile and achievement */}
                <div className="pt-6 border-t border-border/60 flex items-end justify-between">
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-sm text-foreground">{t.name}</h4>
                    <p className="text-[10px] text-muted-foreground leading-none">{t.role}</p>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                    {t.achievement}
                  </span>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  )
}
