"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react"
import { login } from "@/lib/actions/auth"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [emailValue, setEmailValue] = useState("")

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('registered') === 'true') {
        setIsRegistered(true)
      }
      const emailParam = params.get('email')
      if (emailParam) {
        setEmailValue(emailParam)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    const formData = new FormData(e.currentTarget)
    const redirectParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('redirect') : null
    if (redirectParam) {
      formData.set('redirectTo', redirectParam)
    }
    const result = await login(formData)

    if (result && !result.success) {
      setErrorMsg(result.error)
      toast({
        title: "Erro ao entrar",
        description: result.error,
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <Image 
              src="/logo.png" 
              alt="Trimly" 
              width={200} 
              height={60}
              className="object-contain"
            />
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Acesse sua conta</h1>
            <p className="text-muted-foreground">Entre com seus dados de assinante</p>
          </div>

          {isRegistered && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-start gap-3">
              <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-sm text-foreground">Conta criada com sucesso!</p>
                <p className="text-muted-foreground mt-0.5">
                  Sua assinatura está ativa. Digite sua senha abaixo para entrar no painel.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                className="h-11 bg-secondary/50 border-border"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  className="h-11 bg-secondary/50 border-border pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
              {isLoading ? (
                <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-lg bg-secondary/30 border border-border">
            <p className="text-sm text-muted-foreground text-center">
              Ainda não é assinante?{" "}
              <Link href="/assinar" className="text-primary hover:underline font-medium">
                Começar 14 dias grátis
              </Link>
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              O acesso ao sistema é liberado imediatamente após a assinatura.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Ao entrar, você concorda com nossos{" "}
              <Link href="#" className="text-primary hover:underline">Termos de Serviço</Link>
              {" "}e{" "}
              <Link href="#" className="text-primary hover:underline">Política de Privacidade</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-card border-l border-border items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex justify-center mb-8">
            <Image 
              src="/logo.png" 
              alt="Trimly" 
              width={260} 
              height={70}
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Bem-vindo de volta</h2>
          <p className="text-muted-foreground mb-8">
            Acesse seu painel para gerenciar agendamentos, clientes e acompanhar o desempenho da sua barbearia.
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <div className="text-muted-foreground">Agendamentos</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <div className="text-muted-foreground">Clientes</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <div className="text-muted-foreground">Relatórios</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
