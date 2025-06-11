"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { SwapProgressIndicator } from "./swap-progress-indicator"
import { VideocallScheduler } from "./videocall-scheduler"
import { VideocallBanner } from "./videocall-banner"
import { EnhancedSwapConfirmationModal } from "./enhanced-swap-confirmation-modal"
import { useSession } from "next-auth/react"
import { Textarea } from "@/components/ui/textarea"
import { MessageList } from "@/components/messaging/message-list"
import { SwapCongratulationsModal } from "@/components/exchanges/swap-congratulations-modal"

interface ExchangeChatProps {
  exchange: any
  onStatusUpdate?: () => void
}

export function ExchangeChat({ exchange, onStatusUpdate }: ExchangeChatProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCongratulations, setShowCongratulations] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [previousStatus, setPreviousStatus] = useState(exchange?.status)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const searchParams = useSearchParams()

  // Fetch messages
  const fetchMessages = async () => {
    if (!exchange?.id) return

    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)

        // Mark messages as read
        fetch(`/api/exchanges/${exchange.id}/messages/read`, {
          method: "POST",
        }).catch((error) => {
          console.error("Error marking messages as read:", error)
        })
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  // Initial fetch and setup polling
  useEffect(() => {
    fetchMessages()

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000)

    return () => clearInterval(interval)
  }, [exchange?.id])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Check if status changed to confirmed
  useEffect(() => {
    if (previousStatus !== "confirmed" && exchange?.status === "confirmed") {
      setShowCongratulations(true)
    }
    setPreviousStatus(exchange?.status)
  }, [exchange?.status, previousStatus])

  // Check for payment success in URL
  useEffect(() => {
    const payment = searchParams.get("payment")
    if (payment === "success") {
      setShowPaymentSuccess(true)
      toast({
        title: "Betaling geslaagd! 💳",
        description: "Je betaling is verwerkt. De swap wordt bevestigd zodra beide partijen hebben betaald.",
      })
    }
  }, [searchParams, toast])

  // Check if swap is newly confirmed and show modal
  useEffect(() => {
    const bothConfirmed = exchange.requester_confirmed && exchange.host_confirmed
    const shownConfirmations = JSON.parse(localStorage.getItem("shownSwapConfirmations") || "[]")

    if (bothConfirmed && !shownConfirmations.includes(exchange.id)) {
      setShowConfirmationModal(true)
    }
  }, [exchange])

  // Determine if quick replies should be shown
  const currentUserId = session?.user?.id
  const isRequester = session?.user?.id === exchange.requester_id
  const isHost = session?.user?.id === exchange.host_id
  useEffect(() => {
    // Show quick replies only for host when status is pending and no messages have been sent yet
    const shouldShowQuickReplies =
      isHost && exchange.status === "pending" && messages.filter((m) => m.sender_id === currentUserId).length === 0

    setShowQuickReplies(shouldShowQuickReplies)
  }, [isHost, exchange.status, messages, currentUserId])

  // Update local messages when props change

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !session?.user?.id || !exchange?.id) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      setNewMessage("")
      fetchMessages()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickReply = async (content: string, accept: boolean) => {
    setActionLoading(accept ? "accept-quick" : "reject-quick")

    try {
      // Send the quick reply message
      const messageResponse = await fetch(`/api/exchanges/${exchange.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
        }),
      })

      if (!messageResponse.ok) {
        const errorData = await messageResponse.json()
        throw new Error(errorData.error || "Failed to send quick reply")
      }

      const newMessage = await messageResponse.json()
      setMessages((prev) => [...prev, newMessage])

      // If accepting, update the exchange status
      if (accept) {
        const statusResponse = await fetch(`/api/exchanges/${exchange.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "accepted" }),
        })

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json()
          throw new Error(errorData.error || "Failed to update exchange status")
        }

        toast({
          title: "🎉 Swap geaccepteerd!",
          description: "Jullie zijn nu in gesprek. Plan een videocall om kennis te maken!",
        })

        onStatusUpdate()
      } else {
        // If rejecting, update the exchange status to rejected
        const statusResponse = await fetch(`/api/exchanges/${exchange.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "rejected" }),
        })

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json()
          throw new Error(errorData.error || "Failed to update exchange status")
        }

        toast({
          title: "❌ Swap afgewezen",
          description: "Je hebt de swap aanvraag afgewezen.",
        })

        onStatusUpdate()
      }

      // Hide quick replies after using one
      setShowQuickReplies(false)
    } catch (error: any) {
      console.error("Error with quick reply:", error)
      toast({
        title: "❌ Fout",
        description: error.message || "Er is een fout opgetreden.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleConfirm = async () => {
    setActionLoading("confirm")
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/confirm`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()

        if (data.free_swap) {
          toast({
            title: data.both_confirmed ? "🎉 Swap Bevestigd!" : "✅ Goedkeuring Geregistreerd",
            description: data.message,
          })
          onStatusUpdate()
        } else {
          if (data.checkout_url) {
            toast({
              title: "💳 Doorverwijzen naar betaling...",
              description: "Je wordt doorgestuurd naar de betaalpagina.",
            })
            window.location.href = data.checkout_url
          }
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to confirm exchange")
      }
    } catch (error: any) {
      console.error("Error confirming exchange:", error)
      toast({
        title: "❌ Fout",
        description: error.message || "Er is een fout opgetreden bij het goedkeuren van de swap.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteExchange = async () => {
    setActionLoading("delete")
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/delete`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "🗑️ Swap verwijderd",
          description: "De swap is verwijderd uit je berichten.",
        })
        // Redirect to exchanges overview
        window.location.href = "/exchanges"
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete exchange")
      }
    } catch (error: any) {
      console.error("Error deleting exchange:", error)
      toast({
        title: "❌ Fout",
        description: error.message || "Er is een fout opgetreden bij het verwijderen van de swap.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "⏳ In behandeling", variant: "secondary" as const },
      accepted: { label: "💬 In gesprek", variant: "default" as const },
      videocall_scheduled: { label: "📹 Videocall gepland", variant: "default" as const },
      videocall_completed: { label: "✅ Kennismaking voltooid", variant: "default" as const },
      rejected: { label: "❌ Afgewezen", variant: "destructive" as const },
      confirmed: { label: "🎉 Bevestigd", variant: "default" as const },
      cancelled: { label: "🚫 Geannuleerd", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // Check confirmation status
  const currentUserConfirmed = isRequester ? exchange.requester_confirmed : exchange.host_confirmed
  const otherUserConfirmed = isRequester ? exchange.host_confirmed : exchange.requester_confirmed
  const bothConfirmed = currentUserConfirmed && otherUserConfirmed

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (!exchange) return null

  const otherPersonName = isRequester ? exchange.host_name : exchange.requester_name

  return (
    <div id="exchange-chat" className="space-y-4">
      {/* Progress Indicator */}
      <SwapProgressIndicator
        exchange={exchange}
        currentUserId={currentUserId}
        isRequester={isRequester}
        isHost={isHost}
      />

      {/* Videocall Banner - Shows between progress and chat */}
      <VideocallBanner exchange={exchange} onStatusUpdate={onStatusUpdate} />

      {/* Videocall Scheduler - Show when in conversation */}
      {exchange.status === "accepted" && <VideocallScheduler exchange={exchange} onStatusUpdate={onStatusUpdate} />}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <EnhancedSwapConfirmationModal
          userName={isRequester ? exchange.requester_name || "" : exchange.host_name || ""}
          startDate={exchange.start_date}
          endDate={exchange.end_date}
          exchangeId={exchange.id}
          requesterName={exchange.requester_name || ""}
          hostName={exchange.host_name || ""}
          requesterHomeCity={exchange.requester_home_city || ""}
          hostHomeCity={exchange.host_home_city || ""}
          onClose={() => setShowConfirmationModal(false)}
        />
      )}

      {/* Chat Card */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <h3 className="font-medium">Chat met {otherPersonName}</h3>
          </div>

          <div ref={chatContainerRef} className="h-[400px] overflow-y-auto p-4">
            <MessageList messages={messages} currentUserId={session?.user?.id} />
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Typ een bericht..."
              className="min-h-[60px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
            <Button type="submit" size="icon" disabled={isLoading || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Congratulations Modal */}
      <SwapCongratulationsModal
        exchange={exchange}
        isOpen={showCongratulations}
        onClose={() => setShowCongratulations(false)}
      />
    </div>
  )
}

export default ExchangeChat
