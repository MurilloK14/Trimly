"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { BarberLogo } from "@/components/barber-logo"
import {
  getBookingData,
  getBarbersForService,
  getAvailableSlots,
  createAppointment,
} from "@/lib/actions/booking"
import type {
  BookingBarbershop,
  BookingBarber,
  BookingService,
} from "@/lib/booking/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import {
  Scissors,
  Clock,
  ChevronRight,
  Check,
  MapPin,
  Phone,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"

type Step = "service" | "barber" | "datetime" | "info" | "confirmation"

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function AgendarContent({ slug }: { slug?: string }) {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [barbershop, setBarbershop] = useState<BookingBarbershop | null>(null)
  const [services, setServices] = useState<BookingService[]>([])
  const [barbers, setBarbers] = useState<BookingBarber[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loadingBarbers, setLoadingBarbers] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [step, setStep] = useState<Step>("service")
  const [selectedService, setSelectedService] = useState<BookingService | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<BookingBarber | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [clientInfo, setClientInfo] = useState({ name: "", phone: "", email: "" })

  const activeSlug = (slug || searchParams.get("name") || "barbearia-exemplo")
    .toLowerCase()
    .replace(/\s+/g, "-")

  useEffect(() => {
    async function load() {
      setLoading(true)
      setLoadError(null)

      const result = await getBookingData(activeSlug)

      if (!result.success) {
        setLoadError(result.error)
        setLoading(false)
        return
      }

      setBarbershop(result.data.barbershop)
      setServices(result.data.services)
      setLoading(false)
    }

    load()
  }, [activeSlug])

  const loadBarbers = useCallback(async (service: BookingService) => {
    if (!barbershop) return

    setLoadingBarbers(true)
    const result = await getBarbersForService({
      barbershopId: barbershop.id,
      serviceId: service.id,
    })
    setLoadingBarbers(false)

    if (!result.success) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
      return
    }

    setBarbers(result.data)
  }, [barbershop, toast])

  const loadSlots = useCallback(async (
    barber: BookingBarber,
    service: BookingService,
    date: Date,
  ) => {
    setLoadingSlots(true)
    setSelectedTime(null)

    const dateStr = format(date, "yyyy-MM-dd")
    const result = await getAvailableSlots({
      barberId: barber.id,
      serviceId: service.id,
      date: dateStr,
    })
    setLoadingSlots(false)

    if (!result.success) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
      setAvailableTimes([])
      return
    }

    setAvailableTimes(result.data)
  }, [toast])

  useEffect(() => {
    if (selectedService && barbershop) {
      loadBarbers(selectedService)
    }
  }, [selectedService, barbershop, loadBarbers])

  useEffect(() => {
    if (selectedBarber && selectedService && selectedDate) {
      loadSlots(selectedBarber, selectedService, selectedDate)
    } else {
      setAvailableTimes([])
    }
  }, [selectedBarber, selectedService, selectedDate, loadSlots])

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
      case "info": return clientInfo.name.length >= 2 && clientInfo.phone.length >= 10
      default: return true
    }
  }

  const handleConfirm = async () => {
    if (!barbershop || !selectedService || !selectedBarber || !selectedDate || !selectedTime) return

    setSubmitting(true)
    const result = await createAppointment({
      barbershopId: barbershop.id,
      barberId: selectedBarber.id,
      serviceId: selectedService.id,
      clientName: clientInfo.name,
      clientPhone: clientInfo.phone,
      clientEmail: clientInfo.email,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
    })
    setSubmitting(false)

    if (!result.success) {
      toast({ title: "Não foi possível agendar", description: result.error, variant: "destructive" })
      return
    }

    setStep("confirmation")
  }

  const handleNext = async () => {
    if (step === "info") {
      await handleConfirm()
      return
    }
    const nextStep = steps[currentStepIndex + 1]
    if (nextStep) setStep(nextStep.key)
  }

  const handleBack = () => {
    const prevStep = steps[currentStepIndex - 1]
    if (prevStep) setStep(prevStep.key)
  }

  const handleServiceSelect = (service: BookingService) => {
    setSelectedService(service)
    setSelectedBarber(null)
    setSelectedDate(undefined)
    setSelectedTime(null)
  }

  const logoType = barbershop?.logoUrl ? "custom" as const : "preset" as const

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Carregando...
      </div>
    )
  }

  if (loadError || !barbershop) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-medium">{loadError ?? "Barbearia não encontrada"}</p>
        <p className="text-sm text-muted-foreground">
          Verifique o link ou entre em contato com a barbearia.
        </p>
        <Link href="/">
          <Button variant="outline">Voltar ao início</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BarberLogo
              name={barbershop.name}
              preset="vintage-gold"
              logoType={logoType}
              customLogo={barbershop.logoUrl ?? ""}
              size="sm"
            />
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">Entrar como Barbeiro</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      index <= currentStepIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {index < currentStepIndex ? <Check className="size-4" /> : index + 1}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground hidden sm:block">{s.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 ${index < currentStepIndex ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {step === "service" && (
                <div className="space-y-4">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-3 tracking-tight">Escolha o Serviço</h1>
                    <p className="text-muted-foreground text-sm">Selecione o serviço que deseja agendar</p>
                  </div>
                  {services.length === 0 ? (
                    <p className="text-center text-muted-foreground">Nenhum serviço disponível no momento.</p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {services.map((service) => (
                        <Card
                          key={service.id}
                          className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 ${
                            selectedService?.id === service.id 
                              ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(201,138,91,0.15)]" 
                              : "bg-card border-white/5"
                          }`}
                          onClick={() => handleServiceSelect(service)}
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
                        {service.description && (
                          <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="size-4" />
                            {service.durationMinutes} min
                          </div>
                          <div className="text-primary font-semibold">
                            R$ {formatPrice(service.price)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

              {step === "barber" && (
                <div className="space-y-4">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-3 tracking-tight">Escolha o Profissional</h1>
                    <p className="text-muted-foreground text-sm">Selecione seu barbeiro preferido</p>
                  </div>
                  {loadingBarbers ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="size-6 animate-spin text-primary" />
                    </div>
                  ) : barbers.length === 0 ? (
                    <p className="text-center text-muted-foreground">Nenhum profissional disponível para este serviço.</p>
                  ) : (
                    <div className="grid gap-4">
                      {barbers.map((barber) => (
                        <Card
                          key={barber.id}
                          className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 ${
                            selectedBarber?.id === barber.id 
                              ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(201,138,91,0.15)]" 
                              : "bg-card border-white/5"
                          }`}
                          onClick={() => {
                            setSelectedBarber(barber)
                            setSelectedDate(undefined)
                            setSelectedTime(null)
                          }}
                        >
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="size-14">
                          <AvatarImage
                            src={
                              barber.avatarUrl?.startsWith("data:") || barber.avatarUrl?.startsWith("http")
                                ? barber.avatarUrl
                                : `https://api.dicebear.com/7.x/avataaars/svg?seed=${barber.avatarUrl ?? barber.name}`
                            }
                          />
                          <AvatarFallback>{barber.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{barber.name}</h3>
                          {barber.specialties && barber.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {barber.specialties.map((specialty) => (
                                <Badge key={specialty} variant="secondary" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          )}
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
              )}
            </div>
          )}

              {step === "datetime" && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-3 tracking-tight">Escolha Data e Horário</h1>
                    <p className="text-muted-foreground text-sm">Selecione quando deseja ser atendido</p>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="bg-card border-white/5 backdrop-blur-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Data</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 flex justify-center">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          locale={ptBR}
                          disabled={(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            return date < today || date.getDay() === 0
                          }}
                          className="rounded-md pointer-events-auto"
                        />
                      </CardContent>
                    </Card>
                    <Card className="bg-card border-white/5 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Horário</CardTitle>
                    <CardDescription>
                      {selectedDate
                        ? format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })
                        : "Selecione uma data primeiro"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingSlots ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : !selectedDate ? (
                      <p className="text-sm text-muted-foreground text-center py-8">Selecione uma data</p>
                    ) : availableTimes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum horário disponível nesta data
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {availableTimes.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            className="font-mono"
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

              {step === "info" && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-3 tracking-tight">Seus Dados</h1>
                    <p className="text-muted-foreground text-sm">Preencha suas informações para confirmar</p>
                  </div>
                  <Card className="bg-card border-white/5 max-w-md mx-auto backdrop-blur-sm shadow-xl shadow-black/40">
                    <CardContent className="p-8 space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Nome Completo</Label>
                        <Input
                          id="name"
                          placeholder="Seu nome"
                          value={clientInfo.name}
                          onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground">Telefone</Label>
                        <Input
                          id="phone"
                          placeholder="(00) 00000-0000"
                          value={clientInfo.phone}
                          onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">E-mail (opcional)</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={clientInfo.email}
                          onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {step === "confirmation" && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="size-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.15)] relative">
                      <div className="absolute inset-0 rounded-full border border-green-500/20 animate-ping"></div>
                      <Check className="size-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-3 tracking-tight">Agendamento Confirmado!</h1>
                    <p className="text-muted-foreground text-sm">Guarde os detalhes do seu horário abaixo</p>
                  </div>
                  <Card className="bg-card border-white/5 max-w-md mx-auto backdrop-blur-sm shadow-xl shadow-black/40 overflow-hidden relative">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
                    <CardContent className="p-8 space-y-4 relative z-10">
                      <div className="flex items-center justify-between py-3 border-b border-white/5">
                        <span className="text-muted-foreground text-sm">Serviço</span>
                        <span className="font-semibold">{selectedService?.name}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-white/5">
                        <span className="text-muted-foreground text-sm">Profissional</span>
                        <span className="font-semibold">{selectedBarber?.name}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-white/5">
                        <span className="text-muted-foreground text-sm">Data</span>
                        <span className="font-semibold">
                          {selectedDate && format(selectedDate, "dd/MM/yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-white/5">
                        <span className="text-muted-foreground text-sm">Horário</span>
                        <span className="font-semibold">{selectedTime}</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 pb-2">
                        <span className="text-muted-foreground text-sm">Valor</span>
                        <span className="font-bold text-primary text-2xl drop-shadow-sm">
                          R$ {selectedService ? formatPrice(selectedService.price) : "—"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  {(barbershop.address || barbershop.phone) && (
                    <div className="text-center space-y-3 pt-4">
                      {barbershop.address && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="size-4 text-primary/70" />
                          {barbershop.address}
                        </div>
                      )}
                      {barbershop.phone && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Phone className="size-4 text-primary/70" />
                          {barbershop.phone}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex justify-center pt-4">
                    <Link href="/">
                      <Button variant="outline" className="px-8">Voltar ao Início</Button>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {step !== "confirmation" && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button variant="ghost" onClick={handleBack} disabled={currentStepIndex === 0} className="gap-2">
                <ArrowLeft className="size-4" />
                Voltar
              </Button>
              <Button onClick={handleNext} disabled={!canProceed() || submitting} className="gap-2">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {step === "info" ? "Confirmar Agendamento" : "Continuar"}
                {!submitting && <ChevronRight className="size-4" />}
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
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Carregando formulário de agendamento...
      </div>
    }>
      <AgendarContent slug={slug} />
    </Suspense>
  )
}
