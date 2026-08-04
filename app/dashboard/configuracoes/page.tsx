"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useBarberSettings } from "@/hooks/use-barber-settings"
import { BarberLogo } from "@/components/barber-logo"
import {
  User,
  Scissors,
  Trash2,
  Plus,
  Loader2,
  Copy,
  Check,
  Users,
  Settings,
  Palette,
  Upload,
  Link2,
} from "lucide-react"
import {
  getBarbershopSettings,
  addBarber,
  deleteBarber,
  addService,
  deleteService,
  updateBarbershopName,
  type SettingsBarber,
  type SettingsService,
} from "@/lib/actions/settings"
import {
  getBarberServiceLinks,
  linkBarberService,
  unlinkBarberService,
} from "@/lib/actions/profile"

import { compressAndValidateImage } from "@/lib/utils/image-compression"

const LOGO_PRESETS = [
  { id: "vintage-gold",  label: "Vintage Gold" },
  { id: "modern-dark",   label: "Modern Dark" },
  { id: "neon-barber",   label: "Neon Barber" },
  { id: "royal-crown",   label: "Royal Crown" },
]

export default function ConfiguracoesPage() {
  const { toast } = useToast()
  const { settings, saveSettings } = useBarberSettings()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  // ── Personalização (local via useBarberSettings) ──
  const [brandName, setBrandName] = useState("")
  const [brandSlug, setBrandSlug] = useState("")
  const [logoPreset, setLogoPreset] = useState("vintage-gold")
  const [logoType, setLogoType] = useState<"preset" | "custom">("preset")
  const [logoCustom, setLogoCustom] = useState("")
  const [savingBrand, setSavingBrand] = useState(false)

  // ── Dados da barbearia (Supabase) ──
  const [shopId, setShopId] = useState("")
  const [shopName, setShopName] = useState("")
  const [shopSlug, setShopSlug] = useState("")
  const [savingName, setSavingName] = useState(false)

  // ── Barbeiros ──
  const [barbersList, setBarbersList] = useState<SettingsBarber[]>([])
  const [newBarberName, setNewBarberName] = useState("")
  const [addingBarber, setAddingBarber] = useState(false)

  // ── Serviços ──
  const [servicesList, setServicesList] = useState<SettingsService[]>([])
  const [newServiceName, setNewServiceName] = useState("")
  const [newServicePrice, setNewServicePrice] = useState("")
  const [newServiceDuration, setNewServiceDuration] = useState("")
  const [newServiceDescription, setNewServiceDescription] = useState("")
  const [addingService, setAddingService] = useState(false)

  // ── Vínculos barbeiro↔serviço ──
  const [barberServiceLinks, setBarberServiceLinks] = useState<Set<string>>(new Set())
  const [togglingLink, setTogglingLink] = useState<string | null>(null)

  // ── Inicializa personalização ──
  useEffect(() => {
    setMounted(true)
    if (settings) {
      setBrandName(settings.name)
      setBrandSlug(settings.slug)
      setLogoPreset(settings.logo_preset)
      setLogoType(settings.logo_type)
      setLogoCustom(settings.logo_custom)
    }
  }, [settings])

  // ── Carrega dados do Supabase ──
  const loadSettings = useCallback(async () => {
    setLoading(true)
    const result = await getBarbershopSettings()
    if (result.success) {
      setShopId(result.data.barbershop.id)
      setShopName(result.data.barbershop.name)
      setShopSlug(result.data.barbershop.slug)
      setBarbersList(result.data.barbers)
      setServicesList(result.data.services)
      const linksResult = await getBarberServiceLinks(result.data.barbershop.id)
      if (linksResult.success) {
        setBarberServiceLinks(new Set(linksResult.data.map(l => `${l.barberId}:${l.serviceId}`)))
      }
    } else {
      toast({ title: "Erro ao carregar", description: result.error, variant: "destructive" })
    }
    setLoading(false)
  }, [toast])

  useEffect(() => { loadSettings() }, [loadSettings])

  // ── Handlers Personalização ──
  const handleSaveBrand = async () => {
    if (!brandName.trim()) {
      toast({ title: "Nome obrigatório", description: "O nome não pode estar vazio.", variant: "destructive" })
      return
    }
    setSavingBrand(true)
    const cleanSlug = brandSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-") || brandName.toLowerCase().replace(/\s+/g, "-")
    await saveSettings({
      ...settings,
      name: brandName.trim(),
      slug: cleanSlug,
      logo_type: logoType,
      logo_preset: logoPreset,
      logo_custom: logoCustom,
    })
    setShopName(brandName.trim())
    await updateBarbershopName(brandName.trim())
    toast({ title: "Visual atualizado!", description: "A identidade da sua barbearia foi salva." })
    setSavingBrand(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const result = await compressAndValidateImage(file, { maxSizeMB: 2, maxWidth: 500, maxHeight: 500 })
    if (!result.success) {
      toast({ title: "Arquivo inválido", description: result.error, variant: "destructive" })
      return
    }

    setLogoCustom(result.dataUrl)
    setLogoType("custom")
  }

  const getSchedulingLink = () => typeof window !== "undefined" ? `${window.location.origin}/agendar/${shopSlug}` : ""

  const handleCopy = () => {
    navigator.clipboard.writeText(getSchedulingLink())
    setCopied(true)
    toast({ title: "Link copiado!" })
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Handlers Supabase ──
  const handleSaveName = async () => {
    if (!shopName.trim()) { toast({ title: "Campo obrigatório", variant: "destructive" }); return }
    setSavingName(true)
    const result = await updateBarbershopName(shopName.trim())
    if (result.success) toast({ title: "Nome salvo!" })
    else toast({ title: "Erro", description: result.error, variant: "destructive" })
    setSavingName(false)
  }

  const handleAddBarber = async () => {
    if (!newBarberName.trim()) { toast({ title: "Nome obrigatório", variant: "destructive" }); return }
    setAddingBarber(true)
    const result = await addBarber(newBarberName.trim())
    if (result.success) { toast({ title: "Profissional adicionado!" }); setNewBarberName(""); loadSettings() }
    else toast({ title: "Erro", description: result.error, variant: "destructive" })
    setAddingBarber(false)
  }

  const handleDeleteBarber = async (id: string, name: string) => {
    const result = await deleteBarber(id)
    if (result.success) { toast({ title: "Profissional desativado", description: `${name} foi removido.` }); loadSettings() }
    else toast({ title: "Erro", description: result.error, variant: "destructive" })
  }

  const handleAddService = async () => {
    if (!newServiceName.trim() || !newServicePrice || !newServiceDuration) {
      toast({ title: "Campos obrigatórios", description: "Nome, preço e duração são necessários.", variant: "destructive" })
      return
    }
    const price = parseFloat(newServicePrice)
    const duration = parseInt(newServiceDuration)
    if (isNaN(price) || price <= 0 || isNaN(duration) || duration <= 0) {
      toast({ title: "Valores inválidos", variant: "destructive" }); return
    }
    setAddingService(true)
    const result = await addService({ name: newServiceName.trim(), price, durationMinutes: duration, description: newServiceDescription.trim() || undefined })
    if (result.success) {
      toast({ title: "Serviço adicionado!" })
      setNewServiceName(""); setNewServicePrice(""); setNewServiceDuration(""); setNewServiceDescription("")
      loadSettings()
    } else toast({ title: "Erro", description: result.error, variant: "destructive" })
    setAddingService(false)
  }

  const handleDeleteService = async (id: string, name: string) => {
    const result = await deleteService(id)
    if (result.success) { toast({ title: "Serviço desativado", description: `${name} removido.` }); loadSettings() }
    else toast({ title: "Erro", description: result.error, variant: "destructive" })
  }

  const handleToggleLink = async (barberId: string, serviceId: string) => {
    const key = `${barberId}:${serviceId}`
    setTogglingLink(key)
    const isLinked = barberServiceLinks.has(key)
    const result = isLinked ? await unlinkBarberService(barberId, serviceId) : await linkBarberService(barberId, serviceId)
    if (result.success) {
      setBarberServiceLinks(prev => { const next = new Set(prev); isLinked ? next.delete(key) : next.add(key); return next })
    } else toast({ title: "Erro", description: result.error, variant: "destructive" })
    setTogglingLink(null)
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Carregando configurações...
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="size-6 text-primary" />
          Configurações
        </h1>
        <p className="text-muted-foreground">Gerencie os dados, visual e equipe da sua barbearia</p>
      </div>

      <Tabs defaultValue="personalizacao" className="space-y-6">
        <TabsList className="bg-secondary/50 p-1 h-auto flex-wrap gap-1">
          <TabsTrigger value="personalizacao" className="gap-2 data-[state=active]:bg-background">
            <Palette className="size-4" />
            Personalização
          </TabsTrigger>
          <TabsTrigger value="barbearia" className="gap-2 data-[state=active]:bg-background">
            <User className="size-4" />
            Barbearia
          </TabsTrigger>
          <TabsTrigger value="profissionais" className="gap-2 data-[state=active]:bg-background">
            <Users className="size-4" />
            Profissionais
          </TabsTrigger>
          <TabsTrigger value="servicos" className="gap-2 data-[state=active]:bg-background">
            <Scissors className="size-4" />
            Serviços
          </TabsTrigger>
          {barbersList.filter(b => b.active).length > 0 && servicesList.filter(s => s.active).length > 0 && (
            <TabsTrigger value="vinculos" className="gap-2 data-[state=active]:bg-background">
              <Link2 className="size-4" />
              Quem Faz o Quê
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── ABA: PERSONALIZAÇÃO ── */}
        <TabsContent value="personalizacao" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="size-4 text-primary" />
                <CardTitle className="text-base font-medium">Identidade Visual</CardTitle>
              </div>
              <CardDescription>Customize o logo e nome exibidos na sua plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview */}
              {mounted && (
                <div className="flex items-center justify-center py-6 px-4 rounded-xl bg-secondary/30 border border-border/50">
                  <BarberLogo
                    name={brandName || "Minha Barbearia"}
                    preset={logoPreset}
                    customLogo={logoCustom}
                    logoType={logoType}
                    size="lg"
                  />
                </div>
              )}

              {/* Nome e slug */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Nome da Barbearia</Label>
                  <Input
                    id="brandName"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    placeholder="Ex: MK Barber"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandSlug">Slug (URL)</Label>
                  <Input
                    id="brandSlug"
                    value={brandSlug}
                    onChange={e => setBrandSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    placeholder="mk-barber"
                    className="bg-secondary/50 border-border font-mono text-sm"
                  />
                </div>
              </div>

              <Separator />

              {/* Seleção de preset */}
              <div className="space-y-3">
                <Label>Estilo do Logo</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {LOGO_PRESETS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setLogoPreset(p.id); setLogoType("preset") }}
                      className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        logoType === "preset" && logoPreset === p.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-secondary/30 hover:border-border/80"
                      }`}
                    >
                      {logoType === "preset" && logoPreset === p.id && (
                        <div className="absolute top-1.5 right-1.5 size-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="size-2.5 text-primary-foreground" />
                        </div>
                      )}
                      <BarberLogo name="" preset={p.id} logoType="preset" size="sm" showText={false} />
                      <span className="text-xs font-medium text-center leading-tight">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload custom */}
              <div className="space-y-2">
                <Label>Ou envie seu próprio logo</Label>
                <div className="flex items-center gap-3">
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => logoInputRef.current?.click()}>
                    <Upload className="size-4" />
                    {logoType === "custom" && logoCustom ? "Trocar imagem" : "Enviar logo"}
                  </Button>
                  {logoType === "custom" && logoCustom && (
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs"
                      onClick={() => { setLogoCustom(""); setLogoType("preset") }}>
                      Remover
                    </Button>
                  )}
                  {logoType === "custom" && logoCustom && (
                    <img src={logoCustom} alt="Logo" className="size-10 rounded-lg object-cover border border-border" />
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveBrand} disabled={savingBrand} className="gap-2">
                  {savingBrand ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  Salvar Visual
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ABA: BARBEARIA ── */}
        <TabsContent value="barbearia" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="size-4 text-primary" />
                <CardTitle className="text-base font-medium">Dados da Barbearia</CardTitle>
              </div>
              <CardDescription>Nome e link de agendamento público</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shopName">Nome da Barbearia</Label>
                <div className="flex gap-2">
                  <Input
                    id="shopName"
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    placeholder="Nome da sua barbearia"
                    className="bg-secondary/50 border-border"
                  />
                  <Button onClick={handleSaveName} disabled={savingName} className="shrink-0">
                    {savingName ? <Loader2 className="size-4 animate-spin" /> : "Salvar"}
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Link de Agendamento</Label>
                <p className="text-xs text-muted-foreground">Compartilhe com seus clientes para agendamento online.</p>
                <div className="flex gap-2">
                  <Input readOnly value={getSchedulingLink()} className="bg-secondary/30 border-border font-mono text-xs text-muted-foreground" />
                  <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
                    {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ABA: PROFISSIONAIS ── */}
        <TabsContent value="profissionais" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <CardTitle className="text-base font-medium">Profissionais</CardTitle>
              </div>
              <CardDescription>Gerencie os barbeiros da sua equipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {barbersList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum profissional cadastrado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {barbersList.map(barber => (
                    <div key={barber.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                      <Avatar className="size-9">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${barber.name}`} />
                        <AvatarFallback>{barber.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{barber.name}</p>
                      </div>
                      <Badge className={barber.active ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-secondary text-muted-foreground"}>
                        {barber.active ? "Ativo" : "Inativo"}
                      </Badge>
                      {barber.active && (
                        <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteBarber(barber.id, barber.name)}>
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <Separator />
              <div className="space-y-2">
                <Label>Adicionar Profissional</Label>
                <div className="flex gap-2">
                  <Input placeholder="Nome do profissional" value={newBarberName}
                    onChange={e => setNewBarberName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddBarber()}
                    className="bg-secondary/50 border-border" />
                  <Button onClick={handleAddBarber} disabled={addingBarber} className="shrink-0 gap-2">
                    {addingBarber ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ABA: SERVIÇOS ── */}
        <TabsContent value="servicos" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Scissors className="size-4 text-primary" />
                <CardTitle className="text-base font-medium">Serviços</CardTitle>
              </div>
              <CardDescription>Gerencie os serviços oferecidos pela barbearia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {servicesList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum serviço cadastrado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {servicesList.map(service => (
                    <div key={service.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                      <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Scissors className="size-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {service.durationMinutes} min • R$ {service.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        {service.description && <p className="text-xs text-muted-foreground/70 truncate">{service.description}</p>}
                      </div>
                      <Badge className={service.active ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-secondary text-muted-foreground"}>
                        {service.active ? "Ativo" : "Inativo"}
                      </Badge>
                      {service.active && (
                        <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteService(service.id, service.name)}>
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <Separator />
              <div className="space-y-3">
                <Label>Adicionar Serviço</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input placeholder="Nome do serviço" value={newServiceName}
                    onChange={e => setNewServiceName(e.target.value)} className="bg-secondary/50 border-border" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Preço (R$)" type="number" step="0.01" min="0" value={newServicePrice}
                      onChange={e => setNewServicePrice(e.target.value)} className="bg-secondary/50 border-border" />
                    <Input placeholder="Duração (min)" type="number" min="1" value={newServiceDuration}
                      onChange={e => setNewServiceDuration(e.target.value)} className="bg-secondary/50 border-border" />
                  </div>
                </div>
                <Input placeholder="Descrição (opcional)" value={newServiceDescription}
                  onChange={e => setNewServiceDescription(e.target.value)} className="bg-secondary/50 border-border" />
                <Button onClick={handleAddService} disabled={addingService} className="gap-2">
                  {addingService ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  Adicionar Serviço
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ABA: VÍNCULOS ── */}
        {barbersList.filter(b => b.active).length > 0 && servicesList.filter(s => s.active).length > 0 && (
          <TabsContent value="vinculos" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Link2 className="size-4 text-primary" />
                  <CardTitle className="text-base font-medium">Quem Faz o Quê</CardTitle>
                </div>
                <CardDescription>
                  Defina quais serviços cada profissional realiza. O cliente verá apenas os serviços do barbeiro escolhido.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {barbersList.filter(b => b.active).map((barber, i, arr) => (
                  <div key={barber.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="size-7">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${barber.name}`} />
                        <AvatarFallback>{barber.name[0]}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-sm">{barber.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-9">
                      {servicesList.filter(s => s.active).map(service => {
                        const key = `${barber.id}:${service.id}`
                        const linked = barberServiceLinks.has(key)
                        const toggling = togglingLink === key
                        return (
                          <button
                            key={service.id}
                            disabled={toggling}
                            onClick={() => handleToggleLink(barber.id, service.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all select-none ${
                              linked
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-secondary/30 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                            } ${toggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            {toggling ? "..." : service.name}
                          </button>
                        )
                      })}
                    </div>
                    {i < arr.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1.5 align-middle" />
                  Dourado = habilitado para esse profissional
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
