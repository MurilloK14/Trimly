"use client"

import { useState, useEffect, useCallback } from "react"
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
  DollarSign,
  Users,
  Calendar,
  Scissors,
  Loader2,
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
import { useToast } from "@/hooks/use-toast"
import { getReportsData, type ReportsData } from "@/lib/actions/reports"

type Period = 'week' | 'month' | 'quarter' | 'year'

export default function RelatoriosPage() {
  const { toast } = useToast()
  const [period, setPeriod] = useState<Period>('month')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ReportsData | null>(null)

  const loadReports = useCallback(async (p: Period) => {
    setLoading(true)
    const result = await getReportsData(p)
    if (result.success) {
      setData(result.data)
    } else {
      toast({ title: "Erro ao carregar relatórios", description: result.error, variant: "destructive" })
    }
    setLoading(false)
  }, [toast])

  useEffect(() => {
    loadReports(period)
  }, [period, loadReports])

  const kpis = data?.kpis || { totalRevenue: 0, totalAppointments: 0, uniqueClients: 0, avgTicket: 0 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análise de desempenho do seu negócio</p>
        </div>
        <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
          <SelectTrigger className="w-44 bg-secondary/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="quarter">Este Trimestre</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="h-[50vh] flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Calculando relatórios...
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Faturamento Total"
              value={`R$ ${kpis.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
            />
            <KPICard
              title="Total de Atendimentos"
              value={String(kpis.totalAppointments)}
              icon={Scissors}
            />
            <KPICard
              title="Clientes Únicos"
              value={String(kpis.uniqueClients)}
              icon={Users}
            />
            <KPICard
              title="Ticket Médio"
              value={`R$ ${kpis.avgTicket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={TrendingUp}
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 lg:grid-cols-7">
            {/* Revenue Chart */}
            <Card className="lg:col-span-4 bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-medium">Faturamento por Período</CardTitle>
                <CardDescription>Evolução do faturamento real (R$)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.monthlyRevenue || []}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.78 0.14 75)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.78 0.14 75)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.005 250)" />
                      <XAxis dataKey="month" stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="oklch(0.55 0 0)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: "oklch(0.14 0.005 250)", border: "1px solid oklch(0.22 0.005 250)", borderRadius: "8px" }}
                        formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Faturamento"]}
                      />
                      <Area type="monotone" dataKey="value" stroke="oklch(0.78 0.14 75)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Service Distribution */}
            <Card className="lg:col-span-3 bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-medium">Distribuição de Serviços</CardTitle>
                <CardDescription>Participação por tipo de serviço (%)</CardDescription>
              </CardHeader>
              <CardContent>
                {(data?.serviceDistribution || []).length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                    Nenhum dado disponível para o período.
                  </div>
                ) : (
                  <>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data?.serviceDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {(data?.serviceDistribution || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: "oklch(0.14 0.005 250)", border: "1px solid oklch(0.22 0.005 250)", borderRadius: "8px" }}
                            formatter={(value: number) => [`${value}%`, "Participação"]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {(data?.serviceDistribution || []).map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                          <span className="text-xs font-medium ml-auto">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Weekly Appointments Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-medium">Atendimentos por Dia da Semana</CardTitle>
                <CardDescription>Distribuição semanal dos agendamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.weeklyAppointments || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.005 250)" vertical={false} />
                      <XAxis dataKey="day" stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "oklch(0.14 0.005 250)", border: "1px solid oklch(0.22 0.005 250)", borderRadius: "8px" }}
                        formatter={(value: number) => [value, "Atendimentos"]}
                      />
                      <Bar dataKey="value" fill="oklch(0.78 0.14 75)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Services */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-medium">Serviços Mais Vendidos</CardTitle>
                <CardDescription>Ranking por faturamento no período</CardDescription>
              </CardHeader>
              <CardContent>
                {(data?.topServices || []).length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    Nenhum dado disponível para o período.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(data?.topServices || []).map((service, index) => (
                      <div key={service.name} className="flex items-center gap-4">
                        <div className="size-8 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold text-primary shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.count} atendimento(s)</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-medium text-sm text-primary">
                            R$ {service.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function KPICard({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="size-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
