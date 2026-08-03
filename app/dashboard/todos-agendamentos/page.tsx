"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  MoreHorizontal,
  Phone,
  Check,
  X,
  Loader2,
  Calendar,
  ListOrdered,
  ArrowUpDown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getAllAdminAppointments,
  updateAppointmentStatus,
  type DetailedAdminAppointment,
} from "@/lib/actions/appointments"

const statusConfig = {
  confirmed: { label: "Confirmado", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  pending: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  completed: { label: "Concluído", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-500 border-red-500/20" },
}

export default function TodosAgendamentosPage() {
  const { toast } = useToast()
  const [appointmentsList, setAppointmentsList] = useState<DetailedAdminAppointment[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'>("all")
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("asc")

  const loadAllAppointments = useCallback(async () => {
    setLoading(true)
    const result = await getAllAdminAppointments(sortOrder)
    if (result.success) {
      setAppointmentsList(result.data)
    } else {
      toast({
        title: "Erro ao carregar agendamentos",
        description: result.error,
        variant: "destructive",
      })
    }
    setLoading(false)
  }, [sortOrder, toast])

  useEffect(() => {
    loadAllAppointments()
  }, [loadAllAppointments])

  const handleStatusChange = async (id: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    const result = await updateAppointmentStatus(id, status)
    if (result.success) {
      toast({
        title: "Status atualizado",
        description: `Agendamento alterado para ${statusConfig[status].label.toLowerCase()}.`,
      })
      loadAllAppointments()
    } else {
      toast({
        title: "Erro ao atualizar",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  // Client-side filtering
  const filteredAppointments = appointmentsList.filter((apt) => {
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !query ||
      apt.clientName.toLowerCase().includes(query) ||
      apt.clientPhone.toLowerCase().includes(query) ||
      apt.serviceName.toLowerCase().includes(query) ||
      apt.barberName.toLowerCase().includes(query)

    return matchesStatus && matchesSearch
  })

  const totalValue = filteredAppointments
    .filter((apt) => apt.status !== "cancelled")
    .reduce((acc, apt) => acc + apt.value, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ListOrdered className="size-6 text-primary" />
            Todos os Agendamentos
          </h1>
          <p className="text-muted-foreground">Histórico completo de atendimentos ordenados por data e horário</p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{filteredAppointments.length}</p>
              <p className="text-sm text-muted-foreground">Total de Agendamentos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Check className="size-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-muted-foreground">Valor Total (Ativos)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-secondary flex items-center justify-center">
              <ArrowUpDown className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ordenação Atual</p>
              <p className="text-sm font-bold text-foreground">
                {sortOrder === 'asc' ? "Cronológica (Mais Antigos → Futuros)" : "Decrescente (Futuros → Mais Antigos)"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls: Search, Status Filter & Sorting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, telefone ou serviço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-border"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-lg border border-border">
            <Button
              variant={statusFilter === "all" ? "default" : "ghost"}
              size="sm"
              className="text-xs h-8"
              onClick={() => setStatusFilter("all")}
            >
              Todos
            </Button>
            {(["confirmed", "pending", "completed", "cancelled"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "ghost"}
                size="sm"
                className="text-xs h-8"
                onClick={() => setStatusFilter(status)}
              >
                {statusConfig[status].label}
              </Button>
            ))}
          </div>

          {/* Sort Order Selector */}
          <Select value={sortOrder} onValueChange={(v: 'asc' | 'desc') => setSortOrder(v)}>
            <SelectTrigger className="w-[180px] h-9 bg-secondary/50 border-border text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Mais Antigos → Futuros</SelectItem>
              <SelectItem value="desc">Futuros → Mais Antigos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Lista Cronológica Completa</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-20 flex justify-center items-center gap-2 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
              Carregando agendamentos...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              Nenhum agendamento encontrado com os filtros aplicados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-muted-foreground">Data e Horário</TableHead>
                    <TableHead className="text-muted-foreground">Cliente</TableHead>
                    <TableHead className="text-muted-foreground">Serviço / Atendente</TableHead>
                    <TableHead className="text-muted-foreground">Duração</TableHead>
                    <TableHead className="text-muted-foreground">Valor</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id} className="border-border hover:bg-secondary/30">
                      {/* Data e Horário */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {appointment.dateFormatted}
                          </Badge>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {appointment.time}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Cliente */}
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

                      {/* Serviço */}
                      <TableCell className="text-sm">
                        <div>
                          <p className="font-medium">{appointment.serviceName}</p>
                          <p className="text-xs text-muted-foreground">Barbeiro: {appointment.barberName}</p>
                        </div>
                      </TableCell>

                      {/* Duração */}
                      <TableCell className="text-sm text-muted-foreground">
                        {appointment.duration} min
                      </TableCell>

                      {/* Valor */}
                      <TableCell className="font-medium text-primary">
                        R$ {appointment.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge className={statusConfig[appointment.status].color}>
                          {statusConfig[appointment.status].label}
                        </Badge>
                      </TableCell>

                      {/* Ações */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
