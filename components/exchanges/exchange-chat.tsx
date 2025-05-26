"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Video, CreditCard, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Exchange, Message } from "@/lib/types"

interface ExchangeChatProps {
  exchange: Exchange
  isRequester: boolean
}

export function ExchangeChat({ exchange, isRequester }: ExchangeChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Laad berichten
  useEffect(() => {
    loadMessages()
  }, [exchange.id])

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      })

      if (response.ok) {
        setNewMessage("")
        loadMessages()
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon bericht niet verzenden",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (action: string) => {
    setIsLoading(true)
    try {
      let endpoint = ""
      const method = "POST"

      switch (action) {
        case "accept":
          endpoint = `/api/exchanges/${exchange.id}/accept`
          break
        case "videocall":
          endpoint = `/api/exchanges/${exchange.id}/videocall`
          break
        case "complete_videocall":
          endpoint = `/api/exchanges/${exchange.id}/videocall/complete`
          break
        case "payment":
          endpoint = `/api/exchanges/${exchange.id}/payment`
          break
      }

      const response = await fetch(endpoint, { method })

      if (response.ok) {
        const result = await response.json()

        if (action === "payment" && result.url) {
          window.location.href = result.url
        } else {
          toast({
            title: "Succes!",
            description: "Actie succesvol uitgevoerd",
          })
          // Reload page to update status
          window.location.reload()
        }
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Actie mislukt",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "videocall_scheduled":
        return "bg-purple-100 text-purple-800"
      case "videocall_completed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Swap Conversatie</h2>
          <Badge className={getStatusColor(exchange.status)}>{exchange.status}</Badge>
        </div>
      </div>

      {/* Original Message */}
      {exchange.message && (
        <div className="p-4 bg-blue-50 border-b">
          <div className="text-sm text-gray-600 mb-1">Origineel bericht:</div>
          <div className="text-sm">{exchange.message}</div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <div className="text-xs text-gray-500 mb-1">
              {message.sender_name} • {new Date(message.created_at).toLocaleString()}
            </div>
            <div className="bg-white p-3 rounded-lg border">{message.content}</div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex flex-wrap gap-2 mb-4">
          {exchange.status === "pending" && !isRequester && (
            <Button
              onClick={() => handleAction("accept")}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accepteren
            </Button>
          )}

          {exchange.status === "accepted" && (
            <Button
              onClick={() => handleAction("videocall")}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Video className="w-4 h-4 mr-2" />
              Plan Videocall
            </Button>
          )}

          {exchange.status === "videocall_scheduled" && (
            <Button
              onClick={() => handleAction("complete_videocall")}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Videocall Voltooid
            </Button>
          )}

          {exchange.status === "videocall_completed" && (
            <Button
              onClick={() => handleAction("payment")}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Betaal €20
            </Button>
          )}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Typ een bericht..."
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage} disabled={isLoading || !newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
