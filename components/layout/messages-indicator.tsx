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

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchExchangeData = async () => {
      try {
        // Haal exchanges op om de meest recente te vinden
        const exchangesResponse = await fetch("/api/exchanges")
        if (exchangesResponse.ok) {
          const exchanges = await exchangesResponse.json()
          console.log("Fetched exchanges:", exchanges) // Debug log

          if (Array.isArray(exchanges) && exchanges.length > 0) {
            // Vind actieve exchanges
            const activeExchanges = exchanges.filter(
              (ex: any) =>
                ex.status === "pending" ||
                ex.status === "accepted" ||
                ex.status === "confirmed" ||
                ex.status === "videocall_scheduled",
            )

            console.log("Active exchanges:", activeExchanges) // Debug log

            if (activeExchanges.length > 0) {
              // Sorteer op meest recente en pak de eerste
              const sortedExchanges = activeExchanges.sort(
                (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
              )
              setLatestExchangeId(sortedExchanges[0].id)
              console.log("Latest exchange ID:", sortedExchanges[0].id) // Debug log
            } else {
              setLatestExchangeId(null)
            }
          } else {
            setLatestExchangeId(null)
          }
        }

        // Haal exchange berichten op voor unread count (niet algemene berichten)
        let totalUnread = 0
        const exchangesResponse2 = await fetch("/api/exchanges")
        if (exchangesResponse2.ok) {
          const exchanges = await exchangesResponse2.json()

          // Tel ongelezen berichten per exchange
          for (const exchange of exchanges) {
            try {
              const messagesResponse = await fetch(`/api/exchanges/${exchange.id}/messages`)
              if (messagesResponse.ok) {
                const messages = await messagesResponse.json()
                // Tel berichten die niet van de huidige gebruiker zijn en nog niet gelezen
                const unreadMessages = messages.filter((msg: any) => msg.sender_id !== session.user.id && !msg.read)
                totalUnread += unreadMessages.length
              }
            } catch (error) {
              console.error(`Error fetching messages for exchange ${exchange.id}:`, error)
            }
          }
        }

        console.log("Total unread count:", totalUnread) // Debug log
        setUnreadCount(totalUnread)
      } catch (error) {
        console.error("Error fetching exchange data:", error)
        setUnreadCount(0)
        setLatestExchangeId(null)
      }
    }

    fetchExchangeData()

    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchExchangeData, 30000)
    return () => clearInterval(interval)
  }, [session?.user?.id])

  if (!session?.user) return null

  // Link naar de meest recente exchange, of naar exchanges overzicht als er geen actieve exchange is
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
