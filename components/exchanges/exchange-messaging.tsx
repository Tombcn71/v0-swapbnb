"use client"

import { useState } from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, CheckCircle, XCircle } from "lucide-react"
import type { Exchange } from "@/lib/types"

interface ExchangeMessagingProps {
  exchange: Exchange
  messages: any[]
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
  const [isSending, setIsSending] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || newMessage.trim()
    if (!messageContent || isSending) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      })

      if (response.ok) {
        if (!content) setNewMessage("") // Only clear if it's from the input field
        onMessageSent()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const otherUser = isRequester
    ? { name: exchange.host_name, image: exchange.host_profile_image }
    : { name: exchange.requester_name, image: exchange.requester_profile_image }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={otherUser.image || "/placeholder.svg?height=40&width=40&query=user"}
              alt={otherUser.name}
            />
            <AvatarFallback>{getInitials(otherUser.name || "")}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900">{otherUser.name}</h2>
            <p className="text-sm text-gray-600">
              {exchange.status === "pending" && "Wacht op reactie"}
              {exchange.status === "accepted" && "Geaccepteerd"}
              {exchange.status === "confirmed" && "Bevestigd"}
              {exchange.status === "rejected" && "Afgewezen"}
            </p>
          </div>
        </div>
      </div>

      {/* Original Request */}
      {exchange.message && (
        <div className="p-4 bg-amber-50 border-b border-amber-200">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={exchange.requester_profile_image || "/placeholder.svg?height=32&width=32&query=user"}
                alt={exchange.requester_name}
              />
              <AvatarFallback className="text-xs">{getInitials(exchange.requester_name || "")}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{exchange.requester_name}</span>
                <span className="text-xs text-gray-500">Oorspronkelijk verzoek</span>
              </div>
              <p className="text-sm text-gray-700">{exchange.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reply Options for Pending Requests */}
      {exchange.status === "pending" && isHost && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <h3 className="font-medium text-sm text-blue-900 mb-3">Snelle reacties:</h3>
          <div className="space-y-2">
            <Button
              onClick={() => handleSendMessage("Ja, laten we de details bespreken!")}
              variant="outline"
              size="sm"
              className="w-full justify-start text-left h-auto py-2 px-3"
              disabled={isSending}
            >
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Ja, laten we de details bespreken
            </Button>
            <Button
              onClick={() => handleSendMessage("Nee, onze plannen komen helaas niet overeen.")}
              variant="outline"
              size="sm"
              className="w-full justify-start text-left h-auto py-2 px-3"
              disabled={isSending}
            >
              <XCircle className="h-4 w-4 mr-2 text-red-600" />
              Nee, onze plannen komen niet overeen
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">
            <p>Berichten laden...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Nog geen berichten</p>
          </div>
        ) : (
          messages.map((message: any) => {
            const isOwnMessage = message.sender_id === currentUserId
            return (
              <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-xs lg:max-w-md ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={message.sender_profile_image || "/placeholder.svg?height=32&width=32&query=user"}
                      alt={message.sender_name}
                    />
                    <AvatarFallback className="text-xs">{getInitials(message.sender_name || "")}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      isOwnMessage ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwnMessage ? "text-teal-100" : "text-gray-500"}`}>
                      {format(new Date(message.created_at), "HH:mm", { locale: nl })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Message Input - Always available for communication */}
      {(exchange.status === "pending" || exchange.status === "accepted" || exchange.status === "confirmed") && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Typ je bericht..."
              className="flex-1 min-h-[40px] max-h-[120px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button onClick={() => handleSendMessage()} disabled={!newMessage.trim() || isSending} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
