"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  Calendar, 
  Palette, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Scissors
} from "lucide-react"

interface Slide {
  id: number
  badge: string
  title: string
  description: string
  benefit: string
  renderMockup: () => React.JSX.Element
}

export function ShowcaseBarber() {
  const [activeIndex, setActiveIndex] = useState(0)

  const slides: Slide[] = [
    {
      id: 0,
      badge: "Dashboard Completo",
      title: "Controle absoluto do seu faturamento",
      description: "Tenha relatórios detalhados, faturamento diário, taxa de ocupação e comissões calculadas automaticamente.",
      benefit: "Aumento médio de 25% no faturamento",
      renderMockup: () => (
        <div className="w-full h-full bg-slate-950 text-slate-100 p-4 font-sans flex flex-col gap-4 text-left select-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/20 border border-primary flex items-center justify-center">
                <Scissors className="size-4 text-primary" />
              </div>
              <span className="font-bold text-xs">Don Barber Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-400">Dados em tempo real</span>
            </div>
          </div>
          {/* Cards Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[9px] text-slate-400 block">Faturamento Hoje</span>
              <div className="text-sm font-bold text-primary">R$ 1.840,00</div>
              <span className="text-[8px] text-emerald-400 flex items-center gap-0.5"><TrendingUp className="size-2" /> +15%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[9px] text-slate-400 block">Ocupação da Agenda</span>
              <div className="text-sm font-bold text-slate-200">89%</div>
              <span className="text-[8px] text-slate-400">Excelente</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[9px] text-slate-400 block">Novos Clientes</span>
              <div className="text-sm font-bold text-slate-200">12</div>
              <span className="text-[8px] text-primary flex items-center gap-0.5"><Sparkles className="size-2" /> Recorde</span>
            </div>
          </div>
          {/* Chart area mockup */}
          <div className="flex-1 bg-slate-900/60 rounded-lg border border-slate-800 p-3 flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-slate-400 block mb-2">Desempenho Semanal (R$)</span>
            <div className="flex items-end justify-between h-20 px-4 pt-2">
              {[60, 45, 80, 55, 95, 120, 75].map((val, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 w-6">
                  <div 
                    style={{ height: `${val}%` }} 
                    className={`w-full rounded-t-sm transition-all duration-500 ${
                      idx === 5 ? "bg-primary" : "bg-primary/40"
                    }`} 
                  />
                  <span className="text-[8px] text-slate-500">
                    {["S", "T", "Q", "Q", "S", "S", "D"][idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 1,
      badge: "Agenda Inteligente",
      title: "Gestão completa de múltiplos barbeiros",
      description: "Cadastre profissionais com especialidades individuais, fotos e horários específicos. Evite choques e furos na agenda.",
      benefit: "Reduz faltas em até 80% com avisos",
      renderMockup: () => (
        <div className="w-full h-full bg-slate-950 text-slate-100 p-4 font-sans flex flex-col gap-3 text-left select-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold">Calendário de Atendimentos</span>
            <span className="text-[9px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">21 Mai, Quinta-feira</span>
          </div>
          {/* Team Row */}
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center text-[9px] font-bold">JS</div>
            <div className="size-6 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-500 flex items-center justify-center text-[9px] font-bold">PS</div>
            <div className="size-6 rounded-full bg-blue-500/20 border border-blue-500 text-blue-500 flex items-center justify-center text-[9px] font-bold">LO</div>
            <span className="text-[9px] text-slate-400">+ 3 barbeiros ativos</span>
          </div>
          {/* Timeline mockup */}
          <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
            {[
              { time: "09:00", client: "Eduardo Souza", service: "Corte Degradê", barber: "JS", status: "Confirmado", color: "border-l-primary bg-primary/5" },
              { time: "09:45", client: "Pedro Henrique", service: "Corte + Barba", barber: "PS", status: "Confirmado", color: "border-l-emerald-500 bg-emerald-500/5" },
              { time: "10:30", client: "Marcos Lima", service: "Barba Terapia", barber: "LO", status: "Em andamento", color: "border-l-blue-500 bg-blue-500/10" },
              { time: "11:15", client: "Lucas Silva", service: "Corte Social", barber: "JS", status: "Pendente", color: "border-l-yellow-500 bg-yellow-500/5" }
            ].map((slot, idx) => (
              <div key={idx} className={`p-2 rounded border border-slate-800/80 border-l-3 flex items-center justify-between text-xs ${slot.color}`}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-slate-400">{slot.time}</span>
                  <div>
                    <div className="font-semibold text-[10px] text-slate-200">{slot.client}</div>
                    <div className="text-[8px] text-slate-400">{slot.service}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-semibold">{slot.barber}</span>
                  <span className={`text-[8px] px-1 rounded-full font-bold ${slot.status === "Em andamento" ? "text-blue-400 bg-blue-400/10" : "text-slate-400 bg-slate-800"}`}>{slot.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 2,
      badge: "Configuração de Branding",
      title: "Seu nome, suas cores, sua marca",
      description: "Personalize completamente a página pública de agendamento. Suba seu logotipo, escolha presets visuais e crie um link único.",
      benefit: "Sua barbearia fortalecendo a marca local",
      renderMockup: () => (
        <div className="w-full h-full bg-slate-950 text-slate-100 p-4 font-sans flex flex-col gap-4 text-left select-none">
          {/* Header */}
          <div className="border-b border-slate-800 pb-2">
            <span className="text-xs font-bold">Identidade Visual da Barbearia</span>
          </div>
          {/* Form simulation */}
          <div className="space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 block">Nome da Barbearia</span>
                <div className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-200 font-medium">Navalha de Ouro</div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 block">Link de Agendamento (Slug)</span>
                <div className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-primary truncate">
                  mkbarber.com/agendar/navalha-de-ouro
                </div>
              </div>
            </div>
            
            {/* Live mockup rendering box */}
            <div className="p-3 rounded-lg border border-slate-800 bg-gradient-to-r from-amber-500/10 to-transparent flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full border border-primary flex items-center justify-center bg-black">
                  <Scissors className="size-3.5 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-amber-500 font-rye" style={{ fontFamily: "var(--font-rye)" }}>Navalha de Ouro</div>
                  <div className="text-[8px] text-slate-400">Agende em menos de 1 minuto</div>
                </div>
              </div>
              <div className="text-[8px] bg-primary text-black font-bold px-2 py-1 rounded">Agendar Agora</div>
            </div>
          </div>
        </div>
      )
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  const getSlideClasses = (index: number) => {
    const diff = (index - activeIndex + slides.length) % slides.length
    if (diff === 0) {
      return "opacity-100 scale-100 z-30 brightness-110 blur-none translate-x-0 relative"
    } else if (diff === 1) {
      return "opacity-45 scale-80 z-10 brightness-50 blur-[1px] translate-x-[30%] md:translate-x-[42%] pointer-events-none absolute"
    } else {
      return "opacity-45 scale-80 z-10 brightness-50 blur-[1px] -translate-x-[30%] -translate-x-[30%] md:-translate-x-[42%] pointer-events-none absolute"
    }
  }

  return (
    <section className="py-20 border-t border-border/40 bg-gradient-to-b from-background via-secondary/5 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            Painel do Proprietário
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-rye)" }}>
            Gestão Simplificada da Barbearia
          </h2>
          <p className="font-playfair text-muted-foreground italic text-sm sm:text-base">
            Tudo o que você precisa para controlar sua agenda, equipe de barbeiros e finanças em uma interface premium e veloz.
          </p>
        </div>

        {/* Apple TV / Netflix Showcase slider */}
        <div className="relative flex items-center justify-center max-w-6xl mx-auto h-[380px] md:h-[460px]">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`w-full max-w-[280px] sm:max-w-[480px] md:max-w-[640px] aspect-[16/10] transition-all duration-700 ease-in-out ${getSlideClasses(
                index
              )}`}
            >
              {/* Premium Browser Mockup */}
              <div className="w-full h-full rounded-2xl border border-slate-800 bg-slate-950 shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col group relative">
                {/* Browser bar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-red-500/70" />
                    <span className="size-2.5 rounded-full bg-yellow-500/70" />
                    <span className="size-2.5 rounded-full bg-green-500/70" />
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono select-none">
                    mkbarber.com/dashboard/{slide.id === 0 ? "financeiro" : slide.id === 1 ? "agenda" : "marca"}
                  </div>
                  <div className="w-12" />
                </div>
                {/* Simulated interface render */}
                <div className="flex-1 overflow-hidden relative">
                  {slide.renderMockup()}
                </div>
                
                {/* Blur edges decorative layer */}
                <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-slate-950 to-transparent opacity-30 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-slate-950 to-transparent opacity-30 pointer-events-none" />
              </div>
            </div>
          ))}

          {/* Navigation Controls */}
          <button
            onClick={() => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-2 md:left-12 z-40 size-11 rounded-full bg-background/80 hover:bg-background border border-border flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          >
            <ChevronLeft className="size-5 text-foreground" />
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
            className="absolute right-2 md:right-12 z-40 size-11 rounded-full bg-background/80 hover:bg-background border border-border flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          >
            <ChevronRight className="size-5 text-foreground" />
          </button>
        </div>

        {/* Dynamic Descriptive details (tied to active slide) */}
        <div className="max-w-2xl mx-auto text-center mt-10 space-y-3 px-4">
          <Badge className="bg-primary/10 text-primary border border-primary/20 py-1 px-3">
            {slides[activeIndex].badge}
          </Badge>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground transition-all duration-300">
            {slides[activeIndex].title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed transition-all duration-300">
            {slides[activeIndex].description}
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/5 py-1 px-3.5 rounded-full border border-primary/10">
            <ShieldCheck className="size-3.5" /> {slides[activeIndex].benefit}
          </div>
        </div>

      </div>
    </section>
  )
}
