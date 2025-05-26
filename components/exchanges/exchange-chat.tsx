"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Video, CreditCard, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Exchange, Message } from "@/lib/types"

interface ExchangeChatProps {
  exchange: Exchange
  messages: Message[]
  currentUserId: string
  isRequester: boolean
  isHost: boolean
  onMessageSent: () => void
  onStatusUpdate: () => void
  isLoading: boolean
}

export function ExchangeChat({
  exchange,
  messages,
  currentUserId,
  isRequester,
  isHost,
  onMessageSent,
  onStatusUpdate,
  isLoading,
}: ExchangeChatProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      })

      if (response.ok) {
        setNewMessage("")
        onMessageSent()
        toast({
          title: "Bericht verzonden",
          description: "Je bericht is succesvol verzonden.",
        })
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verzenden van je bericht.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAccept = async () => {
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/accept`, {
        method: "POST",
      })
      if (response.ok) {
        toast({
          title: "Swap geaccepteerd!",
          description: "Je hebt de swap aanvraag geaccepteerd.",
        })
        onStatusUpdate()
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden.",
        variant: "destructive",
      })
    }
  }

  const handleScheduleVideocall = async () => {
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/videocall`, {
        method: "POST",
      })
      if (response.ok) {
        toast({
          title: "Videocall gepland!",
          description: "De videocall is automatisch gepland.",
        })
        onStatusUpdate()
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden.",
        variant: "destructive",
      })
    }
  }

  const handleCompleteVideocall = async () => {
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/videocall/complete`, {
        method: "POST",
      })
      if (response.ok) {
        toast({
          title: "Videocall voltooid!",
          description: "De videocall is gemarkeerd als voltooid.",
        })
        onStatusUpdate()
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden.",
        variant: "destructive",
      })
    }
  }

  const handleSkipVideocall = async () => {
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/skip-videocall`, {
        method: "POST",
      })
      if (response.ok) {
        toast({
          title: "Videocall overgeslagen",
          description: "Je kunt nu doorgaan naar de betaling.",
        })
        onStatusUpdate()
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden.",
        variant: "destructive",
      })
    }
  }

  const handlePayment = async () => {
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/payment`, {
        method: "POST",
      })
      if (response.ok) {
        const data = await response.json()
        // Redirect naar Stripe Checkout
        window.location.href = data.url
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het starten van de betaling.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "⏳ In afwachting", variant: "secondary" as const },
      accepted: { label: "✅ Geaccepteerd", variant: "default" as const },
      videocall_scheduled: { label: "📹 Videocall gepland", variant: "default" as const },
      videocall_completed: { label: "💰 Klaar voor betaling", variant: "default" as const },
      payment_pending: { label: "💳 Betaling vereist", variant: "destructive" as const },
      completed: { label: "🎉 Voltooid", variant: "default" as const },
      rejected: { label: "❌ Afgewezen", variant: "destructive" as const },
      cancelled: { label: "🚫 Geannuleerd", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Swap Conversatie</CardTitle>
          {getStatusBadge(exchange.status)}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Origineel swap bericht */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-blue-900">{exchange.requester_name}</span>
            <span className="text-sm text-blue-600">
              {format(new Date(exchange.created_at), "d MMM yyyy 'om' HH:mm", { locale: nl })}
            </span>
          </div>
          <p className="text-blue-800">{exchange.message}</p>
          <div className="mt-2 text-sm text-blue-600">
            📅 {format(new Date(exchange.start_date), "d MMM", { locale: nl })} -{" "}
            {format(new Date(exchange.end_date), "d MMM yyyy", { locale: nl })} • 👥 {exchange.guests} gasten
          </div>
        </div>

        {/* Chat berichten */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {isLoading ? (
            <div className="text-center text-gray-500">Berichten laden...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">Nog geen berichten</div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_id === currentUserId ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">{format(new Date(message.created_at), "HH:mm")}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mb-4">
          {exchange.status === "pending" && isHost && (
            <Button onClick={handleAccept} className="w-full bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Accepteer Swap
            </Button>
          )}

          {exchange.status === "accepted" && (
            <div className="space-y-2">
              <Button onClick={handleScheduleVideocall} className="w-full bg-purple-600 hover:bg-purple-700">
                <Video className="w-4 h-4 mr-2" />
                Plan Videocall (Aanbevolen)
              </Button>
              <Button
                onClick={handleSkipVideocall}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Videocall overslaan
              </Button>
              <p className="text-xs text-gray-500 text-center">
                💡 Een videocall helpt om elkaar beter te leren kennen
              </p>
            </div>
          )}

          {exchange.status === "videocall_scheduled" && (
            <Button onClick={handleCompleteVideocall} className="w-full bg-orange-600 hover:bg-orange-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Videocall Voltooid
            </Button>
          )}

          {exchange.status === "videocall_completed" && (
            <Button onClick={handlePayment} className="w-full bg-blue-600 hover:bg-blue-700">
              <CreditCard className="w-4 h-4 mr-2" />
              Betaal €20 Swap Fee
            </Button>
          )}
        </div>

        {/* Bericht invoer */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
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
      </CardContent>
    </Card>
  )
}
