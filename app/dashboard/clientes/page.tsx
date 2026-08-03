"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Search,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  Users,
  Star,
  Loader2,
  MessageSquare,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getClientsData, type ClientRecord } from "@/lib/actions/clients"

export default function ClientesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [clients, setClients] = useState<ClientRecord[]>([])
  const [totalClients, setTotalClients] = useState(0)
  const [vipClients, setVipClients] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)

  const loadClients = useCallback(async () => {
    setLoading(true)
    const result = await getClientsData()
    if (result.success) {
      setClients(result.data.clients)
      setTotalClients(result.data.totalClients)
      setVipClients(result.data.vipClients)
      setTotalRevenue(result.data.totalRevenue)
    } else {
      toast({ title: "Erro ao carregar clientes", description: result.error, variant: "destructive" })
    }
    setLoading(false)
  }, [toast])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery) ||
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{loading ? "..." : totalClients}</p>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Star className="size-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{loading ? "..." : vipClients}</p>
              <p className="text-sm text-muted-foreground">Clientes VIP (5+ visitas)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <span className="text-sm font-bold text-green-500">R$</span>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loading ? "..." : `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              </p>
              <p className="text-sm text-muted-foreground">Faturamento Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-secondary/50 border-border"
        />
      </div>

      {/* Clients Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Base de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-20 flex justify-center items-center gap-2 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
              Carregando clientes...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              {searchQuery ? "Nenhum cliente encontrado para essa busca." : "Nenhum cliente ainda. Eles aparecerão aqui após agendamentos."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-muted-foreground">Cliente</TableHead>
                    <TableHead className="text-muted-foreground">Contato</TableHead>
                    <TableHead className="text-muted-foreground">Visitas</TableHead>
                    <TableHead className="text-muted-foreground">Última Visita</TableHead>
                    <TableHead className="text-muted-foreground">Total Gasto</TableHead>
                    <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.phone} className="border-border hover:bg-secondary/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.name}`} />
                            <AvatarFallback>{client.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{client.name}</p>
                              {client.isVip && (
                                <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px]">
                                  VIP
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm flex items-center gap-1">
                            <Phone className="size-3 text-muted-foreground" />
                            {client.phone}
                          </p>
                          {client.email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="size-3" />
                              {client.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{client.visits} {client.visits === 1 ? "visita" : "visitas"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {client.lastVisit}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        R$ {client.totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                if (client.phone) {
                                  const msg = encodeURIComponent(`Olá ${client.name}! Tudo bem? 😊`)
                                  window.open(`https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${msg}`, '_blank')
                                }
                              }}
                            >
                              <MessageSquare className="size-4 mr-2" />
                              WhatsApp
                            </DropdownMenuItem>
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
