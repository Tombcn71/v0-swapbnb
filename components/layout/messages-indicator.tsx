"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function MessagesIndicator() {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/messages")
        if (response.ok) {
          const conversations = await response.json()
          const totalUnread = conversations.reduce((total: number, conv: any) => total + (conv.unread_count || 0), 0)
          setUnreadCount(totalUnread)
        }
      } catch (error) {
        console.error("Error fetching unread messages:", error)
      }
    }

    fetchUnreadCount()

    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [session?.user?.id])

  if (!session?.user) return null

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/messages">
        <Mail className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
        <span className="sr-only">Berichten {unreadCount > 0 && `(${unreadCount} ongelezen)`}</span>
      </Link>
    </Button>
  )
}
