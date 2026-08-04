"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useBarberSettings } from "@/hooks/use-barber-settings"
import { BarberLogo } from "@/components/barber-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  ChevronUp,
  BarChart3,
  User,
  ListOrdered,
} from "lucide-react"
import { logout } from "@/lib/actions/auth"
import { getSidebarUser } from "@/lib/actions/auth/user"

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Agenda", href: "/dashboard/agenda", icon: Calendar },
  { title: "Todos Agendamentos", href: "/dashboard/todos-agendamentos", icon: ListOrdered },
  { title: "Calendário", href: "/dashboard/calendario", icon: CalendarDays },
  { title: "Clientes", href: "/dashboard/clientes", icon: Users },
  { title: "Relatórios", href: "/dashboard/relatorios", icon: BarChart3 },
]

const settingsItems = [
  { title: "Meu Perfil", href: "/dashboard/perfil", icon: User },
  { title: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
]

export function BarberSidebar() {
  const pathname = usePathname()
  const { settings } = useBarberSettings()
  const [mounted, setMounted] = useState(false)
  const [sidebarEmail, setSidebarEmail] = useState("")
  const [sidebarShopName, setSidebarShopName] = useState("")

  useEffect(() => {
    setMounted(true)
    getSidebarUser().then(result => {
      if (result.success) {
        setSidebarEmail(result.data.email)
        setSidebarShopName(result.data.barbershopName)
      }
    })
  }, [])

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border/30">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 w-full justify-center">
          {mounted ? (
            <BarberLogo
              name={settings.name}
              preset={settings.logo_preset}
              customLogo={settings.logo_custom}
              logoType={settings.logo_type}
              size="md"
            />
          ) : (
            <div className="h-10 w-full animate-pulse bg-secondary/50 rounded-lg" />
          )}
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel
            className="px-2 text-xs tracking-widest uppercase text-muted-foreground"
            style={{ fontFamily: "var(--font-rye)" }}
          >
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className="h-11 text-base"
                  >
                    <Link href={item.href} className="gap-3">
                      <item.icon className="size-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel
            className="px-2 text-xs tracking-widest uppercase text-muted-foreground"
            style={{ fontFamily: "var(--font-rye)" }}
          >
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className="h-11 text-base"
                  >
                    <Link href={item.href} className="gap-3">
                      <item.icon className="size-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-2 w-full rounded-lg hover:bg-sidebar-accent transition-colors">
              <Avatar className="size-9">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sidebarEmail}`} />
                <AvatarFallback>{(settings.name || sidebarShopName || "B")[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-semibold truncate">{settings.name || sidebarShopName || "Minha Barbearia"}</div>
                <div className="text-xs text-muted-foreground truncate">{sidebarEmail}</div>
              </div>
              <ChevronUp className="size-4 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/perfil">
                <User className="size-4 mr-2" />
                Meu Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={async () => {
                await logout()
              }}
            >
              <LogOut className="size-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
