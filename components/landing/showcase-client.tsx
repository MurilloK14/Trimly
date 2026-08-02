"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { 
  Scissors, 
  Clock, 
  DollarSign, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Star, 
  Smartphone, 
  CalendarDays,
  Sparkles
} from "lucide-react"

interface Slide {
  id: number
  badge: string
  title: string
  description: string
  benefit: string
  renderMockup: () => React.JSX.Element
}

export function ShowcaseClient() {
  const [activeIndex, setActiveIndex] = useState(0)

  const slides: Slide[] = [
    {
      id: 0,
      badge: "Passo 1: Seleção de Serviços",
      title: "Interface simples e irresistível para o cliente",
      description: "Seus clientes veem fotos dos serviços, duração aproximada de cada procedimento e preços com total clareza.",
      benefit: "Agendamento concluído em menos de 1 minuto",
      renderMockup: () => (
        <div className="w-full h-full bg-stone-950 text-stone-100 p-4 font-sans flex flex-col gap-3 text-left select-none">
          {/* Header */}
          <div className="text-center pb-2 border-b border-stone-800">
            <h4 className="font-rye text-amber-500 text-xs tracking-wider" style={{ fontFamily: "var(--font-rye)" }}>Don Barber</h4>
            <p className="text-[7px] text-stone-400">Escolha o serviço desejado</p>
          </div>
          {/* Services list simulation */}
          <div className="flex-1 space-y-2 overflow-y-auto">
            {[
              { name: "Corte Degradê", duration: "45 min", price: "50", desc: "Degradê navalhado moderno com finalização", selected: true },
              { name: "Corte + Barba", duration: "60 min", price: "65", desc: "Combo completo com toalha quente", selected: false },
              { name: "Barba Terapia", duration: "30 min", price: "35", desc: "Barba completa na lâmina e hidratação", selected: false }
            ].map((srv, idx) => (
              <div 
                key={idx} 
                className={`p-2.5 rounded-lg border text-xs transition-all ${
                  srv.selected 
                    ? "border-amber-500 bg-amber-500/5 text-stone-100" 
                    : "border-stone-800 bg-stone-900/40 text-stone-400"
                }`}
              >
                <div className="flex justify-between items-start mb-0.5">
                  <span className="font-bold text-[9px] text-stone-200">{srv.name}</span>
                  {srv.selected && <span className="size-3.5 rounded-full bg-amber-500 flex items-center justify-center"><Check className="size-2 text-stone-950" /></span>}
                </div>
                <p className="text-[8px] text-stone-400 leading-normal mb-1.5">{srv.desc}</p>
                <div className="flex gap-2 text-[8px]">
                  <span className="text-amber-500 font-bold">R$ {srv.price}</span>
                  <span>•</span>
                  <span>{srv.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 1,
      badge: "Passo 2: Escolha do Profissional",
      title: "Seus profissionais em destaque",
      description: "O cliente pode selecionar o barbeiro preferido, visualizando a foto de perfil, avaliação em estrelas e especialidades.",
      benefit: "Fortalece a conexão entre cliente e barbeiro",
      renderMockup: () => (
        <div className="w-full h-full bg-stone-950 text-stone-100 p-4 font-sans flex flex-col gap-3 text-left select-none">
          {/* Header */}
          <div className="text-center pb-2 border-b border-stone-800">
            <h4 className="font-rye text-amber-500 text-xs tracking-wider" style={{ fontFamily: "var(--font-rye)" }}>Don Barber</h4>
            <p className="text-[7px] text-stone-400">Selecione seu profissional</p>
          </div>
          {/* Barbers list */}
          <div className="flex-1 space-y-2 overflow-y-auto">
            {[
              { name: "João Silva", rating: "4.9", avatar: "joao", specialties: ["Degradê", "Barba"], selected: true },
              { name: "Pedro Santos", rating: "4.8", avatar: "pedro", specialties: ["Platinado", "Social"], selected: false },
              { name: "Lucas Oliveira", rating: "4.7", avatar: "lucas", specialties: ["Social", "Navalha"], selected: false }
            ].map((brb, idx) => (
              <div 
                key={idx} 
                className={`p-2.5 rounded-lg border flex items-center gap-3 transition-all ${
                  brb.selected 
                    ? "border-amber-500 bg-amber-500/5" 
                    : "border-stone-800 bg-stone-900/40"
                }`}
              >
                <div className="size-8 rounded-full border border-stone-800 bg-stone-900 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">{brb.avatar[0]}{brb.avatar[1]}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[9px] text-stone-200">{brb.name}</span>
                    <span className="text-[8px] text-amber-500 flex items-center gap-0.5"><Star className="size-2 fill-amber-500" /> {brb.rating}</span>
                  </div>
                  <div className="flex gap-1 mt-0.5">
                    {brb.specialties.map((spec) => (
                      <span key={spec} className="text-[6px] px-1 py-0.5 rounded bg-stone-800 text-stone-400">{spec}</span>
                    ))}
                  </div>
                </div>
                {brb.selected && <span className="size-3.5 rounded-full bg-amber-500 flex items-center justify-center"><Check className="size-2 text-stone-950" /></span>}
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 2,
      badge: "Passo 3: Confirmação Rápida",
      title: "Data e hora selecionados visualmente",
      description: "Um calendário limpo e organizado com listagem de horários disponíveis. Sem chance de marcações duplicadas.",
      benefit: "Sincronização instantânea com a agenda do barbeiro",
      renderMockup: () => (
        <div className="w-full h-full bg-stone-950 text-stone-100 p-4 font-sans flex flex-col gap-3 text-left select-none justify-between">
          {/* Header */}
          <div className="text-center pb-2 border-b border-stone-800">
            <h4 className="font-rye text-amber-500 text-xs tracking-wider" style={{ fontFamily: "var(--font-rye)" }}>Don Barber</h4>
            <p className="text-[7px] text-stone-400">Escolha a data e horário</p>
          </div>
          {/* Mini Calendar Mockup */}
          <div className="grid grid-cols-7 gap-1 text-center text-[7px] bg-stone-900/40 p-2 rounded-lg border border-stone-800/80">
            {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
              <span key={i} className="text-stone-500 font-bold">{d}</span>
            ))}
            {[18, 19, 20, 21, 22, 23, 24].map((day, i) => (
              <span key={i} className={`p-1 rounded ${i === 3 ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-300"}`}>{day}</span>
            ))}
          </div>
          {/* Times Grid */}
          <div className="grid grid-cols-4 gap-1 text-center">
            {["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30"].map((t, i) => (
              <span key={i} className={`py-1 rounded text-[7px] font-mono border ${i === 2 ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-stone-800 text-stone-400"}`}>{t}</span>
            ))}
          </div>
          {/* Action Button */}
          <div className="w-full bg-amber-500 text-stone-950 font-bold text-[9px] py-2 rounded text-center cursor-pointer shadow-md flex items-center justify-center gap-1 mt-1">
            <CalendarDays className="size-3" /> Confirmar Meu Horário
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
      return "opacity-40 scale-80 z-10 brightness-50 blur-[1.5px] translate-x-[25%] md:translate-x-[35%] pointer-events-none absolute"
    } else {
      return "opacity-40 scale-80 z-10 brightness-50 blur-[1.5px] -translate-x-[25%] md:-translate-x-[35%] pointer-events-none absolute"
    }
  }

  return (
    <section className="py-20 bg-background overflow-hidden relative">
      <div className="container mx-auto px-4">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            Visão do Cliente
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-rye)" }}>
            Agendamento Rápido no Celular
          </h2>
          <p className="font-playfair text-muted-foreground italic text-sm sm:text-base">
            Seus clientes agendam direto do próprio smartphone em poucos cliques. Sem necessidade de baixar aplicativos.
          </p>
        </div>

        {/* Apple TV Style Smartphone Showcase Slider */}
        <div className="relative flex items-center justify-center max-w-4xl mx-auto h-[440px] md:h-[500px]">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`w-[210px] sm:w-[250px] aspect-[9/18] transition-all duration-700 ease-in-out ${getSlideClasses(
                index
              )}`}
            >
              {/* Premium Phone Frame Mockup */}
              <div className="w-full h-full rounded-[38px] border-[6px] border-stone-800 bg-stone-950 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col group relative">
                {/* Speaker & Sensor bar */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-stone-900 rounded-full z-40 flex items-center justify-center gap-1">
                  <span className="size-1 rounded-full bg-stone-800" />
                  <span className="w-8 h-0.5 bg-stone-800 rounded-full" />
                </div>
                {/* Screen content padding */}
                <div className="flex-1 pt-6 overflow-hidden relative bg-stone-950">
                  {slide.renderMockup()}
                </div>
              </div>
            </div>
          ))}

          {/* Controls */}
          <button
            onClick={() => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 sm:left-16 z-40 size-11 rounded-full bg-background/80 hover:bg-background border border-border flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          >
            <ChevronLeft className="size-5 text-foreground" />
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 sm:right-16 z-40 size-11 rounded-full bg-background/80 hover:bg-background border border-border flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          >
            <ChevronRight className="size-5 text-foreground" />
          </button>
        </div>

        {/* Details card below */}
        <div className="max-w-2xl mx-auto text-center mt-12 space-y-3 px-4">
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
            <Sparkles className="size-3.5" /> {slides[activeIndex].benefit}
          </div>
        </div>

      </div>
    </section>
  )
}
