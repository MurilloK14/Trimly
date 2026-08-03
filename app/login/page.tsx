"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { login } from "@/lib/actions/auth"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    const formData = new FormData(e.currentTarget)
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
              alt="MK Barber" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
            <span style={{ fontFamily: "var(--font-rye)" }} className="text-lg text-primary">MK Barber</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Acesse sua conta</h1>
            <p className="text-muted-foreground">Entre com seus dados de assinante</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                className="h-11 bg-secondary/50 border-border"
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
                Assine agora
              </Link>
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
              alt="MK Barber" 
              width={100} 
              height={100}
              className="rounded-2xl"
            />
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-rye)" }}>Bem-vindo de volta</h2>
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
