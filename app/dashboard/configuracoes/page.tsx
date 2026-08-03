"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
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

export default function ConfiguracoesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Dados da barbearia
  const [shopId, setShopId] = useState("")
  const [shopName, setShopName] = useState("")
  const [shopSlug, setShopSlug] = useState("")
  const [savingName, setSavingName] = useState(false)

  // Barbeiros
  const [barbersList, setBarbersList] = useState<SettingsBarber[]>([])
  const [newBarberName, setNewBarberName] = useState("")
  const [addingBarber, setAddingBarber] = useState(false)

  // Serviços
  const [servicesList, setServicesList] = useState<SettingsService[]>([])
  const [newServiceName, setNewServiceName] = useState("")
  const [newServicePrice, setNewServicePrice] = useState("")
  const [newServiceDuration, setNewServiceDuration] = useState("")
  const [newServiceDescription, setNewServiceDescription] = useState("")
  const [addingService, setAddingService] = useState(false)

  const loadSettings = useCallback(async () => {
    setLoading(true)
    const result = await getBarbershopSettings()
    if (result.success) {
      setShopId(result.data.barbershop.id)
      setShopName(result.data.barbershop.name)
      setShopSlug(result.data.barbershop.slug)
      setBarbersList(result.data.barbers)
      setServicesList(result.data.services)
    } else {
      toast({ title: "Erro ao carregar", description: result.error, variant: "destructive" })
    }
    setLoading(false)
  }, [toast])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const getSchedulingLink = () => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/agendar/${shopSlug}`
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getSchedulingLink())
    setCopied(true)
    toast({ title: "Link copiado!", description: "O link de agendamento foi copiado." })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveName = async () => {
    if (!shopName.trim()) {
      toast({ title: "Campo obrigatório", description: "O nome da barbearia não pode estar vazio.", variant: "destructive" })
      return
    }
    setSavingName(true)
    const result = await updateBarbershopName(shopName.trim())
    if (result.success) {
      toast({ title: "Nome atualizado!", description: "O nome da barbearia foi salvo com sucesso." })
    } else {
      toast({ title: "Erro ao salvar", description: result.error, variant: "destructive" })
    }
    setSavingName(false)
  }

  const handleAddBarber = async () => {
    if (!newBarberName.trim()) {
      toast({ title: "Nome obrigatório", description: "O nome do profissional é necessário.", variant: "destructive" })
      return
    }
    setAddingBarber(true)
    const result = await addBarber(newBarberName.trim())
    if (result.success) {
      toast({ title: "Profissional adicionado!", description: "O barbeiro foi cadastrado com sucesso." })
      setNewBarberName("")
      loadSettings()
    } else {
      toast({ title: "Erro ao adicionar", description: result.error, variant: "destructive" })
    }
    setAddingBarber(false)
  }

  const handleDeleteBarber = async (id: string, name: string) => {
    const result = await deleteBarber(id)
    if (result.success) {
      toast({ title: "Profissional desativado", description: `${name} foi removido da equipe.` })
      loadSettings()
    } else {
      toast({ title: "Erro ao remover", description: result.error, variant: "destructive" })
    }
  }

  const handleAddService = async () => {
    if (!newServiceName.trim() || !newServicePrice || !newServiceDuration) {
      toast({ title: "Campos obrigatórios", description: "Nome, preço e duração são necessários.", variant: "destructive" })
      return
    }
    const price = parseFloat(newServicePrice)
    const duration = parseInt(newServiceDuration)
    if (isNaN(price) || price <= 0 || isNaN(duration) || duration <= 0) {
      toast({ title: "Valores inválidos", description: "Preço e duração precisam ser números positivos.", variant: "destructive" })
      return
    }
    setAddingService(true)
    const result = await addService({
      name: newServiceName.trim(),
      price,
      durationMinutes: duration,
      description: newServiceDescription.trim() || undefined,
    })
    if (result.success) {
      toast({ title: "Serviço adicionado!", description: "O serviço foi cadastrado com sucesso." })
      setNewServiceName("")
      setNewServicePrice("")
      setNewServiceDuration("")
      setNewServiceDescription("")
      loadSettings()
    } else {
      toast({ title: "Erro ao adicionar", description: result.error, variant: "destructive" })
    }
    setAddingService(false)
  }

  const handleDeleteService = async (id: string, name: string) => {
    const result = await deleteService(id)
    if (result.success) {
      toast({ title: "Serviço desativado", description: `${name} foi removido da lista.` })
      loadSettings()
    } else {
      toast({ title: "Erro ao remover", description: result.error, variant: "destructive" })
    }
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
        <p className="text-muted-foreground">Gerencie as configurações da sua barbearia</p>
      </div>

      {/* Seção: Minha Barbearia */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="size-4 text-primary" />
            <CardTitle className="text-base font-medium">Minha Barbearia</CardTitle>
          </div>
          <CardDescription>Informações básicas e link de agendamento</CardDescription>
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
            <p className="text-xs text-muted-foreground">Compartilhe este link com seus clientes para agendamentos online.</p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={getSchedulingLink()}
                className="bg-secondary/30 border-border font-mono text-xs text-muted-foreground"
              />
              <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
                {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção: Profissionais */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <CardTitle className="text-base font-medium">Profissionais</CardTitle>
          </div>
          <CardDescription>Gerencie os barbeiros da sua equipe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de barbeiros */}
          {barbersList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum profissional cadastrado ainda.</p>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteBarber(barber.id, barber.name)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Form adicionar barbeiro */}
          <div className="space-y-2">
            <Label>Adicionar Profissional</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nome do profissional"
                value={newBarberName}
                onChange={e => setNewBarberName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddBarber()}
                className="bg-secondary/50 border-border"
              />
              <Button onClick={handleAddBarber} disabled={addingBarber} className="shrink-0 gap-2">
                {addingBarber ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção: Serviços */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scissors className="size-4 text-primary" />
            <CardTitle className="text-base font-medium">Serviços</CardTitle>
          </div>
          <CardDescription>Gerencie os serviços oferecidos pela barbearia</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de serviços */}
          {servicesList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum serviço cadastrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {servicesList.map(service => (
                <div key={service.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Scissors className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.durationMinutes} min • R$ {service.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    {service.description && (
                      <p className="text-xs text-muted-foreground/70 truncate">{service.description}</p>
                    )}
                  </div>
                  <Badge className={service.active ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-secondary text-muted-foreground"}>
                    {service.active ? "Ativo" : "Inativo"}
                  </Badge>
                  {service.active && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteService(service.id, service.name)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Form adicionar serviço */}
          <div className="space-y-3">
            <Label>Adicionar Serviço</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Nome do serviço"
                value={newServiceName}
                onChange={e => setNewServiceName(e.target.value)}
                className="bg-secondary/50 border-border"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Preço (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newServicePrice}
                  onChange={e => setNewServicePrice(e.target.value)}
                  className="bg-secondary/50 border-border"
                />
                <Input
                  placeholder="Duração (min)"
                  type="number"
                  min="1"
                  value={newServiceDuration}
                  onChange={e => setNewServiceDuration(e.target.value)}
                  className="bg-secondary/50 border-border"
                />
              </div>
            </div>
            <Input
              placeholder="Descrição (opcional)"
              value={newServiceDescription}
              onChange={e => setNewServiceDescription(e.target.value)}
              className="bg-secondary/50 border-border"
            />
            <Button onClick={handleAddService} disabled={addingService} className="gap-2">
              {addingService ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Adicionar Serviço
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
