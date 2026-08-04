"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Users, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Clock,
  Sparkles,
  Scissors
} from "lucide-react"

function ProductDemoSlider() {
  const [activeSlide, setActiveSlide] = useState(0)
  const slides = [
    {
      title: "Agendamento Sem Atrito",
      description: "Interface intuitiva onde seus clientes agendam serviços 24/7 de forma rápida e elegante.",
      image: "/scheduling_demo.png", // Fallback, could be generated
      tag: "Experiência do Cliente"
    },
    {
      title: "Controle Total na sua Mão",
      description: "Métricas de faturamento, ocupação, gestão de equipe e agenda unificada em um único painel.",
      image: "/dashboard_demo.png", // Fallback, could be generated
      tag: "Gestão Avançada"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <div className="mt-20 max-w-5xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-4 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20 shadow-[0_0_15px_rgba(201,138,91,0.2)]">
              {slides[activeSlide].tag}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{slides[activeSlide].title}</h3>
            <p className="text-base text-muted-foreground leading-relaxed">{slides[activeSlide].description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Premium Browser Mockup Container */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-2 shadow-2xl shadow-black overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-50"></div>
        
        {/* Browser Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/40 rounded-t-xl relative z-10">
          <div className="flex gap-2">
            <span className="size-3 rounded-full bg-red-500/80 shadow-sm" />
            <span className="size-3 rounded-full bg-yellow-500/80 shadow-sm" />
            <span className="size-3 rounded-full bg-green-500/80 shadow-sm" />
          </div>
          <div className="flex items-center justify-center bg-black/50 border border-white/10 rounded-md px-6 py-1 text-[11px] text-muted-foreground font-mono select-none w-1/3">
            <span className="opacity-50">https://</span>trimly.com.br
          </div>
          <div className="w-16" /> {/* spacer */}
        </div>

        {/* Slide Image Box */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0A0A0A] rounded-b-xl border-t border-white/5">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out flex items-center justify-center ${
                index === activeSlide ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
              }`}
            >
              {/* Fake UI placeholders in case images don't load, looking premium */}
              <div className="absolute inset-0 bg-gradient-to-br from-card to-background p-8 opacity-20"></div>
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-top relative z-10 shadow-2xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('bg-grid-white/[0.02]');
                }}
              />
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`h-2 rounded-full transition-all duration-500 ${
                index === activeSlide ? "bg-primary w-8 shadow-[0_0_10px_rgba(201,138,91,0.8)]" : "bg-white/30 w-2 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-primary-foreground relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-60 pointer-events-none blur-3xl"></div>
      <div className="absolute -top-[300px] -right-[300px] size-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[40%] -left-[200px] size-[400px] rounded-full bg-accent/5 blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Trimly" width={240} height={60} className="object-contain" priority />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</Link>
            <Link href="#beneficios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Vantagens</Link>
            <Link href="#preco" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Planos</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="font-medium">Entrar</Button>
            </Link>
            <Link href="/assinar">
              <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full px-6">
                Assinar Agora <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-12 md:pt-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm mb-4 backdrop-blur-sm"
            >
              <Sparkles className="size-4 text-primary" />
              <span className="text-muted-foreground">O novo padrão em gestão para barbearias</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              Agendamento perfeito, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                gestão implacável.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Esqueça o caos do WhatsApp. Ofereça uma experiência premium de agendamento para seus clientes e assuma o controle total do seu negócio em um único lugar.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Link href="/assinar">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 h-14 rounded-full shadow-[0_0_30px_rgba(201,138,91,0.3)] hover:shadow-[0_0_40px_rgba(201,138,91,0.4)] transition-all">
                  Começar a Vender Mais
                </Button>
              </Link>
              <Link href="#funcionalidades">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-14 rounded-full border-white/10 hover:bg-white/5">
                  Conhecer a Plataforma
                </Button>
              </Link>
            </motion.div>

            <ProductDemoSlider />
          </div>
        </section>

        {/* Features Grid */}
        <section id="funcionalidades" className="container mx-auto px-6 mt-32">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Tudo desenhado para sua escala</h2>
            <p className="text-muted-foreground">Funcionalidades poderosas escondidas atrás de uma interface incrivelmente simples e elegante.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Calendar} 
              title="Agendamento Inteligente" 
              description="Seus clientes agendam 24/7 sem atritos. A agenda se otimiza sozinha para maximizar seu tempo." 
            />
            <FeatureCard 
              icon={Users} 
              title="Gestão de Clientes CRM" 
              description="Histórico de cortes, preferências e frequência. Conheça seu cliente como nunca antes." 
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Analytics Financeiro" 
              description="Faturamento, ticket médio e taxa de ocupação em dashboards visuais e diretos ao ponto." 
            />
          </div>
        </section>

        {/* Pricing */}
        <section id="preco" className="container mx-auto px-6 mt-32">
          <div className="max-w-5xl mx-auto rounded-3xl border border-white/10 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="grid md:grid-cols-2">
              <div className="p-10 md:p-16 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5 relative z-10">
                <Badge variant="outline" className="w-fit mb-6 border-primary/30 text-primary uppercase tracking-widest text-[10px]">
                  Simples e Transparente
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  Apenas R$ 49<span className="text-2xl text-muted-foreground font-normal">/mês</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Um plano único. Sem taxas escondidas, sem comissões por agendamento. Todas as funcionalidades liberadas.
                </p>
                <Link href="/assinar" className="mt-auto">
                  <Button size="lg" className="w-full h-14 rounded-xl text-base shadow-lg shadow-primary/20">
                    Começar Agora
                  </Button>
                </Link>
              </div>
              <div className="p-10 md:p-16 bg-black/20 relative z-10">
                <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                  <Zap className="size-5 text-accent" />
                  Tudo que está incluso:
                </h3>
                <div className="space-y-4">
                  <PricingFeature text="Agendamentos e serviços ilimitados" />
                  <PricingFeature text="Gestão de clientes avançada" />
                  <PricingFeature text="Múltiplos profissionais na mesma conta" />
                  <PricingFeature text="Link de agendamento personalizado" />
                  <PricingFeature text="Lembretes via WhatsApp integrados" />
                  <PricingFeature text="Relatórios de performance e faturamento" />
                  <PricingFeature text="Suporte técnico prioritário" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Trimly" width={180} height={45} className="object-contain" />
          </Link>
          <div className="flex items-center gap-8 text-sm text-muted-foreground font-medium">
            <Link href="#" className="hover:text-foreground transition-colors">Termos de Uso</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contato</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Trimly. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-card border border-white/5 hover:border-primary/30 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5">
      <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
        <Icon className="size-6 text-primary" />
      </div>
      <h3 className="font-bold text-xl mb-3 tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function PricingFeature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="size-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
        <CheckCircle2 className="size-3.5 text-green-500" />
      </div>
      <span className="text-muted-foreground">{text}</span>
    </div>
  )
}
