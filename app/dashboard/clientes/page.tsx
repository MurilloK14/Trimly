"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Label } from "@/components/ui/label"
import {
  Plus,
  Search,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  Users,
  UserPlus,
  Star,
  MessageSquare,
} from "lucide-react"

const clients = [
  { id: 1, name: "Pedro Almeida", phone: "(11) 99999-1234", email: "pedro@email.com", visits: 24, lastVisit: "12/01/2024", totalSpent: 1560, avatar: "pedro", vip: true },
  { id: 2, name: "Lucas Santos", phone: "(11) 98888-5678", email: "lucas@email.com", visits: 18, lastVisit: "10/01/2024", totalSpent: 1120, avatar: "lucas", vip: true },
  { id: 3, name: "Rafael Costa", phone: "(11) 97777-9012", email: "rafael@email.com", visits: 12, lastVisit: "08/01/2024", totalSpent: 780, avatar: "rafael", vip: false },
  { id: 4, name: "Marcos Oliveira", phone: "(11) 96666-3456", email: "marcos@email.com", visits: 8, lastVisit: "05/01/2024", totalSpent: 520, avatar: "marcos", vip: false },
  { id: 5, name: "Bruno Lima", phone: "(11) 95555-7890", email: "bruno@email.com", visits: 6, lastVisit: "03/01/2024", totalSpent: 390, avatar: "bruno", vip: false },
  { id: 6, name: "Fernando Souza", phone: "(11) 94444-2345", email: "fernando@email.com", visits: 15, lastVisit: "11/01/2024", totalSpent: 975, avatar: "fernando", vip: true },
  { id: 7, name: "Carlos Silva", phone: "(11) 93333-6789", email: "carlos@email.com", visits: 4, lastVisit: "01/01/2024", totalSpent: 260, avatar: "carlos", vip: false },
  { id: 8, name: "André Pereira", phone: "(11) 92222-0123", email: "andre@email.com", visits: 20, lastVisit: "13/01/2024", totalSpent: 1300, avatar: "andre", vip: true },
]

export default function ClientesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalClients = clients.length
  const vipClients = clients.filter((c) => c.vip).length
  const totalRevenue = clients.reduce((acc, c) => acc + c.totalSpent, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
              <DialogDescription>
                Adicione um novo cliente à sua base
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome Completo</Label>
                <Input id="clientName" placeholder="Digite o nome" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Telefone</Label>
                <Input id="clientPhone" placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">E-mail</Label>
                <Input id="clientEmail" type="email" placeholder="email@exemplo.com" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancelar</Button>
              <Button>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalClients}</p>
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
              <p className="text-2xl font-bold">{vipClients}</p>
              <p className="text-sm text-muted-foreground">Clientes VIP</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <span className="text-lg font-bold text-green-500">R$</span>
            </div>
            <div>
              <p className="text-2xl font-bold">R$ {totalRevenue.toLocaleString()}</p>
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
          <CardTitle className="text-base font-medium">Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <TableRow key={client.id} className="border-border hover:bg-secondary/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.avatar}`} />
                          <AvatarFallback>{client.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{client.name}</p>
                            {client.vip && (
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
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="size-3" />
                          {client.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{client.visits} visitas</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {client.lastVisit}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      R$ {client.totalSpent.toLocaleString()}
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
                            <Calendar className="size-4 mr-2" />
                            Agendar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="size-4 mr-2" />
                            Enviar Mensagem
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Star className="size-4 mr-2" />
                            {client.vip ? "Remover VIP" : "Tornar VIP"}
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
