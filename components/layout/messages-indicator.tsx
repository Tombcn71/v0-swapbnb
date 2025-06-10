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
  const [latestExchangeId, setLatestExchangeId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchUnreadCount = async () => {
      setIsLoading(true)
      try {
        // Fetch all exchanges
        const exchangesResponse = await fetch("/api/exchanges")
        if (!exchangesResponse.ok) throw new Error("Failed to fetch exchanges")

        const exchanges = await exchangesResponse.json()

        // Find ALL exchanges (not just active ones) and sort by most recent activity
        const sortedExchanges = exchanges.sort(
          (a: any, b: any) =>
            new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime(),
        )

        // Set latest exchange ID for direct navigation (any exchange, not just active)
        if (sortedExchanges.length > 0) {
          setLatestExchangeId(sortedExchanges[0].id)
        } else {
          setLatestExchangeId(null)
        }

        // Count unread messages across all exchanges
        let totalUnread = 0

        for (const exchange of exchanges) {
          try {
            const messagesResponse = await fetch(`/api/exchanges/${exchange.id}/messages`)
            if (messagesResponse.ok) {
              const messages = await messagesResponse.json()
              // Count messages not from current user and unread
              const unreadMessages = messages.filter((msg: any) => msg.sender_id !== session.user.id && !msg.read)
              totalUnread += unreadMessages.length
            }
          } catch (error) {
            console.error(`Error fetching messages for exchange ${exchange.id}:`, error)
          }
        }

        setUnreadCount(totalUnread)
      } catch (error) {
        console.error("Error fetching unread count:", error)
        setUnreadCount(0)
        setLatestExchangeId(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchUnreadCount()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [session?.user?.id])

  // Debug logging
  console.log("MessagesIndicator - latestExchangeId:", latestExchangeId, "unreadCount:", unreadCount)

  if (!session?.user || isLoading) return null

  // Link to the most recent exchange, or to exchanges overview if none
  const href = latestExchangeId ? `/exchanges/${latestExchangeId}` : "/exchanges"

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href={href}>
        <Mail className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
        <span className="sr-only">Swap berichten {unreadCount > 0 && `(${unreadCount} ongelezen)`}</span>
      </Link>
    </Button>
  )
}
