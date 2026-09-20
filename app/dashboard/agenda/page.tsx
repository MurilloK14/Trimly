"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  Plus,
  MoreHorizontal,
  Clock,
  User,
  Phone,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  MessageSquare,
} from "lucide-react"
import { format, addDays, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import {
  getAdminAppointments,
  updateAppointmentStatus,
  getAdminBookingResources,
  createAdminAppointment,
  type AdminAppointment,
  type BookingResources,
} from "@/lib/actions/appointments"

const statusConfig = {
  confirmed: { label: "Confirmado", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  pending: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  completed: { label: "Concluído", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-500 border-red-500/20" },
}

export default function AgendaPage() {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'>("all")
  
  const [appointmentsList, setAppointmentsList] = useState<AdminAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [resources, setResources] = useState<BookingResources>({ barbers: [], services: [] })
  
  // Form fields for new appointment
  const [newAppt, setNewAppt] = useState({
    clientName: "",
    clientPhone: "",
    barberId: "",
    serviceId: "",
    date: "",
    time: "",
  })

  // Load appointments from DB
  const loadAppointments = useCallback(async () => {
    setLoading(true)
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    const result = await getAdminAppointments(dateStr)
    
    if (result.success) {
      setAppointmentsList(result.data)
    } else {
      toast({
        title: "Erro ao carregar",
        description: result.error,
        variant: "destructive",
      })
    }
    setLoading(false)
  }, [selectedDate, toast])

  // Load resources for dropdowns on mount
  useEffect(() => {
    async function loadResources() {
      const result = await getAdminBookingResources()
      if (result.success) {
        setResources(result.data)
      }
    }
    loadResources()
  }, [])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const handleStatusChange = async (id: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    const result = await updateAppointmentStatus(id, status)
    if (result.success) {
      toast({
        title: "Status atualizado",
        description: `Agendamento marcado como ${statusConfig[status].label.toLowerCase()}.`,
      })
      loadAppointments()
    } else {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  const handleSendWhatsAppReminder = (apt: AdminAppointment) => {
    const rawPhone = apt.clientPhone.replace(/\D/g, "")
    if (!rawPhone || rawPhone.length < 10) {
      toast({
        title: "Telefone incompleto",
        description: "O cliente não possui um número de telefone com DDD válido.",
        variant: "destructive",
      })
      return
    }
    const phone = rawPhone.startsWith("55") ? rawPhone : `55${rawPhone}`
    const dateFormatted = format(selectedDate, "dd/MM", { locale: ptBR })
    const text = encodeURIComponent(
      `Olá, ${apt.clientName}! 💈✂️\n\nPassando para lembrar do seu agendamento:\n📅 *Data:* ${dateFormatted}\n⏰ *Horário:* ${apt.time}\n💇 *Serviço:* ${apt.serviceName}\n👤 *Profissional:* ${apt.barberName}\n\nPodemos confirmar sua presença? Caso precise remarcar, nos avise respondendo por aqui! 👍`
    )
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank")
  }

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
        description: "Agendamento criado com sucesso no painel.",
      })
      setIsDialogOpen(false)
      // Reset form
      setNewAppt({
        clientName: "",
        clientPhone: "",
        barberId: "",
        serviceId: "",
        date: "",
        time: "",
      })
      loadAppointments()
    } else {
      toast({
        title: "Erro ao agendar",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  const filteredAppointments = appointmentsList.filter(
    (apt) => filter === "all" || apt.status === filter
  )

  const totalRevenue = filteredAppointments
    .filter((apt) => apt.status !== "cancelled")
    .reduce((acc, apt) => acc + apt.value, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">Gerencie seus agendamentos do dia</p>
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

      {/* Date Navigation & Stats */}
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="text-center">
              <p className="text-lg font-semibold capitalize">
                {format(selectedDate, "EEEE", { locale: ptBR })}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{filteredAppointments.length}</p>
              <p className="text-sm text-muted-foreground">Agendamentos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Calendar className="size-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-muted-foreground">Previsto</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Todos
        </Button>
        {([ "confirmed", "pending", "completed", "cancelled" ] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {statusConfig[status].label}
          </Button>
        ))}
      </div>

      {/* Appointments Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Lista de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-20 flex justify-center items-center gap-2 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
              Carregando agenda...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              Nenhum agendamento encontrado para esta data ou filtro.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-muted-foreground">Cliente</TableHead>
                    <TableHead className="text-muted-foreground">Serviço</TableHead>
                    <TableHead className="text-muted-foreground">Horário</TableHead>
                    <TableHead className="text-muted-foreground">Duração</TableHead>
                    <TableHead className="text-muted-foreground">Valor</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id} className="border-border hover:bg-secondary/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${appointment.avatar}`} />
                            <AvatarFallback>{appointment.clientName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{appointment.clientName}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="size-3" />
                              {appointment.clientPhone}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          {appointment.serviceName}
                          <p className="text-[10px] text-muted-foreground">Atendente: {appointment.barberName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {appointment.time}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {appointment.duration} min
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        R$ {appointment.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[appointment.status].color}>
                          {statusConfig[appointment.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {appointment.status !== 'cancelled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-600"
                              onClick={() => handleSendWhatsAppReminder(appointment)}
                              title="Enviar Lembrete no WhatsApp"
                            >
                              <MessageSquare className="size-3.5" />
                              <span className="hidden sm:inline">Lembrete</span>
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleSendWhatsAppReminder(appointment)}>
                                <MessageSquare className="size-4 mr-2 text-emerald-500" />
                                Enviar WhatsApp
                              </DropdownMenuItem>
                              {appointment.status !== 'confirmed' && appointment.status !== 'completed' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'confirmed')}>
                                  <Check className="size-4 mr-2" />
                                  Confirmar
                                </DropdownMenuItem>
                              )}
                              {appointment.status === 'confirmed' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'completed')}>
                                  <Check className="size-4 mr-2" />
                                  Concluir
                                </DropdownMenuItem>
                              )}
                              {appointment.status !== 'cancelled' && (
                                <DropdownMenuItem className="text-destructive" onClick={() => handleStatusChange(appointment.id, 'cancelled')}>
                                  <X className="size-4 mr-2" />
                                  Cancelar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
