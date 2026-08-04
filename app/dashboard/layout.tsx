"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { BarberSidebar } from "@/components/barber-sidebar"
import { Separator } from "@/components/ui/separator"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarberSettingsProvider } from "@/hooks/use-barber-settings"

import { NotificationsPopover } from "@/components/notifications-popover"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BarberSettingsProvider>
      <SidebarProvider>
        <BarberSidebar />
        <SidebarInset className="bg-background">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 bg-card/40 backdrop-blur-md px-4 sticky top-0 z-40">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
            <Separator orientation="vertical" className="h-4 bg-border/50" />
            
            <div className="flex-1 flex items-center gap-4">
              <div className="relative max-w-md flex-1 hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes, agendamentos..."
                  className="pl-9 h-9 bg-secondary/50 border-border"
                />
              </div>
            </div>

            <NotificationsPopover />
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </BarberSettingsProvider>
  )
}
