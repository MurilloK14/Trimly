"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Users, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Clock
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="MK Barber" width={40} height={40} className="object-contain" />
            <span style={{ fontFamily: "var(--font-rye)" }} className="text-lg text-primary">MK Barber</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#funcionalidades" className="font-playfair text-sm text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</Link>
            <Link href="#beneficios" className="font-playfair text-sm text-muted-foreground hover:text-foreground transition-colors">Benefícios</Link>
            <Link href="#preco" className="font-playfair text-sm text-muted-foreground hover:text-foreground transition-colors">Preço</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-playfair">Já sou assinante</Button>
            </Link>
            <Link href="/assinar">
              <Button size="sm" className="gap-2">
                Comece Agora <ArrowRight className="size-3" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <Image 
                src="/logo.png" 
                alt="MK Barber" 
                width={150} 
                height={150}
                className="object-contain drop-shadow-[0_0_20px_rgba(202,163,74,0.3)]"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6 font-playfair italic">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Sistema de Gestão para Barbearias
            </div>

            {/* H1 — tamanho original, numa frase só */}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-3">
              Transforme sua barbearia em um{" "}
              <span style={{ fontFamily: "var(--font-rye)" }} className="text-primary">
                negócio organizado
              </span>
            </h1>

            <p className="font-playfair text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Tenha controle total da sua agenda, clientes e desempenho. 
              Simplifique seu dia a dia e foque no que você faz de melhor: cortar cabelo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/assinar">
                <Button size="lg" className="gap-2 w-full sm:w-auto text-base px-8 py-6">
                  Comece Agora <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
            <p className="font-playfair text-sm text-muted-foreground italic">
              Assine e tenha acesso completo ao sistema
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-24" id="funcionalidades">
            <FeatureCard icon={Calendar} title="Agendamento Online" description="Seus clientes agendam 24/7. Você gerencia tudo em tempo real." />
            <FeatureCard icon={Users} title="Gestão de Clientes" description="Histórico completo, preferências e fidelização automática." />
            <FeatureCard icon={BarChart3} title="Relatórios Inteligentes" description="Métricas de desempenho e insights para crescer seu negócio." />
          </div>

          {/* Benefits */}
          <div className="mt-24" id="beneficios">
            <h2 className="text-2xl md:text-4xl font-bold text-center mb-4" style={{ fontFamily: "var(--font-rye)" }}>
              Por que escolher o MK Barber?
            </h2>
            <p className="font-playfair text-muted-foreground text-center italic mb-12 max-w-xl mx-auto">
              Tudo que você precisa para gerenciar sua barbearia em um único lugar
            </p>
            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              <BenefitItem icon={Clock} text="Reduza faltas com lembretes automáticos" />
              <BenefitItem icon={Users} text="Múltiplos barbeiros em uma só conta" />
              <BenefitItem icon={Zap} text="Interface rápida e fácil de usar" />
              <BenefitItem icon={Shield} text="Seus dados sempre seguros" />
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-24" id="preco">
            <h2 className="text-2xl md:text-4xl font-bold text-center mb-4" style={{ fontFamily: "var(--font-rye)" }}>
              Plano simples e acessível
            </h2>
            <p className="font-playfair text-muted-foreground text-center italic mb-12 max-w-xl mx-auto">
              Sem surpresas. Um único plano com todas as funcionalidades.
            </p>
            <div className="max-w-md mx-auto">
              <div className="p-8 rounded-2xl bg-card border border-border relative overflow-hidden">
                <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-bl-lg">
                  Mensal
                </div>
                <div className="text-center mb-6">
                  <h3 className="font-playfair text-xl font-semibold mb-2">MK Barber Completo</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl text-primary font-bold" style={{ fontFamily: "var(--font-rye)" }}>R$ 49</span>
                    <span className="font-playfair text-muted-foreground">/mês</span>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  <PricingFeature text="Agendamentos ilimitados" />
                  <PricingFeature text="Gestão de clientes" />
                  <PricingFeature text="Calendário inteligente" />
                  <PricingFeature text="Relatórios completos" />
                  <PricingFeature text="Suporte prioritário" />
                  <PricingFeature text="Página de agendamento personalizada" />
                </div>
                <Link href="/assinar" className="block">
                  <Button size="lg" className="w-full gap-2">
                    Comece Agora <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-24 p-8 md:p-12 rounded-2xl bg-card border border-border text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-rye)" }}>
              Pronto para organizar sua barbearia?
            </h2>
            <p className="font-playfair text-muted-foreground italic mb-8 max-w-lg mx-auto">
              Assine agora e comece a usar o MK Barber em minutos. 
              Configure sua conta e receba agendamentos ainda hoje.
            </p>
            <Link href="/assinar">
              <Button size="lg" className="gap-2 text-base px-8 py-6">
                Comece Agora <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="MK Barber" width={28} height={28} className="object-contain" />
            <span style={{ fontFamily: "var(--font-rye)" }} className="text-primary">MK Barber</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-muted-foreground font-playfair">
            <Link href="#" className="hover:text-foreground transition-colors">Termos</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Suporte</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group">
      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="size-5 text-primary" />
      </div>
      <h3 className="font-playfair font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function BenefitItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
      <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="size-4 text-primary" />
      </div>
      <span className="font-playfair text-sm">{text}</span>
    </div>
  )
}

function PricingFeature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="size-4 text-primary shrink-0" />
      <span className="font-playfair text-sm">{text}</span>
    </div>
  )
}
