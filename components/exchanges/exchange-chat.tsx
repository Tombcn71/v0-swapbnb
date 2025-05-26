"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Send, Video, CreditCard, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { nl } from "date-fns/locale"
import type { Exchange } from "@/lib/types"

interface ExchangeChatProps {
  exchange: Exchange
  isRequester: boolean
}

interface ChatMessage {
  id: string
  sender_id: string
  sender_name: string
  content: string
  message_type: "text" | "system" | "action"
  created_at: string
}

export function ExchangeChat({ exchange, isRequester }: ExchangeChatProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Laad chat berichten
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          message_type: "text",
        }),
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages()
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
      let body = {}

      switch (action) {
        case "accept":
          endpoint = `/api/exchanges/${exchange.id}/accept`
          break
        case "reject":
          endpoint = `/api/exchanges/${exchange.id}/reject`
          break
        case "schedule_videocall":
          endpoint = `/api/exchanges/${exchange.id}/videocall`
          body = { scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }
          break
        case "complete_videocall":
          endpoint = `/api/exchanges/${exchange.id}/videocall/complete`
          break
        case "pay":
          endpoint = `/api/exchanges/${exchange.id}/payment`
          break
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        toast({
          title: "Actie voltooid",
          description: "De actie is succesvol uitgevoerd",
        })
        fetchMessages()
        window.location.reload() // Refresh voor nieuwe status
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon actie niet uitvoeren",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    switch (exchange.status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Wacht op antwoord</Badge>
      case "accepted":
        return <Badge className="bg-blue-100 text-blue-800">✓ Geaccepteerd</Badge>
      case "videocall_scheduled":
        return <Badge className="bg-purple-100 text-purple-800">📹 Videocall gepland</Badge>
      case "videocall_completed":
        return <Badge className="bg-green-100 text-green-800">✓ Videocall voltooid</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">🎉 Voltooid</Badge>
      default:
        return <Badge>{exchange.status}</Badge>
    }
  }

  const getActionButtons = () => {
    const buttons = []

    // Host acties
    if (!isRequester && exchange.status === "pending") {
      buttons.push(
        <Button key="accept" onClick={() => handleAction("accept")} className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="mr-2 h-4 w-4" />
          Accepteren
        </Button>,
      )
    }

    // Videocall acties
    if (exchange.status === "accepted") {
      buttons.push(
        <Button
          key="videocall"
          onClick={() => handleAction("schedule_videocall")}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Video className="mr-2 h-4 w-4" />
          Plan Videocall
        </Button>,
      )
    }

    if (exchange.status === "videocall_scheduled") {
      buttons.push(
        <Button
          key="complete"
          onClick={() => handleAction("complete_videocall")}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Videocall Voltooid
        </Button>,
      )
    }

    // Betaling
    if (exchange.status === "videocall_completed") {
      buttons.push(
        <Button key="pay" onClick={() => handleAction("pay")} className="bg-orange-600 hover:bg-orange-700">
          <CreditCard className="mr-2 h-4 w-4" />
          Betaal €20
        </Button>,
      )
    }

    return buttons
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage
                src={`/placeholder.svg?height=40&width=40&query=${isRequester ? exchange.host_name : exchange.requester_name}`}
              />
              <AvatarFallback>{(isRequester ? exchange.host_name : exchange.requester_name)?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{isRequester ? exchange.host_name : exchange.requester_name}</h3>
              <p className="text-sm text-gray-600">Swap gesprek</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Systeem bericht */}
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <p className="text-blue-800 text-sm">
            Swap aanvraag voor {new Date(exchange.start_date).toLocaleDateString("nl-NL")} -{" "}
            {new Date(exchange.end_date).toLocaleDateString("nl-NL")}
          </p>
        </div>

        {/* Origineel bericht */}
        <div className="flex space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{exchange.requester_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm">{exchange.message}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(new Date(exchange.created_at), { addSuffix: true, locale: nl })}
            </p>
          </div>
        </div>

        {/* Chat berichten */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex space-x-3 ${message.sender_id === session?.user?.id ? "flex-row-reverse space-x-reverse" : ""}`}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>{message.sender_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 max-w-xs">
              <div
                className={`p-3 rounded-lg ${message.sender_id === session?.user?.id ? "bg-blue-500 text-white" : "bg-gray-100"}`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: nl })}
              </p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Action Buttons */}
      {getActionButtons().length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex flex-wrap gap-2">{getActionButtons()}</div>
        </div>
      )}

      {/* Chat Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Typ een bericht..."
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage} disabled={isLoading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
