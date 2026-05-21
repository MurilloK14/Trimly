"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Scissors,
  Download,
  ArrowUpRight,
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
  PieChart,
  Pie,
  Cell,
} from "recharts"

const monthlyRevenue = [
  { month: "Jan", value: 12500 },
  { month: "Fev", value: 14200 },
  { month: "Mar", value: 13800 },
  { month: "Abr", value: 15600 },
  { month: "Mai", value: 16800 },
  { month: "Jun", value: 18200 },
  { month: "Jul", value: 17500 },
  { month: "Ago", value: 19800 },
  { month: "Set", value: 21200 },
  { month: "Out", value: 22500 },
  { month: "Nov", value: 24100 },
  { month: "Dez", value: 26800 },
]

const weeklyAppointments = [
  { day: "Seg", value: 18 },
  { day: "Ter", value: 22 },
  { day: "Qua", value: 25 },
  { day: "Qui", value: 28 },
  { day: "Sex", value: 35 },
  { day: "Sáb", value: 42 },
  { day: "Dom", value: 12 },
]

const serviceDistribution = [
  { name: "Corte", value: 45, color: "oklch(0.78 0.14 75)" },
  { name: "Barba", value: 25, color: "oklch(0.65 0.18 160)" },
  { name: "Combo", value: 20, color: "oklch(0.60 0.20 280)" },
  { name: "Outros", value: 10, color: "oklch(0.55 0 0)" },
]

const topServices = [
  { name: "Corte + Barba", count: 156, revenue: 10140, growth: 12 },
  { name: "Corte Degradê", count: 134, revenue: 6700, growth: 8 },
  { name: "Corte Social", count: 98, revenue: 3920, growth: -3 },
  { name: "Barba", count: 87, revenue: 3045, growth: 15 },
  { name: "Platinado", count: 34, revenue: 5100, growth: 22 },
]

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análise de desempenho do seu negócio</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="month">
            <SelectTrigger className="w-40 bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="size-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Faturamento Total"
          value="R$ 26.800"
          change="+18%"
          trend="up"
          icon={DollarSign}
          description="vs mês anterior"
        />
        <KPICard
          title="Total de Atendimentos"
          value="342"
          change="+12%"
          trend="up"
          icon={Scissors}
          description="vs mês anterior"
        />
        <KPICard
          title="Novos Clientes"
          value="47"
          change="+24%"
          trend="up"
          icon={Users}
          description="vs mês anterior"
        />
        <KPICard
          title="Taxa de Retorno"
          value="78%"
          change="-2%"
          trend="down"
          icon={Calendar}
          description="vs mês anterior"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-medium">Faturamento Mensal</CardTitle>
            <CardDescription>Evolução do faturamento ao longo do ano</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.78 0.14 75)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.78 0.14 75)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.005 250)" />
                  <XAxis 
                    dataKey="month" 
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
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.14 0.005 250)",
                      border: "1px solid oklch(0.22 0.005 250)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString()}`, "Faturamento"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(0.78 0.14 75)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card className="lg:col-span-3 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-medium">Distribuição de Serviços</CardTitle>
            <CardDescription>Participação por tipo de serviço</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.14 0.005 250)",
                      border: "1px solid oklch(0.22 0.005 250)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Participação"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {serviceDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                  <span className="text-sm font-medium ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Weekly Appointments Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-medium">Atendimentos por Dia</CardTitle>
            <CardDescription>Média semanal de agendamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAppointments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.005 250)" vertical={false} />
                  <XAxis 
                    dataKey="day" 
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
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-medium">Serviços Mais Vendidos</CardTitle>
            <CardDescription>Ranking de serviços por faturamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={service.name} className="flex items-center gap-4">
                  <div className="size-8 rounded-lg bg-secondary flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.count} atendimentos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-primary">R$ {service.revenue.toLocaleString()}</p>
                    <div className={`flex items-center justify-end gap-1 text-xs ${service.growth >= 0 ? "text-green-500" : "text-destructive"}`}>
                      {service.growth >= 0 ? (
                        <TrendingUp className="size-3" />
                      ) : (
                        <TrendingDown className="size-3" />
                      )}
                      {service.growth >= 0 ? "+" : ""}{service.growth}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KPICard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  description,
}: {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: React.ElementType
  description: string
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center gap-2">
              <Badge className={`${trend === "up" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                {trend === "up" ? <TrendingUp className="size-3 mr-1" /> : <TrendingDown className="size-3 mr-1" />}
                {change}
              </Badge>
              <span className="text-xs text-muted-foreground">{description}</span>
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
