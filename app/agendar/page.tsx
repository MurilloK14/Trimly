"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { BarberLogo } from "@/components/barber-logo"
import { db, Barber, Service } from "@/lib/db/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Scissors,
  Clock,
  DollarSign,
  ChevronRight,
  Check,
  MapPin,
  Phone,
  Star,
  ArrowLeft,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const availableTimes = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30"
]

type Step = "service" | "barber" | "datetime" | "info" | "confirmation"

function AgendarContent({ slug }: { slug?: string }) {
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  // Customização de Marca
  const [name, setName] = useState("BarberPro")
  const [logoPreset, setLogoPreset] = useState("vintage-gold")
  const [logoType, setLogoType] = useState<'preset' | 'custom'>('preset')
  const [logoCustom, setLogoCustom] = useState("")

  // Dados dinâmicos
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])

  useEffect(() => {
    const loadBrandingAndData = async () => {
      setMounted(true)

      // Carregar pelo slug da URL ou pelo parâmetro query "name" ou fallback padrão
      let activeSlug = slug || searchParams.get("name") || "mk-barber"
      activeSlug = activeSlug.toLowerCase().replace(/\s+/g, '-')

      const shop = await db.getBarbershop(activeSlug)
      if (shop) {
        setName(shop.name)
        setLogoPreset(shop.logo_preset)
        setLogoType(shop.logo_type)
        setLogoCustom(shop.logo_custom)

        // Carregar barbeiros e serviços da barbearia específica
        const loadedBarbers = await db.getBarbers(shop.id)
        const loadedServices = await db.getServices(shop.id)
        setBarbers(loadedBarbers)
        setServices(loadedServices)
      } else {
        // Se a barbearia não existir no banco, cria temporariamente os dados
        const formattedName = activeSlug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")

        const tempShop = {
          id: activeSlug,
          name: formattedName,
          slug: activeSlug,
          logo_type: 'preset' as const,
          logo_preset: 'vintage-gold',
          logo_custom: '',
          created_at: new Date().toISOString()
        }
        await db.saveBarbershop(tempShop)

        setName(tempShop.name)
        setLogoPreset(tempShop.logo_preset)
        setLogoType(tempShop.logo_type)
        setLogoCustom(tempShop.logo_custom)

        const loadedBarbers = await db.getBarbers(tempShop.id)
        const loadedServices = await db.getServices(tempShop.id)
        setBarbers(loadedBarbers)
        setServices(loadedServices)
      }
    }

    loadBrandingAndData()
  }, [slug, searchParams])

  const [step, setStep] = useState<Step>("service")
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [clientInfo, setClientInfo] = useState({ name: "", phone: "", email: "" })

  const steps: { key: Step; label: string }[] = [
    { key: "service", label: "Serviço" },
    { key: "barber", label: "Profissional" },
    { key: "datetime", label: "Data e Hora" },
    { key: "info", label: "Seus Dados" },
    { key: "confirmation", label: "Confirmação" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === step)

  const canProceed = () => {
    switch (step) {
      case "service": return selectedService !== null
      case "barber": return selectedBarber !== null
      case "datetime": return selectedDate !== undefined && selectedTime !== null
      case "info": return clientInfo.name && clientInfo.phone
      default: return true
    }
  }

  const handleNext = () => {
    const nextStep = steps[currentStepIndex + 1]
    if (nextStep) setStep(nextStep.key)
  }

  const handleBack = () => {
    const prevStep = steps[currentStepIndex - 1]
    if (prevStep) setStep(prevStep.key)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {mounted ? (
              <BarberLogo
                name={name}
                preset={logoPreset}
                logoType={logoType}
                customLogo={logoCustom}
                size="sm"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                  <Scissors className="size-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-lg">BarberPro</span>
              </div>
            )}
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">Entrar como Barbeiro</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${index < currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : index === currentStepIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                      }`}
                  >
                    {index < currentStepIndex ? (
                      <Check className="size-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground hidden sm:block">
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 ${index < currentStepIndex ? "bg-primary" : "bg-border"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Step: Service Selection */}
          {step === "service" && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">Escolha o Serviço</h1>
                <p className="text-muted-foreground">Selecione o serviço que deseja agendar</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${selectedService?.id === service.id
                      ? "border-primary bg-primary/5"
                      : "bg-card border-border"
                      }`}
                    onClick={() => setSelectedService(service)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{service.name}</h3>
                        {selectedService?.id === service.id && (
                          <div className="size-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="size-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="size-4" />
                          {service.duration} min
                        </div>
                        <div className="flex items-center gap-1 text-primary font-semibold">
                          <DollarSign className="size-4" />
                          R$ {service.price}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step: Barber Selection */}
          {step === "barber" && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">Escolha o Profissional</h1>
                <p className="text-muted-foreground">Selecione seu barbeiro preferido</p>
              </div>
              <div className="grid gap-3">
                {barbers.map((barber) => (
                  <Card
                    key={barber.id}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${selectedBarber?.id === barber.id
                      ? "border-primary bg-primary/5"
                      : "bg-card border-border"
                      }`}
                    onClick={() => setSelectedBarber(barber)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <Avatar className="size-14">
                        <AvatarImage src={barber.avatar.startsWith("data:") ? barber.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${barber.avatar}`} />
                        <AvatarFallback>{barber.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{barber.name}</h3>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="size-4 text-primary fill-primary" />
                            {barber.rating}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {barber.specialties.map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {selectedBarber?.id === barber.id && (
                        <div className="size-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="size-4 text-primary-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step: Date & Time Selection */}
          {step === "datetime" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">Escolha Data e Horário</h1>
                <p className="text-muted-foreground">Selecione quando deseja ser atendido</p>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Data</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={ptBR}
                      disabled={(date) => date < new Date() || date.getDay() === 0}
                      className="rounded-md"
                    />
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Horário</CardTitle>
                    <CardDescription>
                      {selectedDate
                        ? format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })
                        : "Selecione uma data primeiro"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          size="sm"
                          className="font-mono"
                          disabled={!selectedDate}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step: Client Info */}
          {step === "info" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">Seus Dados</h1>
                <p className="text-muted-foreground">Preencha suas informações para confirmar</p>
              </div>
              <Card className="bg-card border-border max-w-md mx-auto">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      value={clientInfo.name}
                      onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      placeholder="(00) 00000-0000"
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                      className="bg-secondary/50"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step: Confirmation */}
          {step === "confirmation" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="size-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="size-8 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Agendamento Confirmado!</h1>
                <p className="text-muted-foreground">Você receberá uma confirmação por SMS</p>
              </div>
              <Card className="bg-card border-border max-w-md mx-auto">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Serviço</span>
                    <span className="font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Profissional</span>
                    <span className="font-medium">{selectedBarber?.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Data</span>
                    <span className="font-medium">
                      {selectedDate && format(selectedDate, "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Horário</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Valor</span>
                    <span className="font-bold text-primary text-lg">R$ {selectedService?.price}</span>
                  </div>
                </CardContent>
              </Card>
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  Rua das Barbearias, 123 - Centro
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Phone className="size-4" />
                  (11) 99999-9999
                </div>
              </div>
              <div className="flex justify-center">
                <Link href="/">
                  <Button variant="outline">Voltar ao Início</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {step !== "confirmation" && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className="gap-2"
              >
                <ArrowLeft className="size-4" />
                Voltar
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2"
              >
                {step === "info" ? "Confirmar Agendamento" : "Continuar"}
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function AgendarPage({ slug }: { slug?: string }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-playfair italic">
        Carregando formulário de agendamento...
      </div>
    }>
      <AgendarContent slug={slug} />
    </Suspense>
  )
}
