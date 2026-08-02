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
import { db, Barber, Service } from "@/lib/db/db"
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
  Users,
  Scissors,
  Trash2,
  Plus,
  Star,
} from "lucide-react"

export default function ConfiguracoesPage() {
  const { settings, saveSettings } = useBarberSettings()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  // Customização de Marca
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [logoType, setLogoType] = useState<'preset' | 'custom'>('preset')
  const [logoPreset, setLogoPreset] = useState("vintage-gold")
  const [logoCustom, setLogoCustom] = useState("")
  const [copied, setCopied] = useState(false)

  // Gestão de Profissionais
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [newBarberName, setNewBarberName] = useState("")
  const [newBarberSpecialties, setNewBarberSpecialties] = useState("")
  const [newBarberAvatar, setNewBarberAvatar] = useState("carlos")
  const [newBarberAvatarFile, setNewBarberAvatarFile] = useState("")

  // Gestão de Serviços
  const [services, setServices] = useState<Service[]>([])
  const [newServiceName, setNewServiceName] = useState("")
  const [newServicePrice, setNewServicePrice] = useState("")
  const [newServiceDuration, setNewServiceDuration] = useState("")
  const [newServiceDescription, setNewServiceDescription] = useState("")

  useEffect(() => {
    setMounted(true)
    if (settings) {
      setName(settings.name)
      setSlug(settings.slug)
      setLogoType(settings.logo_type)
      setLogoPreset(settings.logo_preset)
      setLogoCustom(settings.logo_custom)
    }
  }, [settings])

  // Carregar dados de barbeiros e serviços
  const loadData = async () => {
    if (settings?.id) {
      const loadedBarbers = await db.getBarbers(settings.id)
      const loadedServices = await db.getServices(settings.id)
      setBarbers(loadedBarbers)
      setServices(loadedServices)
    }
  }

  useEffect(() => {
    if (settings?.id) {
      loadData()
    }
  }, [settings?.id])

  const handleSaveBranding = () => {
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O nome da barbearia é obrigatório para salvar.",
        variant: "destructive"
      })
      return
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') || name.toLowerCase().replace(/\s+/g, '-')

    saveSettings({
      ...settings,
      name,
      slug: cleanSlug,
      logo_type: logoType,
      logo_preset: logoPreset,
      logo_custom: logoCustom
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
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'mk-barber'
    return `${origin}/agendar/${cleanSlug}`
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getDynamicLink())
    setCopied(true)
    toast({
      title: "Link Copiado!",
      description: "O link de agendamento personalizado foi copiado.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  // Ações de Barbeiros
  const handleAddBarber = async () => {
    if (!newBarberName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O nome do profissional é necessário.",
        variant: "destructive"
      })
      return
    }
    const avatar = newBarberAvatarFile || newBarberAvatar
    await db.saveBarber({
      id: Math.random().toString(36).substring(2, 9),
      barbershop_id: settings.id,
      name: newBarberName,
      avatar,
      rating: 5.0,
      specialties: newBarberSpecialties.split(",").map(s => s.trim()).filter(Boolean),
      created_at: new Date().toISOString()
    })
    setNewBarberName("")
    setNewBarberSpecialties("")
    setNewBarberAvatarFile("")
    loadData()
    toast({
      title: "Barbeiro Adicionado!",
      description: "O profissional foi cadastrado com sucesso."
    })
  }

  const handleDeleteBarber = async (id: string) => {
    await db.deleteBarber(id)
    loadData()
    toast({
      title: "Barbeiro Removido",
      description: "O profissional foi removido da equipe."
    })
  }

  const handleBarberAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewBarberAvatarFile(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Ações de Serviços
  const handleAddService = async () => {
    if (!newServiceName.trim() || !newServicePrice || !newServiceDuration) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome, preço e duração são necessários.",
        variant: "destructive"
      })
      return
    }
    await db.saveService({
      id: Math.random().toString(36).substring(2, 9),
      barbershop_id: settings.id,
      name: newServiceName,
      duration: parseInt(newServiceDuration),
      price: parseFloat(newServicePrice),
      description: newServiceDescription,
      created_at: new Date().toISOString()
    })
    setNewServiceName("")
    setNewServicePrice("")
    setNewServiceDuration("")
    setNewServiceDescription("")
    loadData()
    toast({
      title: "Serviço Adicionado!",
      description: "O serviço foi cadastrado com sucesso."
    })
  }

  const handleDeleteService = async (id: string) => {
    await db.deleteService(id)
    loadData()
    toast({
      title: "Serviço Removido",
      description: "O serviço foi excluído da lista."
    })
  }

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações e identidade do seu negócio</p>
      </div>

      {/* Brand Branding Section */}
      {mounted && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="size-4 text-primary" />
              <CardTitle className="text-base font-medium">Marca da Barbearia</CardTitle>
            </div>
            <CardDescription>Personalize o nome, link e logotipo exibidos na sua página pública de agendamento</CardDescription>
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
                  <Label htmlFor="brand-slug">Link Personalizado (Slug)</Label>
                  <div className="flex items-center">
                    <span className="bg-secondary/70 border border-r-0 border-border rounded-l-lg h-10 px-3 text-xs flex items-center text-muted-foreground select-none">
                      /agendar/
                    </span>
                    <Input
                      id="brand-slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      className="bg-secondary/50 border-border h-10 rounded-l-none"
                      placeholder="barbearia-premium"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Apenas letras minúsculas, números e hifens.</p>
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
                      Upload de Imagem
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
                          className={`p-3 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${logoPreset === preset.id
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

      {/* Equipe / Profissionais Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <CardTitle className="text-base font-medium">Equipe de Profissionais</CardTitle>
          </div>
          <CardDescription>Cadastre e gerencie os barbeiros e a agenda da sua barbearia</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* List of current barbers */}
          <div className="grid gap-4 sm:grid-cols-2">
            {barbers.map((barber) => (
              <div key={barber.id} className="p-4 rounded-xl border border-border bg-secondary/15 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage src={barber.avatar.startsWith("data:") ? barber.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${barber.avatar}`} />
                    <AvatarFallback>{barber.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-1.5">
                      {barber.name}
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <Star className="size-3 text-primary fill-primary" />
                        {barber.rating}
                      </span>
                    </h4>
                    <p className="text-xs text-muted-foreground">{barber.specialties.join(", ")}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteBarber(barber.id)}
                  className="text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Form to add a new barber */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Adicionar Novo Profissional</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="barber-name">Nome do Barbeiro</Label>
                <Input
                  id="barber-name"
                  value={newBarberName}
                  onChange={(e) => setNewBarberName(e.target.value)}
                  className="bg-secondary/50 border-border h-10"
                  placeholder="Ex: Carlos Silva"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barber-specialties">Especialidades (separadas por vírgula)</Label>
                <Input
                  id="barber-specialties"
                  value={newBarberSpecialties}
                  onChange={(e) => setNewBarberSpecialties(e.target.value)}
                  className="bg-secondary/50 border-border h-10"
                  placeholder="Ex: Degradê, Barba, Navalhado"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Avatar / Foto do Barbeiro</Label>
                <div className="flex flex-wrap items-center gap-4">
                  {/* Select preset seeds */}
                  <div className="flex gap-2">
                    {['carlos', 'mateus', 'daniel', 'lucas'].map((seed) => (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => {
                          setNewBarberAvatar(seed);
                          setNewBarberAvatarFile("");
                        }}
                        className={`size-10 rounded-full border transition-all ${newBarberAvatar === seed && !newBarberAvatarFile ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-border opacity-70 hover:opacity-100'}`}
                      >
                        <Avatar className="size-full">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} />
                        </Avatar>
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">ou envie uma foto:</div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleBarberAvatarUpload}
                      className="text-xs bg-secondary/30 h-9 file:text-xs file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md cursor-pointer max-w-[200px]"
                    />
                    {newBarberAvatarFile && (
                      <img src={newBarberAvatarFile} className="size-8 rounded-full object-cover border border-primary" />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={handleAddBarber} className="gap-1.5 h-10">
              <Plus className="size-4" /> Adicionar à Equipe
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Serviços Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scissors className="size-4 text-primary" />
            <CardTitle className="text-base font-medium">Serviços da Barbearia</CardTitle>
          </div>
          <CardDescription>Cadastre e gerencie a lista de serviços que seus clientes podem agendar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* List of current services */}
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <div key={service.id} className="p-4 rounded-xl border border-border bg-secondary/15 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-sm">{service.name}</h4>
                  <p className="text-xs text-muted-foreground leading-normal mb-1">{service.description}</p>
                  <div className="flex gap-3 text-xs">
                    <span className="text-primary font-medium">R$ {service.price}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{service.duration} min</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteService(service.id)}
                  className="text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Form to add a new service */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Adicionar Novo Serviço</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="service-name">Nome do Serviço</Label>
                <Input
                  id="service-name"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="bg-secondary/50 border-border h-10"
                  placeholder="Ex: Corte Navalhado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-price">Preço (R$)</Label>
                <Input
                  id="service-price"
                  type="number"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  className="bg-secondary/50 border-border h-10"
                  placeholder="Ex: 50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-duration">Duração (minutos)</Label>
                <Input
                  id="service-duration"
                  type="number"
                  value={newServiceDuration}
                  onChange={(e) => setNewServiceDuration(e.target.value)}
                  className="bg-secondary/50 border-border h-10"
                  placeholder="Ex: 45"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-desc">Descrição Curta</Label>
                <Input
                  id="service-desc"
                  value={newServiceDescription}
                  onChange={(e) => setNewServiceDescription(e.target.value)}
                  className="bg-secondary/50 border-border h-10"
                  placeholder="Ex: Finalização com toalha quente e pomada premium"
                />
              </div>
            </div>
            <Button onClick={handleAddService} className="gap-1.5 h-10">
              <Plus className="size-4" /> Adicionar Serviço
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Section */}
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
