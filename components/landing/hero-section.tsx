"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="pt-32 pb-16 relative overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          <div className="flex justify-center">
            <Image 
              src="/logo.png" 
              alt="MK Barber" 
              width={160} 
              height={160}
              className="object-contain drop-shadow-[0_0_30px_rgba(202,163,74,0.35)] animate-fade-in"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-playfair italic mx-auto">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Acelere o faturamento e automatize a agenda da sua barbearia
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.1] text-foreground">
            Aumente o faturamento da sua barbearia com{" "}
            <span style={{ fontFamily: "var(--font-rye)" }} className="text-primary block mt-2 text-5xl sm:text-7xl">
              Agendamento Automático
            </span>
          </h1>

          <p className="font-playfair text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Elimine as conversas infinitas no WhatsApp. Ofereça uma página de agendamento de alto padrão com a identidade da sua barbearia e gerencie equipe, faturamento e serviços em um painel administrativo poderoso.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/assinar" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 gap-2">
                Começar a Vender Mais <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6">
                Acessar Demonstração
              </Button>
            </Link>
          </div>

          <p className="font-playfair text-xs sm:text-sm text-muted-foreground italic">
            Modernize seu negócio hoje mesmo. De R$ 49,90 por apenas R$ 29,90/mês na promoção de lançamento.
          </p>
        </div>
      </div>
    </section>
  )
}
