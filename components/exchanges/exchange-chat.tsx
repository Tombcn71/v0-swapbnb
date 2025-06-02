"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, CheckCircle, X, Ban } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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

  // Debug logging
  useEffect(() => {
    console.log("Exchange Chat Props:", {
      exchangeId: exchange.id,
      status: exchange.status,
      currentUserId,
      isRequester,
      isHost,
      requesterId: exchange.requester_id,
      hostId: exchange.host_id,
    })
  }, [exchange, currentUserId, isRequester, isHost])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsSubmitting(true)
    try {
      console.log("Sending message to:", `/api/exchanges/${exchange.id}/messages`)
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
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send message")
      }
    } catch (error: any) {
      console.error("Error sending message:", error)
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden bij het verzenden van je bericht.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAccept = async () => {
    try {
      console.log("Accepting exchange:", exchange.id)
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
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to accept exchange")
      }
    } catch (error: any) {
      console.error("Error accepting exchange:", error)
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async () => {
    try {
      console.log("Rejecting exchange:", exchange.id)
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
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to reject exchange")
      }
    } catch (error: any) {
      console.error("Error rejecting exchange:", error)
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = async () => {
    try {
      console.log("Cancelling exchange:", exchange.id)
      const response = await fetch(`/api/exchanges/${exchange.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })

      if (response.ok) {
        toast({
          title: "Swap geannuleerd",
          description: "De swap is geannuleerd.",
        })
        onStatusUpdate()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to cancel exchange")
      }
    } catch (error: any) {
      console.error("Error cancelling exchange:", error)
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "⏳ Nieuw/In behandeling", variant: "secondary" as const },
      accepted: { label: "✅ Geaccepteerd", variant: "default" as const },
      rejected: { label: "❌ Afgewezen", variant: "destructive" as const },
      confirmed: { label: "✅ Bevestigd", variant: "default" as const },
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
            <div className="space-y-2">
              <Button onClick={handleAccept} className="w-full bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Accepteer Swap
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full border-red-600 text-red-600 hover:bg-red-50">
                    <X className="w-4 h-4 mr-2" />
                    Afwijzen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Swap afwijzen</AlertDialogTitle>
                    <AlertDialogDescription>
                      Weet je zeker dat je deze swap-aanvraag wilt afwijzen?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                      Afwijzen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {exchange.status === "pending" && isRequester && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Ban className="w-4 h-4 mr-2" />
                  Annuleren
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Swap annuleren</AlertDialogTitle>
                  <AlertDialogDescription>
                    Weet je zeker dat je deze swap-aanvraag wilt annuleren?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Terug</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
                    Annuleren
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {exchange.status === "accepted" && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">
                ✓ Swap geaccepteerd! Jullie kunnen nu de details bespreken en credits betalen om de swap te bevestigen.
              </p>
            </div>
          )}
        </div>

        {/* Bericht invoer - Altijd beschikbaar behalve bij rejected/cancelled */}
        {exchange.status !== "rejected" && exchange.status !== "cancelled" && (
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
        )}

        {/* Status berichten voor afgewezen/geannuleerd */}
        {exchange.status === "rejected" && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">❌ Deze swap is afgewezen.</p>
          </div>
        )}

        {exchange.status === "cancelled" && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-gray-800 text-sm">🚫 Deze swap is geannuleerd.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
