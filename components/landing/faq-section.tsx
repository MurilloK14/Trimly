"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      question: "Como funciona a personalização da marca?",
      answer: "Assim que criar sua conta, você pode definir o nome da sua barbearia e configurar um slug personalizado (ex: /agendar/sua-marca). Você também pode escolher entre nossos presets visuais premium ou subir o logotipo oficial da sua barbearia. Essa identidade será exibida em toda a página pública de agendamento."
    },
    {
      question: "Meus clientes precisam baixar algum aplicativo?",
      answer: "Não! A página de agendamento é 100% web e otimizada para dispositivos móveis. Seus clientes podem acessar de qualquer celular, tablet ou computador e concluir o agendamento em segundos via navegador."
    },
    {
      question: "Há algum limite de agendamentos ou profissionais cadastrados?",
      answer: "De forma alguma. No nosso plano único, você pode cadastrar quantos barbeiros quiser na equipe e receber quantos agendamentos forem necessários, sem custos extras."
    },
    {
      question: "Posso cancelar minha assinatura a qualquer momento?",
      answer: "Sim! Não cobramos taxas de fidelidade ou taxas ocultas de cancelamento. Você pode cancelar sua assinatura diretamente no painel administrativo a qualquer momento."
    },
    {
      question: "Como os barbeiros da equipe controlam suas agendas?",
      answer: "Cada profissional cadastrado no sistema pode ter acesso individual ao painel para acompanhar sua agenda diária, configurar especialidades de serviços e registrar horários de atendimento."
    },
    {
      question: "O sistema possui suporte se eu precisar de ajuda?",
      answer: "Sim! Oferecemos suporte prioritário via WhatsApp diretamente com nossa equipe técnica para ajudar você a configurar o sistema e tirar o melhor proveito das ferramentas de venda."
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-background via-secondary/5 to-background border-t border-border/40" id="faq">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            Dúvidas Frequentes
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-rye)" }}>
            Perguntas Frequentes
          </h2>
          <p className="font-playfair text-muted-foreground italic text-sm sm:text-base">
            Tire suas principais dúvidas sobre o funcionamento do MK Barber e a contratação do serviço.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div 
                key={index} 
                className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/20"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 font-semibold text-xs sm:text-sm text-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="size-4 text-primary shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown className={`size-4 text-muted-foreground shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`} />
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[300px] border-t border-border/60" : "max-h-0"
                  }`}
                >
                  <p className="px-6 py-5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
