"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Home, MessageSquare, User, RefreshCw, Search, ChevronDown, LogOut, Plus } from "lucide-react"
import Link from "next/link"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Woningen",
    url: "/listings",
    icon: Search,
  },
  {
    title: "Uitwisselingen",
    url: "/exchanges",
    icon: RefreshCw,
  },
  {
    title: "Berichten",
    url: "/messages",
    icon: MessageSquare,
  },
  {
    title: "Profiel",
    url: "/profile",
    icon: User,
  },
  {
    title: "Woning toevoegen",
    url: "/homes/new",
    icon: Plus,
  },
]

export function UserSidebar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  if (!session?.user) return null

  const userName = session.user.name || "Gebruiker"
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      {/* Trigger Button */}
      <Button variant="ghost" className="flex items-center gap-2 px-3 py-2" onClick={() => setOpen(true)}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={session.user.image || ""} />
          <AvatarFallback className="text-sm">{userInitials}</AvatarFallback>
        </Avatar>
        <span className="font-medium">Hi, {userName.split(" ")[0]}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* Sidebar */}
      <Sidebar side="right" className="border-l">
        <SidebarHeader className="border-b p-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{userName}</h3>
              <p className="text-sm text-muted-foreground">5 Credits pending</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url} onClick={() => setOpen(false)}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t p-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              setOpen(false)
              signOut()
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}
