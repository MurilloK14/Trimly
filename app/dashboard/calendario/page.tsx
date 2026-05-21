"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { ChevronLeft, ChevronRight, Clock, User } from "lucide-react"
import { format, addMonths, subMonths, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00"
]

interface DayAppointment {
  id: number
  client: string
  service: string
  time: string
  duration: number
  avatar: string
}

const appointmentsByDate: Record<string, DayAppointment[]> = {
  "2024-01-15": [
    { id: 1, client: "Pedro Almeida", service: "Corte + Barba", time: "09:00", duration: 60, avatar: "pedro" },
    { id: 2, client: "Lucas Santos", service: "Corte", time: "11:00", duration: 45, avatar: "lucas" },
    { id: 3, client: "Rafael Costa", service: "Barba", time: "14:00", duration: 30, avatar: "rafael" },
  ],
  "2024-01-16": [
    { id: 4, client: "Marcos Oliveira", service: "Platinado", time: "10:00", duration: 120, avatar: "marcos" },
    { id: 5, client: "Bruno Lima", service: "Corte", time: "15:00", duration: 45, avatar: "bruno" },
  ],
  "2024-01-17": [
    { id: 6, client: "Fernando Souza", service: "Corte + Barba", time: "09:30", duration: 60, avatar: "fernando" },
    { id: 7, client: "Carlos Silva", service: "Pigmentação", time: "13:00", duration: 90, avatar: "carlos" },
    { id: 8, client: "André Pereira", service: "Corte", time: "16:00", duration: 45, avatar: "andre" },
    { id: 9, client: "Paulo Santos", service: "Barba", time: "17:30", duration: 30, avatar: "paulo" },
  ],
}

export default function CalendarioPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const dateKey = format(selectedDate, "yyyy-MM-dd")
  const selectedDayAppointments = appointmentsByDate[dateKey] || []

  // Highlight dates that have appointments
  const appointmentDates = Object.keys(appointmentsByDate).map(date => new Date(date))

  const getSlotStatus = (time: string) => {
    const appointment = selectedDayAppointments.find(apt => apt.time === time)
    if (appointment) {
      return { status: "booked", appointment }
    }
    // Check if slot is within an appointment duration
    const withinAppointment = selectedDayAppointments.find(apt => {
      const aptStart = parseInt(apt.time.replace(":", ""))
      const slotTime = parseInt(time.replace(":", ""))
      const aptEnd = aptStart + (apt.duration / 60) * 100
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
      <div>
        <h1 className="text-2xl font-bold">Calendário</h1>
        <p className="text-muted-foreground">Visualize e gerencie sua agenda mensal</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-1 bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
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
                hasAppointments: appointmentDates,
              }}
              modifiersClassNames={{
                hasAppointments: "bg-primary/20 text-primary font-semibold",
              }}
            />
          </CardContent>
        </Card>

        {/* Day View */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">
                  {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedDayAppointments.length} agendamento(s)
                </p>
              </div>
              <Button size="sm">Novo Agendamento</Button>
            </div>
          </CardHeader>
          <CardContent>
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
                      <div className="flex-1 flex items-center gap-3 p-2 rounded-md bg-background/50">
                        <Avatar className="size-9">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${appointment.avatar}`} />
                          <AvatarFallback>{appointment.client[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{appointment.client}</p>
                          <p className="text-xs text-muted-foreground">{appointment.service}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          <Clock className="size-3 mr-1" />
                          {appointment.duration}min
                        </Badge>
                      </div>
                    ) : status === "occupied" ? (
                      <div className="flex-1 flex items-center justify-center border-l-2 border-primary/30 pl-3">
                        <span className="text-xs text-muted-foreground">Em atendimento</span>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center border border-dashed border-border rounded-md hover:border-primary/50 cursor-pointer transition-colors group">
                        <span className="text-xs text-muted-foreground group-hover:text-primary mx-auto">
                          Horário disponível
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Resumo da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day, index) => {
              const appointmentCount = Math.floor(Math.random() * 8)
              const isFull = appointmentCount >= 6
              const isToday = index === new Date().getDay()
              
              return (
                <div
                  key={day}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    isToday 
                      ? "bg-primary/20 border border-primary/30" 
                      : "bg-secondary/30 hover:bg-secondary/50"
                  }`}
                >
                  <p className="text-xs text-muted-foreground mb-1">{day}</p>
                  <p className={`text-lg font-bold ${isFull ? "text-destructive" : isToday ? "text-primary" : ""}`}>
                    {appointmentCount}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isFull ? "Lotado" : "Livres"}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
