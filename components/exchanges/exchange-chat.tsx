"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, CheckCircle, X, Ban, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
import { useSearchParams } from "next/navigation"
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
  const [localMessages, setLocalMessages] = useState(messages)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // Check for payment success in URL
  useEffect(() => {
    const payment = searchParams.get("payment")
    if (payment === "success") {
      setShowPaymentSuccess(true)
      toast({
        title: "Betaling geslaagd!",
        description: "Je betaling is verwerkt. De swap wordt bevestigd zodra beide partijen hebben betaald.",
      })
    }
  }, [searchParams, toast])

  // Update local messages when props change
  useEffect(() => {
    setLocalMessages(messages)
  }, [messages])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [localMessages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsSubmitting(true)

    // Get current user profile image
    const currentUserProfileImage = messages.find((msg) => msg.sender_id === currentUserId)?.sender_profile_image || ""

    // Optimistically add message to UI
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content: newMessage,
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
        body: JSON.stringify({ content: newMessage }),
      })

      if (response.ok) {
        const newMessage = await response.json()

        // Replace optimistic message with real one
        setLocalMessages((prev) => prev.map((msg) => (msg.id === optimisticMessage.id ? newMessage : msg)))

        toast({
          title: "Bericht verzonden",
          description: "Je bericht is succesvol verzonden.",
        })
      } else {
        // Remove optimistic message on error
        setLocalMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id))
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send message")
      }
    } catch (error: any) {
      // Remove optimistic message on error
      setLocalMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id))
      setNewMessage(newMessage) // Restore message text
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

  const handleConfirm = async () => {
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/confirm`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()

        if (data.free_swap) {
          // Free swap confirmed
          toast({
            title: data.both_confirmed ? "🎉 Swap Bevestigd!" : "✅ Bevestiging Geregistreerd",
            description: data.message,
          })
          onStatusUpdate()
        } else {
          // Redirect to Stripe
          if (data.checkout_url) {
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
        title: "Fout",
        description: error.message || "Er is een fout opgetreden bij het bevestigen van de swap.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "⏳ Nieuw/In behandeling", variant: "secondary" as const },
      accepted: { label: "✅ Geaccepteerd", variant: "default" as const },
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
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={exchange.requester_profile_image || "/placeholder.svg?height=40&width=40&query=user"}
                  alt={exchange.requester_name}
                />
                <AvatarFallback>{getInitials(exchange.requester_name || "")}</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-blue-900">{exchange.requester_name}</span>
            </div>
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

        {/* Betaling succes melding */}
        {showPaymentSuccess && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Betaling geslaagd!</span>
            </div>
            <p className="text-green-700 text-sm">
              Je betaling is succesvol verwerkt.{" "}
              {otherUserConfirmed
                ? "De swap is nu bevestigd!"
                : "We wachten nu op bevestiging van de andere gebruiker."}
            </p>
          </div>
        )}

        {/* Chat berichten */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
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
                      message.sender_id === currentUserId ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
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
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 text-sm font-medium mb-2">
                  ✓ Swap geaccepteerd! Nu moeten beide partijen de swap bevestigen.
                  <br />💝 Eerste swap is gratis voor nieuwe gebruikers!
                </p>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Jouw bevestiging:</span>
                    <span className={currentUserConfirmed ? "text-green-600 font-medium" : "text-orange-600"}>
                      {currentUserConfirmed ? "✓ Bevestigd" : "⏳ Nog te bevestigen"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Andere partij:</span>
                    <span className={otherUserConfirmed ? "text-green-600 font-medium" : "text-orange-600"}>
                      {otherUserConfirmed ? "✓ Bevestigd" : "⏳ Nog te bevestigen"}
                    </span>
                  </div>
                </div>
              </div>

              {!currentUserConfirmed && (
                <Button onClick={handleConfirm} className="w-full bg-green-600 hover:bg-green-700">
                  <Heart className="w-4 h-4 mr-2 text-pink-200" />
                  Bevestig Swap (Eerste swap gratis!)
                </Button>
              )}

              {currentUserConfirmed && !otherUserConfirmed && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-800 text-sm">
                    ✓ Je hebt de swap bevestigd! Wacht tot de andere partij ook bevestigt.
                  </p>
                </div>
              )}

              {bothConfirmed && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800 text-sm font-medium">
                    🎉 Beide partijen hebben bevestigd! De swap is nu definitief.
                  </p>
                </div>
              )}
            </div>
          )}

          {exchange.status === "confirmed" && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm font-medium">
                🎉 Swap bevestigd! Jullie kunnen nu de details uitwisselen en genieten van jullie huizenruil.
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
              placeholder={exchange.status === "confirmed" ? "Chat over jullie swap..." : "Typ je bericht..."}
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
