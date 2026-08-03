"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Clock, Plus, Loader2 } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import {
  getAdminAppointments,
  getAppointmentsDatesWithActivity,
  getAdminBookingResources,
  createAdminAppointment,
  type AdminAppointment,
  type BookingResources,
} from "@/lib/actions/appointments"

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
]

export default function CalendarioPage() {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  const [dayAppointments, setDayAppointments] = useState<AdminAppointment[]>([])
  const [activeDates, setActiveDates] = useState<Date[]>([])
  const [loadingDay, setLoadingDay] = useState(true)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resources, setResources] = useState<BookingResources>({ barbers: [], services: [] })

  const [newAppt, setNewAppt] = useState({
    clientName: "",
    clientPhone: "",
    barberId: "",
    serviceId: "",
    date: "",
    time: "",
  })

  // Carrega os agendamentos do dia selecionado
  const loadDayAppointments = useCallback(async (date: Date) => {
    setLoadingDay(true)
    const dateStr = format(date, "yyyy-MM-dd")
    const res = await getAdminAppointments(dateStr)
    if (res.success) {
      setDayAppointments(res.data.filter(a => a.status !== 'cancelled'))
    } else {
      toast({ title: "Erro ao carregar o dia", description: res.error, variant: "destructive" })
    }
    setLoadingDay(false)
  }, [toast])

  // Carrega as datas com atividade no mês selecionado
  const loadMonthActivity = useCallback(async (month: Date) => {
    const startStr = format(startOfMonth(month), "yyyy-MM-dd")
    const endStr = format(endOfMonth(month), "yyyy-MM-dd")
    const res = await getAppointmentsDatesWithActivity(startStr, endStr)
    if (res.success) {
      const dates = res.data.map(dStr => new Date(`${dStr}T12:00:00-03:00`))
      setActiveDates(dates)
    }
  }, [])

  // Carrega barbeiros e serviços para o formulário de novo agendamento
  useEffect(() => {
    async function loadRes() {
      const res = await getAdminBookingResources()
      if (res.success) {
        setResources(res.data)
      }
    }
    loadRes()
  }, [])

  useEffect(() => {
    loadDayAppointments(selectedDate)
  }, [selectedDate, loadDayAppointments])

  useEffect(() => {
    loadMonthActivity(currentMonth)
  }, [currentMonth, loadMonthActivity])

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAppt.clientName || !newAppt.clientPhone || !newAppt.barberId || !newAppt.serviceId || !newAppt.date || !newAppt.time) {
      toast({
        title: "Campos em falta",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const result = await createAdminAppointment(newAppt)
    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Agendado!",
        description: "Agendamento criado com sucesso.",
      })
      setIsDialogOpen(false)
      setNewAppt({ clientName: "", clientPhone: "", barberId: "", serviceId: "", date: "", time: "" })
      loadDayAppointments(selectedDate)
      loadMonthActivity(currentMonth)
    } else {
      toast({
        title: "Erro ao agendar",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  const getSlotStatus = (time: string) => {
    const appointment = dayAppointments.find(apt => apt.time === time)
    if (appointment) {
      return { status: "booked", appointment }
    }

    // Verifica se o horário está dentro da duração de algum agendamento anterior
    const withinAppointment = dayAppointments.find(apt => {
      const [h, m] = apt.time.split(":").map(Number)
      const aptStart = h * 60 + m
      const [sh, sm] = time.split(":").map(Number)
      const slotTime = sh * 60 + sm
      const aptEnd = aptStart + apt.duration
      return slotTime > aptStart && slotTime < aptEnd
    })

    if (withinAppointment) {
      return { status: "occupied", appointment: withinAppointment }
    }

    return { status: "available", appointment: null }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendário</h1>
          <p className="text-muted-foreground">Visualize e gerencie sua agenda mensal</p>
        </div>
        <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="size-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Dialog for New Appointment */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo agendamento manual no painel.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAppointment} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client">Nome do Cliente</Label>
              <Input
                id="client"
                placeholder="Ex: Pedro Almeida"
                value={newAppt.clientName}
                onChange={e => setNewAppt({ ...newAppt, clientName: e.target.value })}
                className="bg-secondary/50 border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="Ex: (11) 99999-1234"
                value={newAppt.clientPhone}
                onChange={e => setNewAppt({ ...newAppt, clientPhone: e.target.value })}
                className="bg-secondary/50 border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barber">Profissional</Label>
              <Select
                value={newAppt.barberId}
                onValueChange={val => setNewAppt({ ...newAppt, barberId: val })}
              >
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {resources.barbers.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">Serviço</Label>
              <Select
                value={newAppt.serviceId}
                onValueChange={val => setNewAppt({ ...newAppt, serviceId: val })}
              >
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {resources.services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} - {s.durationMinutes} min - R$ {s.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={newAppt.date}
                  onChange={e => setNewAppt({ ...newAppt, date: e.target.value })}
                  className="bg-secondary/50 border-border text-foreground"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={newAppt.time}
                  onChange={e => setNewAppt({ ...newAppt, time: e.target.value })}
                  className="bg-secondary/50 border-border text-foreground"
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin mr-2" />}
                Agendar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-1 bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              locale={ptBR}
              className="rounded-md"
              modifiers={{
                hasAppointments: activeDates,
              }}
              modifiersClassNames={{
                hasAppointments: "bg-primary/20 text-primary font-semibold border border-primary/30",
              }}
            />
          </CardContent>
        </Card>

        {/* Day View */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium capitalize">
                  {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {dayAppointments.length} agendamento(s) confirmado(s)
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)}>
                + Agendar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDay ? (
              <div className="py-20 flex justify-center items-center gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                Carregando horários do dia...
              </div>
            ) : (
              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
                {timeSlots.map((time) => {
                  const { status, appointment } = getSlotStatus(time)
                  
                  return (
                    <div
                      key={time}
                      className={`flex items-stretch gap-3 p-2 rounded-lg transition-colors ${
                        status === "booked"
                          ? "bg-primary/10 border border-primary/20"
                          : status === "occupied"
                          ? "bg-secondary/30 opacity-50"
                          : "hover:bg-secondary/30"
                      }`}
                    >
                      <div className="w-14 shrink-0 text-sm font-mono text-muted-foreground pt-1">
                        {time}
                      </div>
                      
                      {status === "booked" && appointment ? (
                        <div className="flex-1 flex items-center gap-3 p-2 rounded-md bg-background/50 border border-primary/20">
                          <Avatar className="size-9">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${appointment.avatar}`} />
                            <AvatarFallback>{appointment.clientName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{appointment.clientName}</p>
                            <p className="text-xs text-muted-foreground">{appointment.serviceName} • {appointment.barberName}</p>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            <Clock className="size-3 mr-1" />
                            {appointment.duration}min
                          </Badge>
                        </div>
                      ) : status === "occupied" ? (
                        <div className="flex-1 flex items-center justify-start border-l-2 border-primary/30 pl-3">
                          <span className="text-xs text-muted-foreground">Em atendimento</span>
                        </div>
                      ) : (
                        <div
                          className="flex-1 flex items-center border border-dashed border-border rounded-md hover:border-primary/50 cursor-pointer transition-colors group py-1"
                          onClick={() => {
                            setNewAppt({
                              ...newAppt,
                              date: format(selectedDate, "yyyy-MM-dd"),
                              time: time,
                            })
                            setIsDialogOpen(true)
                          }}
                        >
                          <span className="text-xs text-muted-foreground group-hover:text-primary mx-auto">
                            Horário disponível
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
