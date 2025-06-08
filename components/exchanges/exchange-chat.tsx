"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Exchange, Message, User } from "@/lib/types"
import { useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"
import { nl } from "date-fns/locale"
import { toast } from "sonner"
import { Send } from "lucide-react"

interface ExchangeChatProps {
  exchange: Exchange
  initialMessages: Message[]
  otherUser: User
}

export default function ExchangeChat({ exchange, initialMessages, otherUser }: ExchangeChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isApproving, setIsApproving] = useState(false)

  const isHost = session?.user?.id === exchange.hostId
  const isGuest = session?.user?.id === exchange.guestId

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Mark messages as read when component mounts
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!session?.user?.id) return

      try {
        await fetch(`/api/exchanges/${exchange.id}/messages/read`, {
          method: "POST",
        })
      } catch (error) {
        console.error("Error marking messages as read:", error)
      }
    }

    markMessagesAsRead()
  }, [exchange.id, session?.user?.id])

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch(`/api/exchanges/${exchange.id}/messages`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [exchange.id, session?.user?.id])

  const handleSendMessage = async (content: string = newMessage) => {
    if (!content.trim() || !session?.user?.id) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          senderId: session.user.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const newMessageData = await response.json()
      setMessages([...messages, newMessageData])
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const handleApproveExchange = async () => {
    if (!session?.user?.id) return

    setIsApproving(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/accept`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error approving exchange")
      }

      // Send a system message
      await handleSendMessage(
        "Je hebt goedgekeurd! ✓\nWacht tot de andere partij ook goedkeurt om de swap te bevestigen.",
      )

      // Refresh the page to update the exchange status
      window.location.reload()
    } catch (error: any) {
      console.error("Error approving exchange:", error)
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsApproving(false)
    }
  }

  const handleQuickReply = async (message: string) => {
    await handleSendMessage(message)
    setShowQuickReplies(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === session?.user?.id
          const isSystem = message.isSystemMessage

          return (
            <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  isSystem
                    ? "bg-gray-100 text-gray-700 text-center w-full"
                    : isCurrentUser
                      ? "bg-teal-600 text-white"
                      : "bg-gray-200 text-gray-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${isCurrentUser ? "text-teal-100" : "text-gray-500"}`}>
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: nl })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies for guest when exchange is pending */}
      {isGuest && exchange.status === "pending" && showQuickReplies && (
        <div className="p-4 bg-gray-50 space-y-2">
          <p className="text-sm font-medium text-gray-700">Snelle reacties:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleQuickReply(
                  "Hallo! Ik ben geïnteresseerd in een ruil met jouw woning. Laten we de details bespreken.",
                )
              }
              className="text-xs"
            >
              Interesse tonen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleQuickReply("Kun je me meer vertellen over de buurt en voorzieningen in de omgeving?")
              }
              className="text-xs"
            >
              Vraag over buurt
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickReply("Zijn de voorgestelde data flexibel of staan deze vast?")}
              className="text-xs"
            >
              Vraag over data
            </Button>
          </div>
        </div>
      )}

      {/* Host approval button when exchange is pending */}
      {isHost && exchange.status === "pending" && (
        <div className="p-4 bg-gray-50">
          <Button
            onClick={handleApproveExchange}
            className="w-full bg-teal-600 hover:bg-teal-700"
            disabled={isApproving}
          >
            {isApproving ? "Bezig met goedkeuren..." : "Goedkeuren"}
          </Button>
        </div>
      )}

      {/* Message input */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-center space-x-2"
        >
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type een bericht..."
            className="flex-1 min-h-[60px] max-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-teal-600 hover:bg-teal-700"
            disabled={isSending || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
