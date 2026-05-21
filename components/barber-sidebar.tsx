"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
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
} from "lucide-react"

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Agenda", href: "/dashboard/agenda", icon: Calendar },
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

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-3 pb-2">
        <Link href="/dashboard" className="flex flex-col items-center gap-1">
          <Image
            src="/logo.png"
            alt="MK Barber"
            width={90}
            height={90}
            className="object-contain drop-shadow-[0_0_8px_rgba(202,163,74,0.4)]"
          />
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
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=barber" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold">João da Silva</div>
                <div className="text-xs text-muted-foreground">Barbeiro</div>
              </div>
              <ChevronUp className="size-4 text-muted-foreground" />
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
            <DropdownMenuItem asChild className="text-destructive">
              <Link href="/login">
                <LogOut className="size-4 mr-2" />
                Sair
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
