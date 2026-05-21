"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useBarberSettings } from "@/hooks/use-barber-settings"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Copy,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

const revenueData = [
  { name: "Seg", value: 320 },
  { name: "Ter", value: 450 },
  { name: "Qua", value: 380 },
  { name: "Qui", value: 520 },
  { name: "Sex", value: 680 },
  { name: "Sáb", value: 890 },
  { name: "Dom", value: 240 },
]

const servicesData = [
  { name: "Corte", value: 45 },
  { name: "Barba", value: 28 },
  { name: "Combo", value: 35 },
  { name: "Platinado", value: 12 },
  { name: "Pigmentação", value: 8 },
]

const upcomingAppointments = [
  { id: 1, client: "Pedro Almeida", service: "Corte + Barba", time: "09:00", avatar: "pedro" },
  { id: 2, client: "Lucas Santos", service: "Corte Degradê", time: "09:45", avatar: "lucas" },
  { id: 3, client: "Rafael Costa", service: "Platinado", time: "10:30", avatar: "rafael" },
  { id: 4, client: "Marcos Oliveira", service: "Barba", time: "11:15", avatar: "marcos" },
]

const recentAppointments = [
  { id: 1, client: "Carlos Silva", service: "Corte", time: "Ontem 15:30", status: "completed", value: 45 },
  { id: 2, client: "André Pereira", service: "Combo", time: "Ontem 14:00", status: "completed", value: 65 },
  { id: 3, client: "Bruno Lima", service: "Corte", time: "Ontem 13:15", status: "cancelled", value: 45 },
  { id: 4, client: "Fernando Souza", service: "Barba", time: "Ontem 11:30", status: "completed", value: 35 },
]

export default function DashboardPage() {
  const { settings } = useBarberSettings()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getSchedulingLink = () => {
    if (typeof window === 'undefined') return ''
    const origin = window.location.origin
    const params = new URLSearchParams()
    params.set('name', settings.name)
    params.set('logoStyle', settings.logoPreset)
    if (settings.logoType === 'custom' && settings.logoCustom) {
      params.set('logoType', 'custom')
    }
    return `${origin}/agendar?${params.toString()}`
  }

  const handleCopyLink = () => {
    const link = getSchedulingLink()
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast({
      title: "Link Copiado!",
      description: "O link de agendamento personalizado foi copiado para a área de transferência.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4" />
          Atualizado há 5 minutos
        </div>
      </div>

      {/* Copiar Link Card */}
      {mounted && (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-playfair font-semibold text-lg text-primary flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2 bg-primary"></span>
                  </span>
                  Link de Agendamento Personalizado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Compartilhe este link com seus clientes para que eles agendem direto na sua barbearia com a sua marca e logotipo!
                </p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto max-w-md">
                <input
                  readOnly
                  value={getSchedulingLink()}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground focus:outline-none min-w-[200px] h-9"
                />
                <Button 
                  onClick={handleCopyLink} 
                  className="shrink-0 gap-2 h-9 font-semibold"
                >
                  <Copy className="size-3.5" />
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Faturamento Hoje"
          value="R$ 1.280"
          change="+12%"
          trend="up"
          icon={DollarSign}
        />
        <StatsCard
          title="Agendamentos Hoje"
          value="14"
          change="+3"
          trend="up"
          icon={Calendar}
        />
        <StatsCard
          title="Novos Clientes"
          value="8"
          change="+2"
          trend="up"
          icon={Users}
        />
        <StatsCard
          title="Taxa de Ocupação"
          value="87%"
          change="-5%"
          trend="down"
          icon={TrendingUp}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4 bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Faturamento Semanal</CardTitle>
                <CardDescription>Últimos 7 dias</CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.78 0.14 75)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.78 0.14 75)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.005 250)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="oklch(0.55 0 0)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="oklch(0.55 0 0)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.14 0.005 250)",
                      border: "1px solid oklch(0.22 0.005 250)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`R$ ${value}`, "Faturamento"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(0.78 0.14 75)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Services Chart */}
        <Card className="lg:col-span-3 bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Serviços Populares</CardTitle>
                <CardDescription>Esta semana</CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={servicesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.005 250)" horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke="oklch(0.55 0 0)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="oklch(0.55 0 0)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.14 0.005 250)",
                      border: "1px solid oklch(0.22 0.005 250)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value, "Atendimentos"]}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="oklch(0.78 0.14 75)" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Próximos Agendamentos</CardTitle>
                <CardDescription>Hoje</CardDescription>
              </div>
              <Button variant="outline" size="sm">Ver Agenda</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <Avatar className="size-10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${appointment.avatar}`} />
                  <AvatarFallback>{appointment.client[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{appointment.client}</p>
                  <p className="text-xs text-muted-foreground">{appointment.service}</p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  <Clock className="size-3 mr-1" />
                  {appointment.time}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Atividade Recente</CardTitle>
                <CardDescription>Últimos atendimentos</CardDescription>
              </div>
              <Button variant="outline" size="sm">Ver Todos</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
              >
                {appointment.status === "completed" ? (
                  <div className="size-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="size-4 text-green-500" />
                  </div>
                ) : (
                  <div className="size-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <XCircle className="size-4 text-destructive" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{appointment.client}</p>
                    {appointment.status === "cancelled" && (
                      <Badge variant="destructive" className="text-[10px] h-4">Cancelado</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{appointment.service} • {appointment.time}</p>
                </div>
                <span className="font-medium text-sm text-primary">R$ {appointment.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
}: {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: React.ElementType
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className={`flex items-center gap-1 text-xs ${trend === "up" ? "text-green-500" : "text-destructive"}`}>
              {trend === "up" ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              <span>{change} vs ontem</span>
            </div>
          </div>
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="size-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
