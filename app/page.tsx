"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
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
  Scissors,
  Link2,
  Palette,
  Bell,
  MessageSquare,
  UserCheck,
  TrendingUp,
  Check,
  X,
  Menu,
  ChevronRight
} from "lucide-react"

function ProductDemoSlider() {
  const [activeSlide, setActiveSlide] = useState(0)
  const slides = [
    {
      title: "Controle Total na sua Mão",
      description: "Métricas de faturamento, ocupação, gestão de equipe e agenda unificada em um único painel.",
      image: "/dashboard_demo.jpg",
      tag: "Gestão Avançada"
    },
    {
      title: "Confirmação Instantânea",
      description: "Finalização clara e profissional, passando credibilidade imediata ao seu cliente.",
      image: "/confirmation_demo.jpg",
      tag: "Credibilidade"
    },
    {
      title: "Agendamento Sem Atrito",
      description: "Interface intuitiva onde tanto você quanto seus clientes agendam serviços 24/7 de forma rápida e elegante.",
      image: "/scheduling_demo.jpg",
      tag: "Experiência do Cliente"
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
                className="w-full h-full object-cover object-center relative z-10 shadow-2xl"
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-primary-foreground relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-60 pointer-events-none blur-3xl"></div>
      <div className="absolute -top-[300px] -right-[300px] size-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[40%] -left-[200px] size-[400px] rounded-full bg-accent/5 blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Trimly" width={240} height={60} className="object-contain" priority />
          </Link>
          <nav className="hidden lg:flex items-center gap-7">
            <Link href="#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</Link>
            <Link href="#modulos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Módulos</Link>
            <Link href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Como Funciona</Link>
            <Link href="#beneficios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Vantagens</Link>
            <Link href="#comparativo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Comparativo</Link>
            <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dúvidas</Link>
            <Link href="#preco" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Planos</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="font-medium">Entrar</Button>
            </Link>
            <Link href="/assinar">
              <Button className="gap-2 shadow-lg shadow-primary/20 rounded-full px-5 sm:px-6 text-sm sm:text-base">
                Assinar Agora <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-background/95 backdrop-blur-2xl border-b border-white/10 px-6 py-4 space-y-3"
          >
            <Link 
              href="#funcionalidades" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground py-1"
            >
              Funcionalidades
            </Link>
            <Link 
              href="#modulos" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground py-1"
            >
              Módulos da Barbearia
            </Link>
            <Link 
              href="#como-funciona" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground py-1"
            >
              Como Funciona
            </Link>
            <Link 
              href="#beneficios" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground py-1"
            >
              Vantagens Exclusivas
            </Link>
            <Link 
              href="#comparativo" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground py-1"
            >
              Comparativo
            </Link>
            <Link 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground py-1"
            >
              Dúvidas Frequentes
            </Link>
            <Link 
              href="#preco" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground py-1"
            >
              Planos
            </Link>
            <div className="pt-2 border-t border-white/10 sm:hidden">
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Entrar na minha conta
              </Link>
            </div>
          </motion.div>
        )}
      </header>

      <main className="pb-24 relative z-10">
        {/* Hero Section Wrapper */}
        <div className="relative pt-32 pb-16 md:pb-24 overflow-hidden">
          {/* Background Image & Overlay */}
          <div className="absolute top-0 inset-x-0 h-[600px] md:h-[800px] z-0">
            <Image 
              src="/hero-bg.jpg" 
              alt="Barbearia Background" 
              fill
              className="object-cover object-center"
              priority
            />
            {/* Dark overlay for text readability - reduced for better visibility */}
            <div className="absolute inset-0 bg-black/50"></div>
            {/* Gradient overlay for smooth transition to the background color */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"></div>
          </div>

          <section className="container mx-auto px-6 pt-12 md:pt-20 relative z-10">
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
        </div>

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
              description="Tanto o barbeiro quanto os clientes agendam 24/7 sem atritos. A agenda se otimiza sozinha para maximizar seu tempo." 
            />
            <FeatureCard 
              icon={Users} 
              title="Gestão de Clientes CRM" 
              description="Histórico de cortes, preferências e frequência. Conheça seu cliente como nunca antes." 
            />
            <FeatureCard 
              icon={Bell} 
              title="Notificações em Tempo Real" 
              description="Saiba instantaneamente quando um novo cliente agendar ou cancelar, direto no seu painel." 
            />
          </div>
        </section>

        {/* Interactive Modules Tabs Section */}
        <section id="modulos" className="container mx-auto px-6 mt-36 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" />
              Módulos e Recursos da Barbearia
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Tudo o que sua barbearia precisa, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                em um único ecossistema.
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Navegue pelas abas abaixo e explore como cada ferramenta do Trimly foi desenhada para valorizar o seu trabalho e acelerar o crescimento do seu negócio.
            </p>
          </div>

          <Tabs defaultValue="agenda" className="w-full max-w-5xl mx-auto">
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto p-1.5 bg-card/60 backdrop-blur-md border border-white/10 rounded-2xl gap-1.5 mb-8">
              <TabsTrigger value="agenda" className="py-3 px-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-xs sm:text-sm gap-2 transition-all">
                <Calendar className="size-4" />
                <span>Agenda 24/7</span>
              </TabsTrigger>
              <TabsTrigger value="equipe" className="py-3 px-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-xs sm:text-sm gap-2 transition-all">
                <Users className="size-4" />
                <span>Equipe & Comissões</span>
              </TabsTrigger>
              <TabsTrigger value="financeiro" className="py-3 px-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-xs sm:text-sm gap-2 transition-all">
                <BarChart3 className="size-4" />
                <span>Financeiro & Métricas</span>
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="py-3 px-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-xs sm:text-sm gap-2 transition-all">
                <MessageSquare className="size-4" />
                <span>Lembretes WhatsApp</span>
              </TabsTrigger>
              <TabsTrigger value="clientes" className="col-span-2 sm:col-span-1 py-3 px-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-xs sm:text-sm gap-2 transition-all">
                <UserCheck className="size-4" />
                <span>CRM de Clientes</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: AGENDA */}
            <TabsContent value="agenda" className="focus-visible:outline-none">
              <div className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[90px] pointer-events-none" />
                <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
                  <div className="lg:col-span-6 space-y-6">
                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 uppercase tracking-widest text-[11px] px-3 py-1">
                      Agendamento Inteligente
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                      Sua agenda ocupada 24 horas por dia, sem você mexer no celular
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      Ofereça aos seus clientes uma experiência rápida e profissional. Eles escolhem o corte ou barba, selecionam o barbeiro de preferência e confirmam o horário em poucos segundos.
                    </p>
                    <div className="space-y-3 pt-2">
                      <TabFeatureItem text="Link personalizado que funciona direto no navegador, sem precisar instalar app" />
                      <TabFeatureItem text="Bloqueio instantâneo de horários para evitar agendamentos duplos" />
                      <TabFeatureItem text="Intervalos configuráveis entre atendimentos para higienização e descanso" />
                      <TabFeatureItem text="Visualização diária, semanal e modo lista para você e seus barbeiros" />
                    </div>
                    <div className="pt-4">
                      <Link href="/assinar">
                        <Button className="rounded-full px-6 gap-2 shadow-lg shadow-primary/20">
                          Experimentar Módulo de Agenda <ArrowRight className="size-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    <div className="rounded-2xl border border-white/10 bg-black/60 p-5 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                            <Calendar className="size-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">Agenda de Hoje • Sábado</p>
                            <p className="text-[11px] text-muted-foreground">8 agendamentos previstos</p>
                          </div>
                        </div>
                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-medium border border-green-500/20">
                          Taxa de ocupação: 92%
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-primary">09:00</span>
                            <div>
                              <p className="text-xs font-semibold text-foreground">Lucas Silva</p>
                              <p className="text-[11px] text-muted-foreground">Corte Degradê + Barboterapia</p>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 font-medium">Confirmado</span>
                        </div>

                        <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-primary">10:00</span>
                            <div>
                              <p className="text-xs font-semibold text-foreground">Matheus Fontana</p>
                              <p className="text-[11px] text-muted-foreground">Corte Social + Sobrancelha</p>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium animate-pulse">Em atendimento</span>
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between opacity-80">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-primary">11:00</span>
                            <div>
                              <p className="text-xs font-semibold text-foreground">Gabriel Nogueira</p>
                              <p className="text-[11px] text-muted-foreground">Barba Alinhada na Toalha Quente</p>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 font-medium">Confirmado</span>
                        </div>

                        <div className="p-2.5 rounded-xl border border-dashed border-white/10 flex items-center justify-between text-muted-foreground bg-white/[0.01]">
                          <span className="font-mono text-xs text-muted-foreground">11:45</span>
                          <span className="text-[11px]">Horário Livre para Agendamento Online</span>
                          <span className="text-[10px] text-primary underline">Disponível</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: EQUIPE */}
            <TabsContent value="equipe" className="focus-visible:outline-none">
              <div className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-[90px] pointer-events-none" />
                <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
                  <div className="lg:col-span-6 space-y-6">
                    <Badge variant="outline" className="border-accent/30 text-accent bg-accent/10 uppercase tracking-widest text-[11px] px-3 py-1">
                      Gestão de Barbeiros
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                      Múltiplos profissionais com comissões calculadas no piloto automático
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      Chega de perder fins de semana fazendo contas no papel. Cada profissional tem sua comissão pré-definida, agenda individual e relatório transparente de serviços prestados.
                    </p>
                    <div className="space-y-3 pt-2">
                      <TabFeatureItem text="Comissões personalizadas por percentual ou valor fixo por serviço" />
                      <TabFeatureItem text="Acesso com login individual para cada barbeiro visualizar apenas seus agendamentos" />
                      <TabFeatureItem text="Definição de dias de folga, férias e pausas para almoço de cada colaborador" />
                      <TabFeatureItem text="Fechamento de comissões em 1 clique com extrato detalhado para pagamento" />
                    </div>
                    <div className="pt-4">
                      <Link href="/assinar">
                        <Button className="rounded-full px-6 gap-2 shadow-lg shadow-primary/20">
                          Gerenciar Minha Equipe <ArrowRight className="size-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    <div className="rounded-2xl border border-white/10 bg-black/60 p-5 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <p className="text-xs font-semibold text-foreground">Comissões do Dia • Fechamento</p>
                        <span className="text-[11px] text-muted-foreground font-mono">2 profissionais ativos</span>
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                                CS
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-foreground">Carlos Silveira</p>
                                <p className="text-[11px] text-muted-foreground">Barbeiro Master • 50% comissão</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-foreground">11 atendimentos</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-[11px]">
                            <div>
                              <span className="text-muted-foreground">Faturamento gerado:</span>
                              <p className="font-semibold text-foreground">R$ 770,00</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Comissão a repassar:</span>
                              <p className="font-semibold text-primary">R$ 385,00</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-full bg-accent/20 flex items-center justify-center font-bold text-xs text-accent">
                                LF
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-foreground">Lucas Fagundes</p>
                                <p className="text-[11px] text-muted-foreground">Especialista Fade • 50% comissão</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-foreground">9 atendimentos</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-[11px]">
                            <div>
                              <span className="text-muted-foreground">Faturamento gerado:</span>
                              <p className="font-semibold text-foreground">R$ 540,00</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Comissão a repassar:</span>
                              <p className="font-semibold text-primary">R$ 270,00</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: FINANCEIRO */}
            <TabsContent value="financeiro" className="focus-visible:outline-none">
              <div className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[90px] pointer-events-none" />
                <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
                  <div className="lg:col-span-6 space-y-6">
                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 uppercase tracking-widest text-[11px] px-3 py-1">
                      Métricas e Finanças
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                      Visão cirúrgica de faturamento, ticket médio e lucros
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      Tenha o controle total do dinheiro que entra na sua barbearia. Acompanhe gráficos em tempo real, compare o crescimento mês a mês e descubra quais serviços trazem mais lucro.
                    </p>
                    <div className="space-y-3 pt-2">
                      <TabFeatureItem text="Faturamento bruto e receita líquida em tempo real" />
                      <TabFeatureItem text="Cálculo automático de ticket médio por cliente atendido" />
                      <TabFeatureItem text="Ranking de serviços mais executados (Corte, Barba, Pigmentação)" />
                      <TabFeatureItem text="Histórico mensal completo para tomada de decisões estratégicas" />
                    </div>
                    <div className="pt-4">
                      <Link href="/assinar">
                        <Button className="rounded-full px-6 gap-2 shadow-lg shadow-primary/20">
                          Acessar Métricas Financeiras <ArrowRight className="size-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    <div className="rounded-2xl border border-white/10 bg-black/60 p-5 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Faturamento Este Mês</p>
                          <p className="text-2xl font-bold text-foreground tracking-tight">R$ 18.940,00</p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-semibold border border-green-500/20 flex items-center gap-1">
                          <TrendingUp className="size-3" /> +26.4%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                          <span className="text-[11px] text-muted-foreground">Ticket Médio</span>
                          <p className="text-lg font-bold text-foreground mt-0.5">R$ 68,50</p>
                          <span className="text-[10px] text-green-400 font-medium">Por atendimento</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                          <span className="text-[11px] text-muted-foreground">Cortes Realizados</span>
                          <p className="text-lg font-bold text-foreground mt-0.5">276 cortes</p>
                          <span className="text-[10px] text-primary font-medium">Neste mês</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                        <p className="text-xs font-semibold text-foreground">Serviços Mais Vendidos</p>
                        <div className="space-y-2 text-xs">
                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-muted-foreground">Combo Corte + Barba (R$ 90)</span>
                              <span className="font-semibold text-foreground">48%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: '48%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-muted-foreground">Corte Degradê / Fade (R$ 50)</span>
                              <span className="font-semibold text-foreground">36%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full bg-accent rounded-full" style={{ width: '36%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: WHATSAPP */}
            <TabsContent value="whatsapp" className="focus-visible:outline-none">
              <div className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-[90px] pointer-events-none" />
                <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
                  <div className="lg:col-span-6 space-y-6">
                    <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10 uppercase tracking-widest text-[11px] px-3 py-1">
                      Anti-Faltas Automático
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                      Lembretes automáticos pelo WhatsApp para zerar buracos na agenda
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      A maior causa de prejuízo em barbearias são clientes que marcam e esquecem de comparecer. O Trimly envia mensagens pontuais com aviso do horário, permitindo confirmação rápida.
                    </p>
                    <div className="space-y-3 pt-2">
                      <TabFeatureItem text="Mensagem de lembrete com nome do cliente, serviço, dia e hora" />
                      <TabFeatureItem text="Botão direto para confirmação ou cancelamento com antecedência" />
                      <TabFeatureItem text="Liberação imediata do horário caso o cliente precise desmarcar" />
                      <TabFeatureItem text="Redução de até 90% das faltas e cadeiras vazias no seu dia" />
                    </div>
                    <div className="pt-4">
                      <Link href="/assinar">
                        <Button className="rounded-full px-6 gap-2 shadow-lg shadow-primary/20">
                          Eliminar Faltas na Barbearia <ArrowRight className="size-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    <div className="rounded-2xl border border-white/10 bg-black/70 p-5 shadow-2xl space-y-3 font-sans">
                      <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                        <div className="size-9 rounded-full bg-green-600/20 text-green-400 flex items-center justify-center font-bold text-xs">
                          <MessageSquare className="size-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">Notificação Trimly • WhatsApp</p>
                          <p className="text-[10px] text-green-400">Enviada automaticamente antes do horário</p>
                        </div>
                      </div>

                      {/* WhatsApp Balloon Mockup */}
                      <div className="p-4 rounded-2xl rounded-tl-none bg-[#1F2C34] text-white/90 text-xs space-y-2 border border-white/5 shadow-md">
                        <p>Fala, <strong>Guilherme</strong>! Beleza? 💈</p>
                        <p className="leading-relaxed">
                          Passando para lembrar que o seu horário está marcado para hoje:
                        </p>
                        <div className="p-2.5 rounded-lg bg-black/30 space-y-1 text-[11px] font-mono border border-white/5">
                          <p>✂️ <strong>Serviço:</strong> Corte Degradê + Barba</p>
                          <p>⏰ <strong>Horário:</strong> Hoje às 16:30</p>
                          <p>👤 <strong>Barbeiro:</strong> Carlos Silveira</p>
                        </div>
                        <p className="text-[11px] text-white/70">
                          Podemos confirmar a sua presença?
                        </p>
                        <div className="flex gap-2 pt-1">
                          <span className="px-3 py-1.5 rounded-md bg-green-600 text-white font-semibold text-[10px] shadow cursor-default">
                            ✅ Confirmar Presença
                          </span>
                          <span className="px-3 py-1.5 rounded-md bg-white/10 text-white/80 font-medium text-[10px] cursor-default">
                            🔄 Remarcar
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 pt-1">
                        <span>Status de entrega:</span>
                        <span className="text-green-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="size-3" /> Entregue e confirmado
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: CRM & CLIENTES */}
            <TabsContent value="clientes" className="focus-visible:outline-none">
              <div className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[90px] pointer-events-none" />
                <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
                  <div className="lg:col-span-6 space-y-6">
                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 uppercase tracking-widest text-[11px] px-3 py-1">
                      Fidelização & CRM
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                      Histórico completo para transformar clientes eventuais em clientes fiéis
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      Mantenha o cadastro de todos os seus clientes em um banco de dados próprio. Saiba as preferências de corte, quando ele costuma voltar e reative clientes sumidos.
                    </p>
                    <div className="space-y-3 pt-2">
                      <TabFeatureItem text="Ficha individual com histórico de cortes e gastos acumulados" />
                      <TabFeatureItem text="Anotações técnicas (número de máquina, estilo de fade e barba)" />
                      <TabFeatureItem text="Identificação de frequência média para antecipar novos agendamentos" />
                      <TabFeatureItem text="Sua lista de clientes é 100% sua e protegida na nuvem" />
                    </div>
                    <div className="pt-4">
                      <Link href="/assinar">
                        <Button className="rounded-full px-6 gap-2 shadow-lg shadow-primary/20">
                          Construir Minha Base de Clientes <ArrowRight className="size-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    <div className="rounded-2xl border border-white/10 bg-black/60 p-5 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">
                            RC
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">Rodrigo Costa</p>
                            <p className="text-[10px] text-muted-foreground">Cliente desde Março de 2024</p>
                          </div>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                          Cliente Frequente ⭐
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                          <span className="text-[10px] text-muted-foreground">Total Cortes</span>
                          <p className="font-bold text-foreground mt-0.5">14 visitas</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                          <span className="text-[10px] text-muted-foreground">Gasto Total</span>
                          <p className="font-bold text-primary mt-0.5">R$ 980,00</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                          <span className="text-[10px] text-muted-foreground">Frequência</span>
                          <p className="font-bold text-foreground mt-0.5">A cada 19 dias</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs">
                        <p className="font-semibold text-[11px] text-primary">Preferências registradas:</p>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          Degradê médio na 0.5, tesoura alinhada no topo sem desbaste e acabamento da barba na navalha com óleo finalizador.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* How It Works Section */}
        <section id="como-funciona" className="container mx-auto px-6 mt-36 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <Badge variant="outline" className="border-primary/30 text-primary uppercase tracking-widest text-[10px] bg-primary/10 px-3 py-1">
              Passo a Passo Simples
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Comece a usar em <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">menos de 3 minutos</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Sem instalações complicadas e sem burocracia. O Trimly foi feito para você começar a receber agendamentos hoje mesmo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <StepCard 
              step="01"
              title="Cadastre seus Serviços"
              description="Adicione seus cortes, barbas, preços e os horários de trabalho dos seus barbeiros em uma interface intuitiva."
              badge="Configuração Express"
            />
            <StepCard 
              step="02"
              title="Divulgue seu Link Próprio"
              description="Cole o link exclusivo da sua barbearia na bio do Instagram, envie no WhatsApp e coloque no Google Meu Negócio."
              badge="Zero Fricção"
            />
            <StepCard 
              step="03"
              title="Agenda no Piloto Automático"
              description="Seus clientes agendam sozinhos a qualquer hora do dia. Você recebe notificações em tempo real e atende sem preocupação."
              badge="Foco no Corte"
            />
          </div>
        </section>

        {/* Marketing Bonus Section */}
        <section id="beneficios" className="container mx-auto px-6 mt-36 scroll-mt-24">
          <div className="relative rounded-3xl border border-primary/40 bg-card/60 backdrop-blur-xl p-8 md:p-12 overflow-hidden shadow-[0_0_50px_rgba(201,138,91,0.15)] group hover:shadow-[0_0_80px_rgba(201,138,91,0.25)] transition-all">
            {/* Glowing Effects */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none group-hover:bg-primary/30 transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 space-y-6">
                <Badge variant="outline" className="border-primary/50 text-primary uppercase tracking-widest text-[10px] bg-primary/10 px-3 py-1 animate-pulse">
                  Bônus Exclusivo de Lançamento
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                  Melhore e automatize <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">seu negócio</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Além do melhor sistema de agendamento, liberamos ferramentas premium para você ter controle total da sua barbearia.
                </p>
                <div className="flex gap-4 pt-4">
                  <Link href="/assinar">
                    <Button size="lg" className="h-12 px-8 rounded-full shadow-[0_0_20px_rgba(201,138,91,0.3)]">
                      Garantir Meu Bônus
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="flex-1 w-full flex flex-col gap-4">
                <BonusCard 
                  icon={BarChart3}
                  title="Controle Financeiro Total"
                  description="Faturamento, ticket médio e taxa de ocupação em dashboards visuais."
                />
                <BonusCard 
                  icon={Link2}
                  title="Link Próprio Exclusivo"
                  description="Sua barbearia, suas regras. Tenha um link de agendamento personalizado."
                />
                <BonusCard 
                  icon={Palette}
                  title="Personalização Total"
                  description="Adapte o visual do sistema para ter a identidade única da sua marca."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Direct Comparison Section */}
        <section id="comparativo" className="container mx-auto px-6 mt-36 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge variant="outline" className="border-primary/30 text-primary uppercase tracking-widest text-[10px] bg-primary/10 px-3 py-1">
              Comparativo de Gestão
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              O fim do estresse com <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                WhatsApp e caderno de papel
              </span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Veja o impacto real na sua rotina ao trocar métodos improvisados por uma plataforma profissional dedicada para barbearias.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Old Way */}
            <div className="p-8 md:p-10 rounded-3xl bg-card/30 border border-red-500/20 backdrop-blur-xl relative overflow-hidden space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                  Do Jeito Tradicional
                </span>
                <X className="size-5 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">WhatsApp, Caderno & Planilhas</h3>
              <p className="text-sm text-muted-foreground">
                Processo manual que consome seu tempo livre e gera atritos constantes com clientes e barbeiros.
              </p>
              <div className="space-y-4 pt-2">
                <ComparisonRow isPositive={false} text="Clientes mandam mensagem fora do horário e ficam sem resposta imediata" />
                <ComparisonRow isPositive={false} text="Horários vazios e prejuízo por esquecimentos e clientes que faltam sem avisar" />
                <ComparisonRow isPositive={false} text="Interromper cortes de cabelo para atender telefone e digitar horários" />
                <ComparisonRow isPositive={false} text="Confusão e perda de tempo calculando comissões de barbeiros no papel" />
                <ComparisonRow isPositive={false} text="Zero controle real de faturamento, ticket médio e lucratividade do negócio" />
              </div>
            </div>

            {/* Trimly Way */}
            <div className="p-8 md:p-10 rounded-3xl bg-card/60 border border-primary/50 backdrop-blur-xl relative overflow-hidden space-y-6 shadow-[0_0_50px_rgba(201,138,91,0.15)]">
              <div className="absolute top-0 right-0 w-60 h-60 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/15 px-3 py-1 rounded-full border border-primary/30">
                  Com o Trimly
                </span>
                <CheckCircle2 className="size-5 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground relative z-10">Agendamento & Gestão Inteligente</h3>
              <p className="text-sm text-muted-foreground relative z-10">
                Tudo centralizado e automatizado para você focar no que realmente gera lucro: atender seus clientes.
              </p>
              <div className="space-y-4 pt-2 relative z-10">
                <ComparisonRow isPositive={true} text="Agendamento 24/7 sem atritos: seu cliente agenda a qualquer hora sozinho" />
                <ComparisonRow isPositive={true} text="Lembretes automáticos pelo WhatsApp que reduzem faltas em até 90%" />
                <ComparisonRow isPositive={true} text="Foco total nos atendimentos com notificações instantâneas no seu painel" />
                <ComparisonRow isPositive={true} text="Comissões de cada profissional calculadas automaticamente por atendimento" />
                <ComparisonRow isPositive={true} text="Painel financeiro com faturamento em tempo real, ticket médio e histórico" />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="container mx-auto px-6 mt-36 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <Badge variant="outline" className="border-primary/30 text-primary uppercase tracking-widest text-[10px] bg-primary/10 px-3 py-1">
              Dúvidas Comuns
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Perguntas <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Frequentes</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Tudo o que você precisa saber antes de transformar a gestão da sua barbearia.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="faq-1" className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm px-6 py-2">
                <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline hover:text-primary transition-colors py-4">
                  Meus clientes precisam baixar algum aplicativo para agendar?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Não! Esse é um dos maiores diferenciais do Trimly. Seus clientes acessam o link exclusivo da sua barbearia diretamente pelo navegador do celular (Safari, Chrome, etc.), sem precisar baixar nada nem criar senhas complicadas. É rápido, leve e intuitivo.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2" className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm px-6 py-2">
                <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline hover:text-primary transition-colors py-4">
                  Consigo cadastrar mais de um barbeiro ou colaborador na minha conta?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Com certeza! Você pode adicionar todos os profissionais da sua barbearia. Cada profissional tem sua própria agenda individual, horários de trabalho personalizados e relatório de comissões separado.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3" className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm px-6 py-2">
                <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline hover:text-primary transition-colors py-4">
                  Como funciona a cobrança? Existe contrato de fidelidade?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Sem taxas escondidas e sem comissões por agendamento. Estamos com a <strong>promoção especial de lançamento por apenas R$ 29,90/mês</strong> (preço normal de R$ 49,90/mês). Você tem acesso completo a todas as funcionalidades liberadas, sem contrato de fidelidade e podendo cancelar a qualquer momento sem nenhuma multa.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4" className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm px-6 py-2">
                <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline hover:text-primary transition-colors py-4">
                  O sistema funciona bem no celular ou preciso de computador?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  O Trimly funciona perfeitamente em qualquer dispositivo. Tanto a tela do cliente quanto o painel administrativo do barbeiro foram desenhados pensando em celulares e tablets, permitindo gerenciar tudo na palma da mão enquanto você está na barbearia.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-5" className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm px-6 py-2">
                <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline hover:text-primary transition-colors py-4">
                  Como os lembretes automáticos ajudam a reduzir faltas?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  A grande maioria dos clientes que faltam simplesmente se esquecem do compromisso. O Trimly envia mensagens de lembrete com os detalhes do corte, permitindo que o cliente confirme presença ou avise com antecedência caso precise remarcar, liberando o horário para outro cliente.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-6" className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm px-6 py-2">
                <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline hover:text-primary transition-colors py-4">
                  E se eu tiver dúvidas durante a configuração da barbearia?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Você conta com suporte direto via WhatsApp para te auxiliar no cadastro de serviços, horários e equipe. Nossa equipe está pronta para garantir que sua barbearia comece a receber agendamentos sem nenhuma complicação.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Pricing */}
        <section id="preco" className="container mx-auto px-6 mt-36 scroll-mt-24">
          <div className="max-w-5xl mx-auto rounded-3xl border border-white/10 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="grid md:grid-cols-2">
              <div className="p-10 md:p-16 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5 relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="w-fit border-primary/40 text-primary uppercase tracking-widest text-[10px] bg-primary/10 px-3 py-1 font-semibold animate-pulse">
                    Oferta Especial de Lançamento
                  </Badge>
                  <span className="text-[11px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full">
                    40% OFF
                  </span>
                </div>
                <div className="mb-1">
                  <span className="text-base text-muted-foreground line-through">
                    De R$ 49,90/mês
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  Por R$ 29,90<span className="text-2xl text-muted-foreground font-normal">/mês</span>
                </h2>
                <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                  Garanta o valor promocional de lançamento com todas as funcionalidades liberadas. Sem taxas escondidas, sem comissões por agendamento e 14 dias grátis para testar.
                </p>
                <Link href="/assinar" className="mt-auto">
                  <Button size="lg" className="w-full h-14 rounded-xl text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                    Garantir Lançamento por R$ 29,90
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

function BonusCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-primary/30 transition-all group">
      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
        <Icon className="size-5 text-primary" />
      </div>
      <div>
        <h4 className="font-bold text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function TabFeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
        <Check className="size-3 text-primary" />
      </div>
      <span className="text-sm text-muted-foreground leading-snug">{text}</span>
    </div>
  )
}

function StepCard({ step, title, description, badge }: { step: string; title: string; description: string; badge: string }) {
  return (
    <div className="relative p-8 rounded-3xl bg-card/40 border border-white/10 backdrop-blur-xl hover:border-primary/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5">
      <div className="flex items-center justify-between mb-6">
        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-accent to-white/20 font-mono">
          {step}
        </span>
        <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 text-[11px]">
          {badge}
        </Badge>
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function ComparisonRow({ isPositive, text }: { isPositive: boolean; text: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className={`size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isPositive ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-400"
      }`}>
        {isPositive ? <Check className="size-3.5" /> : <X className="size-3.5" />}
      </div>
      <span className={isPositive ? "text-foreground font-medium leading-relaxed" : "text-muted-foreground leading-relaxed"}>
        {text}
      </span>
    </div>
  )
}
