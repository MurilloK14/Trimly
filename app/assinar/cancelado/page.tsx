"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { XCircle, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createCheckoutSession } from "@/lib/actions/stripe/checkout"
import { toast } from "sonner"

export default function AssinaturaCalceladaPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleRetry = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        toast.error(data.error ?? 'Erro ao iniciar o checkout.')
        setIsLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      toast.error('Erro ao conectar com o sistema de pagamentos.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Trimly"
              width={200}
              height={60}
              className="object-contain"
            />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-6">

          {/* Ícone */}
          <div className="flex justify-center">
            <div className="size-16 rounded-full bg-secondary flex items-center justify-center">
              <XCircle className="size-8 text-muted-foreground" />
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Checkout cancelado</h1>
            <p className="text-muted-foreground">
              Você cancelou o processo de assinatura. Nenhuma cobrança foi realizada.
            </p>
          </div>

          {/* Mensagem */}
          <div className="rounded-xl bg-card border border-border p-5 text-left">
            <p className="text-sm text-muted-foreground">
              Quando você estiver pronto, pode iniciar o processo novamente. Os seus 7 dias grátis continuam disponíveis — sem compromisso durante o período de teste.
            </p>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleRetry}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Aguarde...
                </>
              ) : (
                "Tentar novamente"
              )}
            </Button>

            <Button asChild variant="ghost" size="lg" className="w-full gap-2">
              <Link href="/assinar">
                <ArrowLeft className="size-4" />
                Voltar para os planos
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
