"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { db } from "@/lib/db/db"
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
  CheckCircle2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
  const { toast } = useToast()
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleImageUpload = async (field: "fotoBarbearia" | "fotoBarbeiro", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const result = await compressAndValidateImage(file, { maxSizeMB: 2, maxWidth: 500, maxHeight: 500 })
    if (!result.success) {
      toast({ title: "Arquivo inválido", description: result.error, variant: "destructive" })
      return
    }

    setFormData(prev => ({ ...prev, [field]: result.dataUrl }))
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
      newErrors.nomeBarbeiro = "Nome é obrigatório"
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

    setIsLoading(true)

    // Salvar as configurações iniciais no banco de dados (db)
    const slug = formData.nomeBarbearia.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const shop = {
      id: "default-shop-id",
      name: formData.nomeBarbearia,
      slug: slug || "mk-barber",
      logo_type: (formData.fotoBarbearia ? 'custom' : 'preset') as 'custom' | 'preset',
      logo_preset: 'vintage-gold',
      logo_custom: formData.fotoBarbearia || '',
      created_at: new Date().toISOString()
    }
    await db.saveBarbershop(shop)

    // Set active barbershop slug
    localStorage.setItem('active_barbershop_slug', shop.slug)
    window.dispatchEvent(new Event('barber-settings-updated'))

    await new Promise(resolve => setTimeout(resolve, 1500))
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Scissors className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">BarberPro</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 className="size-4" />
            <span>Pagamento confirmado</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Configure sua conta</h1>
            <p className="text-muted-foreground">
              Preencha os dados abaixo para começar a usar o BarberPro
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Senha */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <h2 className="font-semibold">Crie sua senha</h2>
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

            {/* Dados do Barbeiro */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <h2 className="font-semibold">Seus dados</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeBarbeiro">Seu nome</Label>
                <Input
                  id="nomeBarbeiro"
                  name="nomeBarbeiro"
                  placeholder="Nome completo"
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
                    <p>Esta foto será exibida para seus clientes</p>
                    {formData.fotoBarbeiro && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, fotoBarbeiro: null }))}
                        className="text-destructive hover:underline mt-1"
                      >
                        Remover
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

            {/* Dados da Barbearia */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <h2 className="font-semibold">Dados da barbearia</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeBarbearia">Nome da barbearia</Label>
                <Input
                  id="nomeBarbearia"
                  name="nomeBarbearia"
                  placeholder="Ex: Barbearia Premium"
                  className={`h-11 bg-secondary/50 border-border ${errors.nomeBarbearia ? "border-destructive" : ""}`}
                  value={formData.nomeBarbearia}
                  onChange={handleChange}
                />
                {errors.nomeBarbearia && <p className="text-xs text-destructive">{errors.nomeBarbearia}</p>}
              </div>

              {/* Foto da Barbearia (opcional) */}
              <div className="space-y-2">
                <Label>Foto da barbearia <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                <div
                  onClick={() => barbeariaInputRef.current?.click()}
                  className="relative w-full h-36 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden group bg-secondary/30"
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
                          setFormData(prev => ({ ...prev, fotoBarbearia: null }))
                        }}
                        className="absolute top-2 right-2 size-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <Upload className="size-6 mb-2" />
                      <span className="text-sm">Clique para enviar</span>
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

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Finalizar e acessar o painel
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
