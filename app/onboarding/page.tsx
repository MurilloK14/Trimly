"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Scissors,
  ArrowRight,
  User,
  Building2,
  Upload,
  Camera,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { compressAndValidateImage } from "@/lib/utils/image-compression"

interface FormData {
  senha: string
  confirmarSenha: string
  nomeBarbeiro: string
  nomeBarbearia: string
  fotoBarbeiro: string | null
  fotoBarbearia: string | null
}

export default function OnboardingPage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [customerEmail, setCustomerEmail] = useState<string>("")

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const barbeariaInputRef = useRef<HTMLInputElement>(null)
  const barbeiroInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<FormData>({
    senha: "",
    confirmarSenha: "",
    nomeBarbeiro: "",
    nomeBarbearia: "",
    fotoBarbeiro: null,
    fotoBarbearia: null,
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})

  // 1. Ler session_id da URL e validar com o Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sid = params.get("session_id")

    if (!sid) {
      setIsVerifying(false)
      setSessionError("Para criar sua conta, é necessário iniciar uma assinatura primeiro.")
      return
    }

    setSessionId(sid)

    fetch(`/api/stripe/session-info?session_id=${encodeURIComponent(sid)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.valid) {
          setSessionError(data.error || "Sessão de pagamento inválida ou não concluída.")
        } else if (data.alreadyCompleted) {
          setAlreadyCompleted(true)
        } else {
          setCustomerEmail(data.email || "")
          if (data.customerName) {
            setFormData((prev) => ({
              ...prev,
              nomeBarbeiro: prev.nomeBarbeiro || data.customerName,
            }))
          }
        }
      })
      .catch(() => {
        setSessionError("Erro ao conectar com o serviço de validação do Stripe.")
      })
      .finally(() => {
        setIsVerifying(false)
      })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleImageUpload = async (
    field: "fotoBarbearia" | "fotoBarbeiro",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const result = await compressAndValidateImage(file, {
      maxSizeMB: 2,
      maxWidth: 500,
      maxHeight: 500,
    })
    if (!result.success) {
      toast.error(result.error)
      return
    }

    setFormData((prev) => ({ ...prev, [field]: result.dataUrl }))
  }

  const validateForm = () => {
    const newErrors: Partial<FormData> = {}

    if (!formData.senha) {
      newErrors.senha = "Senha é obrigatória"
    } else if (formData.senha.length < 6) {
      newErrors.senha = "Senha deve ter pelo menos 6 caracteres"
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não coincidem"
    }

    if (!formData.nomeBarbeiro.trim()) {
      newErrors.nomeBarbeiro = "Seu nome é obrigatório"
    }

    if (!formData.nomeBarbearia.trim()) {
      newErrors.nomeBarbearia = "Nome da barbearia é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return
    if (!sessionId) {
      toast.error("Identificador de pagamento não encontrado.")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          senha: formData.senha,
          nomeBarbeiro: formData.nomeBarbeiro,
          nomeBarbearia: formData.nomeBarbearia,
          fotoBarbeiro: formData.fotoBarbeiro,
          fotoBarbearia: formData.fotoBarbearia,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast.error(data.error || "Erro ao criar conta da barbearia.")
        setIsLoading(false)
        return
      }

      toast.success("Conta configurada com sucesso! Bem-vindo ao Trimly.")

      // Redireciona para o dashboard com a sessão já ativa
      router.push(data.redirect || "/dashboard")
    } catch {
      toast.error("Erro de conexão ao salvar suas configurações.")
      setIsLoading(false)
    }
  }

  // ─── ESTADO: CARREGANDO / VERIFICANDO ───────────────────────────────────────
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <Loader2 className="size-10 animate-spin text-primary mx-auto" />
          <h2 className="text-lg font-semibold">Validando assinatura...</h2>
          <p className="text-sm text-muted-foreground">
            Aguarde um instante enquanto confirmamos seu pagamento junto ao Stripe.
          </p>
        </div>
      </div>
    )
  }

  // ─── ESTADO: JÁ CONFIGURADO ────────────────────────────────────────────────
  if (alreadyCompleted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Trimly" width={180} height={50} className="object-contain" />
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Barbearia já configurada!</h1>
              <p className="text-muted-foreground text-sm">
                Esta assinatura já foi vinculada à sua barbearia. Você pode acessar seu painel diretamente.
              </p>
            </div>
            <Button asChild size="lg" className="w-full gap-2">
              <Link href="/dashboard">
                Acessar o painel
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // ─── ESTADO: SEM ASSINATURA / ERRO ─────────────────────────────────────────
  if (sessionError) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Trimly" width={180} height={50} className="object-contain" />
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Lock className="size-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Assinatura necessária</h1>
              <p className="text-muted-foreground text-sm">
                {sessionError}
              </p>
            </div>
            <Button asChild size="lg" className="w-full gap-2">
              <Link href="/assinar">
                Começar 7 dias grátis
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <div>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Já possui conta ativa? Faça login
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ─── ESTADO: FORMULÁRIO DE ONBOARDING ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Trimly"
              width={180}
              height={50}
              className="object-contain"
            />
          </Link>
          <div className="flex items-center gap-2 text-xs md:text-sm text-emerald-500 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="size-4" />
            <span>Assinatura confirmada no Stripe</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 py-10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Configure sua barbearia</h1>
            <p className="text-muted-foreground text-sm">
              Seu período de teste de 7 dias foi ativado. Conclua o cadastro abaixo para entrar no painel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* E-mail da conta (preenchido no Stripe) */}
            <div className="p-4 rounded-xl bg-secondary/30 border border-border flex items-center justify-between text-sm">
              <div>
                <p className="text-xs text-muted-foreground">E-mail de acesso (cadastrado no Stripe)</p>
                <p className="font-semibold text-foreground">{customerEmail || "Identificado via Stripe"}</p>
              </div>
              <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                Confirmado
              </span>
            </div>

            {/* 1. Criar Senha */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <h2 className="font-semibold">Crie sua senha de acesso</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    name="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    className={`h-11 bg-secondary/50 border-border pr-10 ${errors.senha ? "border-destructive" : ""}`}
                    value={formData.senha}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.senha && <p className="text-xs text-destructive">{errors.senha}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Digite a senha novamente"
                    className={`h-11 bg-secondary/50 border-border pr-10 ${errors.confirmarSenha ? "border-destructive" : ""}`}
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.confirmarSenha && <p className="text-xs text-destructive">{errors.confirmarSenha}</p>}
              </div>
            </div>

            {/* 2. Dados do Barbeiro */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <h2 className="font-semibold">Seus dados (Barbeiro / Proprietário)</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeBarbeiro">Seu nome</Label>
                <Input
                  id="nomeBarbeiro"
                  name="nomeBarbeiro"
                  placeholder="Ex: Carlos Silva"
                  className={`h-11 bg-secondary/50 border-border ${errors.nomeBarbeiro ? "border-destructive" : ""}`}
                  value={formData.nomeBarbeiro}
                  onChange={handleChange}
                />
                {errors.nomeBarbeiro && <p className="text-xs text-destructive">{errors.nomeBarbeiro}</p>}
              </div>

              {/* Foto do Barbeiro (opcional) */}
              <div className="space-y-2">
                <Label>Sua foto <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => barbeiroInputRef.current?.click()}
                    className="relative size-20 rounded-full border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden group bg-secondary/30 shrink-0"
                  >
                    {formData.fotoBarbeiro ? (
                      <>
                        <img
                          src={formData.fotoBarbeiro}
                          alt="Barbeiro"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="size-5 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <User className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Esta foto será exibida para seus clientes no agendamento</p>
                    {formData.fotoBarbeiro && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, fotoBarbeiro: null }))}
                        className="text-destructive hover:underline mt-1 text-xs"
                      >
                        Remover foto
                      </button>
                    )}
                  </div>
                </div>
                <input
                  ref={barbeiroInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload("fotoBarbeiro", e)}
                />
              </div>
            </div>

            {/* 3. Dados da Barbearia */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <h2 className="font-semibold">Dados da barbearia</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeBarbearia">Nome do estabelecimento</Label>
                <Input
                  id="nomeBarbearia"
                  name="nomeBarbearia"
                  placeholder="Ex: Barbearia Dom Pedro"
                  className={`h-11 bg-secondary/50 border-border ${errors.nomeBarbearia ? "border-destructive" : ""}`}
                  value={formData.nomeBarbearia}
                  onChange={handleChange}
                />
                {errors.nomeBarbearia && <p className="text-xs text-destructive">{errors.nomeBarbearia}</p>}
              </div>

              {/* Logo / Foto da Barbearia (opcional) */}
              <div className="space-y-2">
                <Label>Logo ou foto do espaço <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                <div
                  onClick={() => barbeariaInputRef.current?.click()}
                  className="relative w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden group bg-secondary/30"
                >
                  {formData.fotoBarbearia ? (
                    <>
                      <img
                        src={formData.fotoBarbearia}
                        alt="Barbearia"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="size-6 text-white" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFormData((prev) => ({ ...prev, fotoBarbearia: null }))
                        }}
                        className="absolute top-2 right-2 size-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <Upload className="size-6 mb-2" />
                      <span className="text-sm">Clique para enviar a foto ou logo</span>
                    </div>
                  )}
                </div>
                <input
                  ref={barbeariaInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload("fotoBarbearia", e)}
                />
              </div>
            </div>

            {/* Botão de Conclusão */}
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold gap-2 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  <span>Configurando sua barbearia...</span>
                </>
              ) : (
                <>
                  <span>Concluir e acessar o painel</span>
                  <ArrowRight className="size-5" />
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
