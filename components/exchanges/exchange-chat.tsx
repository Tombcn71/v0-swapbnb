"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, Calendar, MapPin, Users, Home } from "lucide-react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { SwapProgressIndicator } from "./swap-progress-indicator"
import { EnhancedSwapConfirmationModal } from "./enhanced-swap-confirmation-modal"

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  name: string
  profile_image?: string
  is_quick_reply?: boolean
}

interface ExchangeChatProps {
  exchange: any
  initialMessages: Message[]
  otherUser: any
}

export default function ExchangeChat({ exchange, initialMessages, otherUser }: ExchangeChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isHost = exchange.host_id === exchange.current_user_id
  const canShowQuickReplies = isHost && exchange.status === "pending" && messages.length <= 1

  useEffect(() => {
    setShowQuickReplies(canShowQuickReplies)
  }, [canShowQuickReplies])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (content: string, isQuickReply = false) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, is_quick_reply: isQuickReply }),
      })

      if (response.ok) {
        const newMsg = await response.json()
        setMessages((prev) => [...prev, newMsg])
        setNewMessage("")

        if (isQuickReply) {
          setShowQuickReplies(false)

          // Als het "Ja, laten we praten" is, update de exchange status
          if (content.includes("Ja, laten we praten")) {
            // Refresh de pagina om de nieuwe status te tonen
            window.location.reload()
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptExchange = async () => {
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/accept`, {
        method: "POST",
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Error accepting exchange:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "In afwachting", color: "bg-yellow-100 text-yellow-800" },
      accepted: { label: "Geaccepteerd", color: "bg-teal-100 text-teal-800" },
      confirmed: { label: "Bevestigd", color: "bg-green-100 text-green-800" },
      completed: { label: "Voltooid", color: "bg-blue-100 text-blue-800" },
      rejected: { label: "Afgewezen", color: "bg-red-100 text-red-800" },
      cancelled: { label: "Geannuleerd", color: "bg-gray-100 text-gray-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header met exchange details */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={otherUser?.profile_image || "/placeholder.svg?height=48&width=48&query=user"} />
                <AvatarFallback>{otherUser?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{otherUser?.name}</CardTitle>
                <p className="text-sm text-gray-600">{otherUser?.city}</p>
              </div>
            </div>
            {getStatusBadge(exchange.status)}
          </div>
        </CardHeader>

        <CardContent>
          {/* Progress Indicator */}
          <SwapProgressIndicator exchange={exchange} />

          {/* Exchange Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Home className="h-4 w-4" />
                <span>{isHost ? exchange.requester_home_title : exchange.host_home_title}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{isHost ? exchange.requester_home_city : exchange.host_home_city}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(exchange.start_date), "d MMM", { locale: nl })} -{" "}
                  {format(new Date(exchange.end_date), "d MMM yyyy", { locale: nl })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{exchange.guests} gasten</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-4">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender_id === exchange.current_user_id ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender_id !== exchange.current_user_id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.profile_image || "/placeholder.svg?height=32&width=32&query=user"} />
                    <AvatarFallback>{message.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_id === exchange.current_user_id
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender_id === exchange.current_user_id ? "text-teal-100" : "text-gray-500"
                    }`}
                  >
                    {format(new Date(message.created_at), "HH:mm", { locale: nl })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies voor Host */}
          {showQuickReplies && (
            <div className="mb-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
              <p className="text-sm text-teal-800 mb-3">Snelle reacties:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-teal-300 text-teal-700 hover:bg-teal-100"
                  onClick={() => sendMessage("Ja, laten we praten! Ik ben geïnteresseerd in deze swap.", true)}
                  disabled={isLoading}
                >
                  ✅ Ja, laten we praten
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                  onClick={() => sendMessage("Bedankt voor je interesse, maar deze data komen niet uit.", true)}
                  disabled={isLoading}
                >
                  ❌ Nee, helaas niet
                </Button>
              </div>
            </div>
          )}

          {/* Goedkeuren knop voor Host na quick replies */}
          {isHost && exchange.status === "accepted" && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Klaar om de swap goed te keuren?</p>
                  <p className="text-xs text-green-600">Na goedkeuring kunnen beide partijen de swap bevestigen.</p>
                </div>
                <Button onClick={handleAcceptExchange} className="bg-green-600 hover:bg-green-700 text-white">
                  Goedkeuren
                </Button>
              </div>
            </div>
          )}

          {/* Bevestig knop voor beide partijen */}
          {exchange.status === "accepted" && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Swap bevestigen</p>
                  <p className="text-xs text-blue-600">Bevestig je deelname aan deze swap.</p>
                </div>
                <Button onClick={() => setShowConfirmModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Bevestigen
                </Button>
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Typ je bericht..."
              className="flex-1 min-h-[40px] max-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(newMessage)
                }
              }}
            />
            <Button
              onClick={() => sendMessage(newMessage)}
              disabled={!newMessage.trim() || isLoading}
              size="icon"
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <EnhancedSwapConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        exchange={exchange}
      />
    </div>
  )
}

// Also export as named export for compatibility
export { ExchangeChat }
