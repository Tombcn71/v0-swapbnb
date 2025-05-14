"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, MessageSquare, User, RefreshCw, Search } from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      label: "Woningen",
      href: "/listings",
      icon: <Search className="h-5 w-5" />,
    },
    {
      label: "Uitwisselingen",
      href: "/exchanges",
      icon: <RefreshCw className="h-5 w-5" />,
    },
    {
      label: "Berichten",
      href: "/messages",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      label: "Profiel",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
    },
  ]

  return (
    <nav className="flex overflow-x-auto pb-2">
      <div className="flex space-x-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className="flex items-center"
              asChild
            >
              <Link href={item.href}>
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Link>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
