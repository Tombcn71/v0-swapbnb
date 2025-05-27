"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, User, Home, ArrowRightLeft, MessageSquare, Plus, LogOut, Search, Menu, Heart } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"

export function UserSidebar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  if (!session?.user) return null

  const menuItems = [
    { icon: Home, label: "Mijn Woning", href: "/my-homes" },
    { icon: ArrowRightLeft, label: "Mijn Swaps", href: "/exchanges" },
    { icon: Heart, label: "Favoriete Woningen", href: "/favorites" },
    { icon: Search, label: "Woningen Zoeken", href: "/listings" },
    { icon: MessageSquare, label: "Berichten", href: "/messages" },
    { icon: User, label: "Profiel", href: "/profile" },
    { icon: Plus, label: "Woning Toevoegen", href: "/homes/new" },
  ]

  // Gebruik profile_image uit de session
  const profileImage = session.user.profile_image || session.user.image

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {/* Mobile: Hamburger Menu */}
        <Button variant="ghost" size="icon" className="sm:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>

      <SheetTrigger asChild>
        {/* Desktop: Hi, Name dropdown with profile photo */}
        <Button variant="ghost" className="hidden sm:flex items-center gap-2 px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profileImage || ""} alt={session.user.name || "User"} className="object-cover" />
            <AvatarFallback className="bg-blue-500 text-white">
              {session.user.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span>Hi, {session.user.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-80">
        <SheetHeader className="pb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profileImage || ""} alt={session.user.name || "User"} className="object-cover" />
              <AvatarFallback className="bg-blue-500 text-white text-lg">
                {session.user.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-left">{session.user.name}</SheetTitle>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground mb-3">Navigation</div>

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
