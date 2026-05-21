"use client"

import { useState } from "react"
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
  DialogTrigger,
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
  Scissors,
  Phone,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react"
import { format, addDays, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"

type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled"

interface Appointment {
  id: number
  client: string
  phone: string
  service: string
  time: string
  duration: number
  status: AppointmentStatus
  avatar: string
  value: number
}

const appointments: Appointment[] = [
  { id: 1, client: "Pedro Almeida", phone: "(11) 99999-1234", service: "Corte + Barba", time: "09:00", duration: 60, status: "confirmed", avatar: "pedro", value: 65 },
  { id: 2, client: "Lucas Santos", phone: "(11) 98888-5678", service: "Corte Degradê", time: "10:00", duration: 45, status: "confirmed", avatar: "lucas", value: 50 },
  { id: 3, client: "Rafael Costa", phone: "(11) 97777-9012", service: "Platinado", time: "11:00", duration: 120, status: "pending", avatar: "rafael", value: 150 },
  { id: 4, client: "Marcos Oliveira", phone: "(11) 96666-3456", service: "Barba", time: "13:00", duration: 30, status: "confirmed", avatar: "marcos", value: 35 },
  { id: 5, client: "Bruno Lima", phone: "(11) 95555-7890", service: "Corte Social", time: "14:00", duration: 30, status: "completed", avatar: "bruno", value: 40 },
  { id: 6, client: "Fernando Souza", phone: "(11) 94444-2345", service: "Corte + Barba", time: "15:00", duration: 60, status: "cancelled", avatar: "fernando", value: 65 },
  { id: 7, client: "Carlos Silva", phone: "(11) 93333-6789", service: "Corte Navalhado", time: "16:00", duration: 45, status: "pending", avatar: "carlos", value: 55 },
  { id: 8, client: "André Pereira", phone: "(11) 92222-0123", service: "Pigmentação", time: "17:00", duration: 90, status: "confirmed", avatar: "andre", value: 120 },
]

const services = [
  { name: "Corte Social", duration: 30, price: 40 },
  { name: "Corte Degradê", duration: 45, price: 50 },
  { name: "Corte Navalhado", duration: 45, price: 55 },
  { name: "Corte + Barba", duration: 60, price: 65 },
  { name: "Barba", duration: 30, price: 35 },
  { name: "Platinado", duration: 120, price: 150 },
  { name: "Pigmentação", duration: 90, price: 120 },
]

const statusConfig = {
  confirmed: { label: "Confirmado", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  pending: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  completed: { label: "Concluído", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-500 border-red-500/20" },
}

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filter, setFilter] = useState<AppointmentStatus | "all">("all")

  const filteredAppointments = appointments.filter(
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
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar um novo agendamento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client">Nome do Cliente</Label>
                <Input id="client" placeholder="Digite o nome" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Serviço</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.name} value={service.name}>
                        {service.name} - R$ {service.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input id="time" type="time" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancelar</Button>
              <Button>Agendar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
              <p className="text-lg font-semibold">
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
              <Scissors className="size-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">R$ {totalRevenue}</p>
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
        {(Object.keys(statusConfig) as AppointmentStatus[]).map((status) => (
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
                          <AvatarFallback>{appointment.client[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{appointment.client}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="size-3" />
                            {appointment.phone}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{appointment.service}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {appointment.time}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {appointment.duration} min
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      R$ {appointment.value}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[appointment.status].color}>
                        {statusConfig[appointment.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Check className="size-4 mr-2" />
                            Confirmar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <User className="size-4 mr-2" />
                            Ver Cliente
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <X className="size-4 mr-2" />
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
