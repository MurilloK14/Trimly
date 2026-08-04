"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Calendar, Clock, Loader2, CheckCircle2, AlertCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { getRecentNotifications, type NotificationItem } from "@/lib/actions/appointments"

export function NotificationsPopover() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    const result = await getRecentNotifications()
    if (result.success) {
      setNotifications(result.data)
      setUnreadCount(result.data.filter(n => n.status === "confirmed" || n.status === "pending").length)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadNotifications()
    // Atualiza a cada 30 segundos
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [loadNotifications])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0">
          <Bell className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 bg-primary rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 sm:w-96 p-0 bg-card border-border shadow-xl">
        <div className="p-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <h3 className="font-semibold text-sm">Notificações</h3>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
              {unreadCount} novos
            </Badge>
          )}
        </div>

        <div className="max-h-[350px] overflow-y-auto divide-y divide-border/50">
          {loading && notifications.length === 0 ? (
            <div className="p-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Carregando...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Nenhum agendamento recente.
            </div>
          ) : (
            notifications.map((item) => (
              <div key={item.id} className="p-3.5 hover:bg-secondary/40 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-medium text-xs truncate text-foreground">{item.clientName}</span>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-muted-foreground mb-1.5">
                  <span className="text-primary font-medium">{item.serviceName}</span> com {item.barberName}
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground/80">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3 text-primary/70" />
                    {item.dateFormatted} às {item.time}
                  </span>
                  <span>{item.createdAtFormatted}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <Separator />
        <div className="p-2 bg-secondary/20 text-center">
          <Link
            href="/dashboard/todos-agendamentos"
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-primary hover:underline block py-1"
          >
            Ver todos os agendamentos →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
        <CheckCircle2 className="size-2.5" /> Confirmado
      </span>
    )
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
        Concluído
      </span>
    )
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">
        <XCircle className="size-2.5" /> Cancelado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
      <AlertCircle className="size-2.5" /> Pendente
    </span>
  )
}
