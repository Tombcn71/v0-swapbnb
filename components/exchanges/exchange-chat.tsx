"use client"
import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, CheckCircle, Loader2, UserCheck, ThumbsUp, ThumbsDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { SwapProgressIndicator } from "./swap-progress-indicator"
import { VideocallScheduler } from "./videocall-scheduler"
import type { Exchange, Message } from "@/lib/types"

interface ExchangeChatProps {
  exchange: Exchange
  initialMessages: Message[]
  otherUser: any
}

// Export as both named and default export
export function ExchangeChat({ exchange, initialMessages, otherUser }: ExchangeChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const isHost = exchange.host_id === exchange.current_user_id
  const canShowQuickReplies = isHost && exchange.status === "pending" && messages.length <= 1

  useEffect(() => {
    setShowQuickReplies(canShowQuickReplies)
  }, [canShowQuickReplies])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        const newMsg = await response.json()
        setMessages((prev) => [...prev, newMsg])
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickReply = async (content: string, accept: boolean) => {
    setActionLoading(accept ? "accept-quick" : "reject-quick")

    try {
      // Send message
      await sendMessage(content)

      // Update status
      const statusResponse = await fetch(`/api/exchanges/${exchange.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: accept ? "accepted" : "rejected" }),
      })

      if (statusResponse.ok) {
        toast({
          title: accept ? "🎉 Swap geaccepteerd!" : "❌ Swap afgewezen",
          description: accept ? "Jullie zijn nu in gesprek!" : "Je hebt de swap afgewezen.",
        })

        setShowQuickReplies(false)
        window.location.reload()
      }
    } catch (error: any) {
      toast({
        title: "❌ Fout",
        description: "Er is een fout opgetreden.",
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
        toast({
          title: data.both_confirmed ? "🎉 Swap Bevestigd!" : "✅ Goedkeuring Geregistreerd",
          description: data.message,
        })
        window.location.reload()
      }
    } catch (error: any) {
      toast({
        title: "❌ Fout",
        description: "Er is een fout opgetreden.",
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
      videocall_scheduled: { label: "📹 Videocall", variant: "default" as const },
      videocall_completed: { label: "✅ Kennismaking voltooid", variant: "default" as const },
      rejected: { label: "❌ Afgewezen", variant: "destructive" as const },
      confirmed: { label: "🎉 Bevestigd", variant: "default" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const currentUserConfirmed = isHost ? exchange.host_confirmed : exchange.requester_confirmed
  const bothConfirmed = exchange.requester_confirmed && exchange.host_confirmed

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <SwapProgressIndicator
        exchange={exchange}
        currentUserId={exchange.current_user_id}
        isRequester={!isHost}
        isHost={isHost}
      />

      {/* Videocall Scheduler - Show when in conversation */}
      {exchange.status === "accepted" && (
        <VideocallScheduler exchange={exchange} onStatusUpdate={() => window.location.reload()} />
      )}

      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Swap Conversatie</CardTitle>
            {getStatusBadge(exchange.status)}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0 p-4">
          {/* Origineel swap bericht */}
          <div className="mb-4 p-3 bg-teal-50 rounded-lg border-l-4 border-teal-500 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={exchange.requester_profile_image || "/placeholder.svg?height=40&width=40&query=user"}
                    alt={exchange.requester_name}
                  />
                  <AvatarFallback>{getInitials(exchange.requester_name || "")}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-teal-900 text-sm">{exchange.requester_name}</span>
              </div>
              <span className="text-xs text-teal-600">
                {format(new Date(exchange.created_at), "d MMM", { locale: nl })}
              </span>
            </div>
            <p className="text-teal-800 text-sm">{exchange.message}</p>
            <div className="mt-2 text-xs text-teal-600">
              📅 {format(new Date(exchange.start_date), "d MMM", { locale: nl })} -{" "}
              {format(new Date(exchange.end_date), "d MMM", { locale: nl })} • 👥 {exchange.guests} gasten
            </div>
          </div>

          {/* Quick Reply Buttons */}
          {showQuickReplies && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 flex-shrink-0">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Snelle reactie:</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() =>
                    handleQuickReply("Ja, laten we een swap bespreken! Ik ben geïnteresseerd in jouw voorstel.", true)
                  }
                  className="bg-green-600 hover:bg-green-700 text-white text-sm"
                  disabled={actionLoading === "accept-quick"}
                  size="sm"
                >
                  {actionLoading === "accept-quick" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-4 h-4 mr-2" />
                  )}
                  Ja, laten we praten
                </Button>

                <Button
                  onClick={() =>
                    handleQuickReply(
                      "Nee, helaas komen onze reisplannen niet overeen. Bedankt voor je interesse!",
                      false,
                    )
                  }
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50 text-sm"
                  disabled={actionLoading === "reject-quick"}
                  size="sm"
                >
                  {actionLoading === "reject-quick" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ThumbsDown className="w-4 h-4 mr-2" />
                  )}
                  Nee, geen match
                </Button>
              </div>
            </div>
          )}

          {/* Chat berichten */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === exchange.current_user_id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-2 max-w-[85%] sm:max-w-xs ${message.sender_id === exchange.current_user_id ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarImage
                      src={message.sender_profile_image || "/placeholder.svg?height=40&width=40&query=user"}
                      alt={message.sender_name || ""}
                    />
                    <AvatarFallback className="text-xs">{getInitials(message.sender_name || "")}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      message.sender_id === exchange.current_user_id
                        ? "bg-teal-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-75">{format(new Date(message.created_at), "HH:mm")}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Action Buttons */}
          {exchange.status === "videocall_completed" && !currentUserConfirmed && (
            <div className="mb-4 flex-shrink-0">
              <Button
                onClick={handleConfirm}
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={actionLoading === "confirm"}
              >
                {actionLoading === "confirm" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserCheck className="w-4 h-4 mr-2" />
                )}
                Bevestig Swap
              </Button>
            </div>
          )}

          {/* Both confirmed */}
          {bothConfirmed && (
            <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-md flex-shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-teal-600" />
                <span className="font-medium text-teal-800 text-sm">🎉 Swap bevestigd!</span>
              </div>
            </div>
          )}

          {/* Message Input */}
          {exchange.status !== "rejected" && exchange.status !== "cancelled" && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage(newMessage)
              }}
              className="flex gap-2 flex-shrink-0"
            >
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Typ je bericht..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !newMessage.trim()} size="icon">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Also export as default
export default ExchangeChat
