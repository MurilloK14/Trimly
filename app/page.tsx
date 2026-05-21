"use client"

import { useState, useEffect } from "react"
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

function ProductDemoSlider() {
  const [activeSlide, setActiveSlide] = useState(0)
  const slides = [
    {
      title: "Área de Agendamento do Cliente",
      description: "Uma interface intuitiva e personalizada com o nome e logotipo da sua barbearia. Seus clientes agendam serviços 24/7 sem atritos.",
      image: "/scheduling_demo.png",
      tag: "Visão do Cliente"
    },
    {
      title: "Painel de Gestão do Barbeiro",
      description: "Controle de faturamento, relatórios de ocupação, metas, gestão de profissionais e visualização de agenda em tempo real.",
      image: "/dashboard_demo.png",
      tag: "Visão do Administrador"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <div className="mt-16 max-w-5xl mx-auto space-y-6">
      {/* Dynamic Slide Details */}
      <div className="text-center max-w-xl mx-auto space-y-2 px-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
          {slides[activeSlide].tag}
        </span>
        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground transition-all duration-300">{slides[activeSlide].title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed transition-all duration-300">{slides[activeSlide].description}</p>
      </div>

      {/* Premium Browser Mockup Container */}
      <div className="relative rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-2 shadow-[0_20px_50px_rgba(202,163,74,0.12)] overflow-hidden group">
        {/* Browser Top bar decoration */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/20">
          <div className="flex gap-1.5">
            <span className="size-3 rounded-full bg-red-500/80" />
            <span className="size-3 rounded-full bg-yellow-500/80" />
            <span className="size-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex items-center gap-1.5 bg-background/50 border border-border/50 rounded px-16 py-0.5 text-[10px] text-muted-foreground font-mono select-none">
            {activeSlide === 0 ? "mkbarber.com/agendar" : "mkbarber.com/dashboard"}
          </div>
          <div className="w-12" /> {/* spacer */}
        </div>

        {/* Slide Image Box */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-background rounded-b-lg">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === activeSlide ? "opacity-100 scale-100 z-10" : "opacity-0 scale-95 z-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-top"
              />
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`size-2 rounded-full transition-all duration-300 ${
                index === activeSlide ? "bg-primary w-6" : "bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

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
          <div className="max-w-4xl mx-auto text-center">
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
              Acelere as vendas e simplifique a agenda da sua barbearia
            </div>

            {/* H1 — focado em faturamento e vendas para donos de barbearia */}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-3">
              Aumente o faturamento da sua barbearia com{" "}
              <span style={{ fontFamily: "var(--font-rye)" }} className="text-primary block mt-1">
                agendamento automático
              </span>
            </h1>

            <p className="font-playfair text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Diga adeus ao WhatsApp lotado. Ofereça uma página de agendamento exclusiva com a sua marca e gerencie seu time, faturamento e clientes em um painel inteligente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/assinar">
                <Button size="lg" className="gap-2 w-full sm:w-auto text-base px-8 py-6">
                  Começar a Vender Mais <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
            <p className="font-playfair text-sm text-muted-foreground italic">
              Modernize seu negócio hoje mesmo por apenas R$ 49/mês
            </p>

            {/* Automatic Slide demonstration */}
            <ProductDemoSlider />
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
