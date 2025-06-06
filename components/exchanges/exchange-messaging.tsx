"use client"
import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, CheckCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { Exchange, Message } from "@/lib/types"

interface ExchangeMessagingProps {
  exchange: Exchange
  messages: Message[]
  currentUserId: string
  isRequester: boolean
  isHost: boolean
  onMessageSent: () => void
  onStatusUpdate: () => void
  isLoading: boolean
}

export function ExchangeMessaging({
  exchange,
  messages,
  currentUserId,
  isRequester,
  isHost,
  onMessageSent,
  onStatusUpdate,
  isLoading,
}: ExchangeMessagingProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localMessages, setLocalMessages] = useState(messages)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    setLocalMessages(messages)
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [localMessages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    setIsSubmitting(true)

    const currentUserProfileImage = messages.find((msg) => msg.sender_id === currentUserId)?.sender_profile_image || ""

    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content: content,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      exchange_id: exchange.id,
      receiver_id: isRequester ? exchange.host_id : exchange.requester_id,
      message_type: "text" as const,
      sender_name: isRequester ? exchange.requester_name : exchange.host_name,
      sender_profile_image: currentUserProfileImage,
    }

    setLocalMessages((prev) => [...prev, optimisticMessage])
    setNewMessage("")

    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        const newMessage = await response.json()
        setLocalMessages((prev) => prev.map((msg) => (msg.id === optimisticMessage.id ? newMessage : msg)))
        onMessageSent()
      } else {
        setLocalMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id))
        throw new Error("Failed to send message")
      }
    } catch (error: any) {
      setLocalMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id))
      setNewMessage(content)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verzenden van je bericht.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickReply = (message: string) => {
    handleSendMessage(message)
  }

  const handleAccept = async () => {
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      })

      if (response.ok) {
        toast({
          title: "Swap geaccepteerd!",
          description: "Je hebt de swap aanvraag geaccepteerd.",
        })
        onStatusUpdate()
      }
    } catch (error: any) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async () => {
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      })

      if (response.ok) {
        toast({
          title: "Swap afgewezen",
          description: "Je hebt de swap aanvraag afgewezen.",
        })
        onStatusUpdate()
      }
    } catch (error: any) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden.",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "⏳ Nieuw verzoek", variant: "secondary" as const },
      accepted: { label: "✅ Geaccepteerd", variant: "default" as const },
      rejected: { label: "❌ Afgewezen", variant: "destructive" as const },
      confirmed: { label: "🎉 Bevestigd", variant: "default" as const },
      cancelled: { label: "🚫 Geannuleerd", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const otherUserName = isRequester ? exchange.host_name : exchange.requester_name

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={
                  isRequester
                    ? exchange.host_profile_image
                    : exchange.requester_profile_image || "/placeholder.svg?height=40&width=40&query=user"
                }
                alt={otherUserName}
              />
              <AvatarFallback>{getInitials(otherUserName || "")}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-gray-900">{otherUserName}</h1>
              <p className="text-sm text-gray-600">
                {isRequester ? exchange.host_home_city : exchange.requester_home_city}
              </p>
            </div>
          </div>
          {getStatusBadge(exchange.status)}
        </div>
      </div>

      {/* Original Swap Request */}
      <div className="p-4 bg-blue-50 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={exchange.requester_profile_image || "/placeholder.svg?height=40&width=40&query=user"}
              alt={exchange.requester_name}
            />
            <AvatarFallback>{getInitials(exchange.requester_name || "")}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-blue-900">{exchange.requester_name}</span>
          <span className="text-sm text-blue-600">
            {format(new Date(exchange.created_at), "d MMM yyyy 'om' HH:mm", { locale: nl })}
          </span>
        </div>
        <p className="text-blue-800 mb-2">{exchange.message}</p>
        <div className="text-sm text-blue-600">
          📅 {format(new Date(exchange.start_date), "d MMM", { locale: nl })} -{" "}
          {format(new Date(exchange.end_date), "d MMM yyyy", { locale: nl })} • 👥 {exchange.guests} gasten
        </div>
      </div>

      {/* Quick Reply Options for Pending Requests */}
      {exchange.status === "pending" && isHost && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Snelle reacties:</p>
          <div className="space-y-2">
            <Button
              onClick={() => handleQuickReply("Ja, laten we de details bespreken!")}
              className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              ✅ Ja, laten we de details bespreken
            </Button>
            <Button
              onClick={() => handleQuickReply("Laten we kijken of we een ruil kunnen regelen.")}
              className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              🤝 Laten we kijken of we een ruil kunnen regelen
            </Button>
            <Button
              onClick={() => handleQuickReply("Nee, helaas komen onze plannen niet overeen.")}
              className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              ❌ Nee, onze plannen komen niet overeen
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500">Berichten laden...</div>
        ) : localMessages.length === 0 ? (
          <div className="text-center text-gray-500">Nog geen berichten</div>
        ) : (
          localMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-2 max-w-xs lg:max-w-md ${message.sender_id === currentUserId ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={message.sender_profile_image || "/placeholder.svg?height=40&width=40&query=user"}
                    alt={message.sender_name || ""}
                  />
                  <AvatarFallback>{getInitials(message.sender_name || "")}</AvatarFallback>
                </Avatar>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.sender_id === currentUserId ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">{format(new Date(message.created_at), "HH:mm")}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Action Buttons */}
      {exchange.status === "pending" && isHost && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <Button onClick={handleAccept} className="flex-1 bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Accepteren
            </Button>
            <Button
              onClick={handleReject}
              variant="outline"
              className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Afwijzen
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      {exchange.status !== "rejected" && exchange.status !== "cancelled" && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage(newMessage)
            }}
            className="flex gap-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Typ je bericht..."
              disabled={isSubmitting}
              className="flex-1"
            />
            <Button type="submit" disabled={isSubmitting || !newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
