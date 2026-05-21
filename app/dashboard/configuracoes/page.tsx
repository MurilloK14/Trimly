"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useBarberSettings } from "@/hooks/use-barber-settings"
import { useToast } from "@/hooks/use-toast"
import { BarberLogo } from "@/components/barber-logo"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Bell,
  Clock,
  Palette,
  Shield,
  Camera,
  Upload,
} from "lucide-react"

export default function ConfiguracoesPage() {
  const { settings, saveSettings } = useBarberSettings()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  
  // Customização de Marca
  const [name, setName] = useState("")
  const [logoType, setLogoType] = useState<'preset' | 'custom'>('preset')
  const [logoPreset, setLogoPreset] = useState("vintage-gold")
  const [logoCustom, setLogoCustom] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (settings) {
      setName(settings.name)
      setLogoType(settings.logoType)
      setLogoPreset(settings.logoPreset)
      setLogoCustom(settings.logoCustom)
    }
  }, [settings])

  const handleSaveBranding = () => {
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O nome da barbearia é obrigatório para salvar.",
        variant: "destructive"
      })
      return
    }
    saveSettings({
      name,
      logoType,
      logoPreset,
      logoCustom
    })
    toast({
      title: "Configurações Salvas!",
      description: "A identidade visual da sua barbearia foi atualizada com sucesso.",
    })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoCustom(reader.result as string)
        setLogoType('custom')
      }
      reader.readAsDataURL(file)
    }
  }

  const getDynamicLink = () => {
    if (typeof window === 'undefined') return ''
    const origin = window.location.origin
    const params = new URLSearchParams()
    params.set('name', name)
    params.set('logoStyle', logoPreset)
    if (logoType === 'custom' && logoCustom) {
      params.set('logoType', 'custom')
    }
    return `${origin}/agendar?${params.toString()}`
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getDynamicLink())
    setCopied(true)
    toast({
      title: "Link Copiado!",
      description: "O link com sua identidade visual foi copiado.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da sua conta</p>
      </div>

      {/* Brand Branding Section */}
      {mounted && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="size-4 text-primary" />
              <CardTitle className="text-base font-medium">Marca da Barbearia</CardTitle>
            </div>
            <CardDescription>Personalize o nome, estilo visual e logomarca exibidos no agendamento e painel administrativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column: Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brand-name">Nome da Barbearia</Label>
                  <Input 
                    id="brand-name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="bg-secondary/50 border-border h-10" 
                    placeholder="Ex: Barbearia Imperial"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Logotipo</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={logoType === 'preset' ? 'default' : 'outline'}
                      className="flex-1 text-xs sm:text-sm"
                      onClick={() => setLogoType('preset')}
                    >
                      Presets Premium
                    </Button>
                    <Button
                      type="button"
                      variant={logoType === 'custom' ? 'default' : 'outline'}
                      className="flex-1 text-xs sm:text-sm"
                      onClick={() => setLogoType('custom')}
                    >
                      Upload de Imagem (Opcional)
                    </Button>
                  </div>
                </div>

                {logoType === 'preset' ? (
                  <div className="space-y-2">
                    <Label>Estilo do Logo Preset</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'vintage-gold', label: 'Vintage Gold' },
                        { id: 'modern-dark', label: 'Modern Dark' },
                        { id: 'neon-barber', label: 'Neon Barber' },
                        { id: 'royal-crown', label: 'Royal Crown' }
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setLogoPreset(preset.id)}
                          className={`p-3 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                            logoPreset === preset.id
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-secondary/20 text-muted-foreground hover:bg-secondary/30'
                          }`}
                        >
                          {preset.label}
                          {logoPreset === preset.id && <span className="size-1.5 rounded-full bg-primary" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Carregar Logomarca <span className="text-muted-foreground font-normal">(Opcional)</span></Label>
                    <div className="flex items-center gap-4">
                      {logoCustom ? (
                        <img src={logoCustom} alt="Custom Logo" className="size-16 object-cover rounded-lg border border-border bg-secondary/50" />
                      ) : (
                        <div className="size-16 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground text-xs bg-secondary/10 shrink-0">Sem imagem</div>
                      )}
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="text-xs bg-secondary/30 h-9 file:text-xs file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md cursor-pointer w-full"
                        />
                        {logoCustom && (
                          <button
                            type="button"
                            onClick={() => setLogoCustom('')}
                            className="text-xs text-destructive text-left hover:underline"
                          >
                            Remover Logotipo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Preview */}
              <div className="p-4 rounded-xl border border-border bg-secondary/10 flex flex-col justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-widest mb-3">Pré-visualização do Layout</h4>
                  <div className="p-4 rounded-lg bg-background border border-border flex items-center justify-center min-h-[90px]">
                    <BarberLogo
                      name={name || "Sua Barbearia"}
                      preset={logoPreset}
                      logoType={logoType}
                      customLogo={logoCustom}
                      size="md"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-widest">Link de Agendamento Personalizado</h4>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={getDynamicLink()}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-muted-foreground focus:outline-none h-8 truncate"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className="h-8 gap-1 shrink-0 text-xs"
                    >
                      {copied ? "Copiado!" : "Copiar"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button type="button" onClick={handleSaveBranding}>Salvar Marca da Barbearia</Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="size-4 text-primary" />
            <CardTitle className="text-base font-medium">Perfil</CardTitle>
          </div>
          <CardDescription>Informações do seu perfil profissional</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="size-20">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=barber" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 size-7 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors">
                <Camera className="size-3.5 text-primary-foreground" />
              </button>
            </div>
            <div>
              <h3 className="font-medium">João da Silva</h3>
              <p className="text-sm text-muted-foreground">Barbeiro desde 2020</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" defaultValue="João da Silva" className="bg-secondary/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" defaultValue="joao@barberpro.com" className="bg-secondary/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" defaultValue="(11) 99999-9999" className="bg-secondary/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Select defaultValue="degradê">
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="degradê">Degradê</SelectItem>
                  <SelectItem value="barba">Barba</SelectItem>
                  <SelectItem value="platinado">Platinado</SelectItem>
                  <SelectItem value="geral">Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button>Salvar Alterações</Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <CardTitle className="text-base font-medium">Horário de Funcionamento</CardTitle>
          </div>
          <CardDescription>Configure seus horários de atendimento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Horário de Abertura</Label>
              <Select defaultValue="09:00">
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["08:00", "09:00", "10:00", "11:00"].map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Horário de Fechamento</Label>
              <Select defaultValue="19:00">
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["17:00", "18:00", "19:00", "20:00", "21:00"].map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dias de Funcionamento</Label>
            <div className="flex flex-wrap gap-2">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, index) => (
                <Button
                  key={day}
                  variant={index < 6 ? "default" : "outline"}
                  size="sm"
                  className="w-12"
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Intervalo entre Atendimentos</Label>
            <Select defaultValue="30">
              <SelectTrigger className="bg-secondary/50 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">60 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <CardTitle className="text-base font-medium">Notificações</CardTitle>
          </div>
          <CardDescription>Configure suas preferências de notificação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Novos Agendamentos</p>
              <p className="text-xs text-muted-foreground">Receber notificação quando um cliente agendar</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Cancelamentos</p>
              <p className="text-xs text-muted-foreground">Receber notificação quando um agendamento for cancelado</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Lembretes por SMS</p>
              <p className="text-xs text-muted-foreground">Enviar lembretes automáticos para clientes</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Relatórios Semanais</p>
              <p className="text-xs text-muted-foreground">Receber resumo semanal por e-mail</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            <CardTitle className="text-base font-medium">Segurança</CardTitle>
          </div>
          <CardDescription>Configurações de segurança da conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha Atual</Label>
            <Input id="current-password" type="password" placeholder="••••••••" className="bg-secondary/50 max-w-md" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input id="new-password" type="password" placeholder="••••••••" className="bg-secondary/50 max-w-md" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input id="confirm-password" type="password" placeholder="••••••••" className="bg-secondary/50 max-w-md" />
          </div>
          <Button>Alterar Senha</Button>
        </CardContent>
      </Card>
    </div>
  )
}
