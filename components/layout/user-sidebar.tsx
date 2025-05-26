"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, User, Home, ArrowRightLeft, MessageSquare, Plus, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"

export function UserSidebar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  if (!session?.user) return null

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Home, label: "Mijn Woningen", href: "/dashboard/homes" },
    { icon: ArrowRightLeft, label: "Uitwisselingen", href: "/dashboard/exchanges" },
    { icon: MessageSquare, label: "Berichten", href: "/dashboard/messages" },
    { icon: User, label: "Profiel", href: "/dashboard/profile" },
    { icon: Plus, label: "Woning Toevoegen", href: "/dashboard/homes/new" },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image || ""} />
            <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:block">Hi, {session.user.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-80">
        <SheetHeader className="pb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="text-lg">{session.user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-left">{session.user.name}</SheetTitle>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground mb-3">Information</div>

          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setOpen(false)
              signOut()
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
