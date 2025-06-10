"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, CheckCircle, X, Ban, Loader2, UserCheck, ThumbsUp, ThumbsDown } from "lucide-react"
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
import { SwapProgressIndicator } from "./swap-progress-indicator"
import { EnhancedSwapConfirmationModal } from "./enhanced-swap-confirmation-modal"
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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // Check for payment success in URL
  useEffect(() => {
    const payment = searchParams.get("payment")
    if (payment === "success") {
      setShowPaymentSuccess(true)
      toast({
        title: "Betaling geslaagd! 💳",
        description: "Je betaling is verwerkt. De swap wordt bevestigd zodra beide partijen hebben betaald.",
      })
    }
  }, [searchParams, toast])

  // Check if swap is newly confirmed and show modal
  useEffect(() => {
    const bothConfirmed = exchange.requester_confirmed && exchange.host_confirmed
    const shownConfirmations = JSON.parse(localStorage.getItem("shownSwapConfirmations") || "[]")

    if (bothConfirmed && !shownConfirmations.includes(exchange.id)) {
      setShowConfirmationModal(true)
    }
  }, [exchange])

  // Determine if quick replies should be shown
  useEffect(() => {
    // Show quick replies only for host when status is pending and no messages have been sent yet
    const shouldShowQuickReplies =
      isHost && exchange.status === "pending" && messages.filter((m) => m.sender_id === currentUserId).length === 0

    setShowQuickReplies(shouldShowQuickReplies)
  }, [isHost, exchange.status, messages, currentUserId])

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
      is_quick_reply: false,
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
        setLocalMessages((prev) => prev.map((msg) => (msg.id === optimisticMessage.id ? newMessage : msg)))

        toast({
          title: "✅ Bericht verzonden",
          description: "Je bericht is succesvol verzonden.",
        })

        onMessageSent()
      } else {
        setLocalMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id))
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send message")
      }
    } catch (error: any) {
      setLocalMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id))
      setNewMessage(newMessage)
      console.error("Error sending message:", error)
      toast({
        title: "❌ Fout",
        description: error.message || "Er is een fout opgetreden bij het verzenden van je bericht.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickReply = async (content: string, accept: boolean) => {
    setActionLoading(accept ? "accept-quick" : "reject-quick")

    try {
      // Send the quick reply message
      const messageResponse = await fetch(`/api/exchanges/${exchange.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          is_quick_reply: true,
        }),
      })

      if (!messageResponse.ok) {
        const errorData = await messageResponse.json()
        throw new Error(errorData.error || "Failed to send quick reply")
      }

      const newMessage = await messageResponse.json()
      setLocalMessages((prev) => [...prev, newMessage])

      // If accepting, update the exchange status
      if (accept) {
        const statusResponse = await fetch(`/api/exchanges/${exchange.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "accepted" }),
        })

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json()
          throw new Error(errorData.error || "Failed to update exchange status")
        }

        toast({
          title: "🎉 Swap geaccepteerd!",
          description: "Je hebt de swap aanvraag geaccepteerd. Nu kunnen beide partijen goedkeuren.",
        })

        onStatusUpdate()
      } else {
        // If rejecting, update the exchange status to rejected
        const statusResponse = await fetch(`/api/exchanges/${exchange.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "rejected" }),
        })

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json()
          throw new Error(errorData.error || "Failed to update exchange status")
        }

        toast({
          title: "❌ Swap afgewezen",
          description: "Je hebt de swap aanvraag afgewezen.",
        })

        onStatusUpdate()
      }

      // Hide quick replies after using one
      setShowQuickReplies(false)
    } catch (error: any) {
      console.error("Error with quick reply:", error)
      toast({
        title: "❌ Fout",
        description: error.message || "Er is een fout opgetreden.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleAccept = async () => {
    setActionLoading("accept")
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      })

      if (response.ok) {
        toast({
          title: "🎉 Swap geaccepteerd!",
          description: "Je hebt de swap aanvraag geaccepteerd. Nu kunnen beide partijen goedkeuren.",
        })
        onStatusUpdate()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to accept exchange")
      }
    } catch (error: any) {
      console.error("Error accepting exchange:", error)
      toast({
        title: "❌ Fout",
        description: error.message || "Er is een fout opgetreden.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    setActionLoading("reject")
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      })

      if (response.ok) {
        toast({
          title: "❌ Swap afgewezen",
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
        title: "❌ Fout",
        description: error.message || "Er is een fout opgetreden.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async () => {
    setActionLoading("cancel")
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })

      if (response.ok) {
        toast({
          title: "🚫 Swap geannuleerd",
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
        title: "❌ Fout",
        description: error.message || "Er is een fout opgetreden.",
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

        if (data.free_swap) {
          toast({
            title: data.both_confirmed ? "🎉 Swap Bevestigd!" : "✅ Goedkeuring Geregistreerd",
            description: data.message,
          })
          onStatusUpdate()
        } else {
          if (data.checkout_url) {
            toast({
              title: "💳 Doorverwijzen naar betaling...",
              description: "Je wordt doorgestuurd naar de betaalpagina.",
            })
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
        title: "❌ Fout",
        description: error.message || "Er is een fout opgetreden bij het goedkeuren van de swap.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteExchange = async () => {
    setActionLoading("delete")
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/delete`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "🗑️ Swap verwijderd",
          description: "De swap is verwijderd uit je berichten.",
        })
        // Redirect to exchanges overview
        window.location.href = "/exchanges"
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete exchange")
      }
    } catch (error: any) {
      console.error("Error deleting exchange:", error)
      toast({
        title: "❌ Fout",
        description: error.message || "Er is een fout opgetreden bij het verwijderen van de swap.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "⏳ In behandeling", variant: "secondary" as const },
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

  // Determine current stage and button text
  const getCurrentStage = () => {
    if (exchange.status === "pending") {
      return "pending" // Wachten op host acceptatie
    }
    if (exchange.status === "accepted") {
      return "confirm" // Host heeft geaccepteerd, nu kunnen beide partijen bevestigen
    }
    if (bothConfirmed) {
      return "confirmed" // Beide hebben bevestigd
    }
    return "pending"
  }

  const currentStage = getCurrentStage()

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
    <div className="space-y-4">
      {/* Progress Indicator */}
      <SwapProgressIndicator
        exchange={exchange}
        currentUserId={currentUserId}
        isRequester={isRequester}
        isHost={isHost}
      />

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <EnhancedSwapConfirmationModal
          userName={isRequester ? exchange.requester_name || "" : exchange.host_name || ""}
          startDate={exchange.start_date}
          endDate={exchange.end_date}
          exchangeId={exchange.id}
          requesterName={exchange.requester_name || ""}
          hostName={exchange.host_name || ""}
          requesterHomeCity={exchange.requester_home_city || ""}
          hostHomeCity={exchange.host_home_city || ""}
          onClose={() => setShowConfirmationModal(false)}
        />
      )}

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Swap Conversatie</CardTitle>
            {getStatusBadge(exchange.status)}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Origineel swap bericht */}
          <div className="mb-4 p-4 bg-teal-50 rounded-lg border-l-4 border-teal-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={exchange.requester_profile_image || "/placeholder.svg?height=40&width=40&query=user"}
                    alt={exchange.requester_name}
                  />
                  <AvatarFallback>{getInitials(exchange.requester_name || "")}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-teal-900">{exchange.requester_name}</span>
              </div>
              <span className="text-sm text-teal-600">
                {format(new Date(exchange.created_at), "d MMM yyyy 'om' HH:mm", { locale: nl })}
              </span>
            </div>
            <p className="text-teal-800">{exchange.message}</p>
            <div className="mt-2 text-sm text-teal-600">
              📅 {format(new Date(exchange.start_date), "d MMM", { locale: nl })} -{" "}
              {format(new Date(exchange.end_date), "d MMM yyyy", { locale: nl })} • 👥 {exchange.guests} gasten
            </div>
          </div>

          {/* Quick Reply Buttons - Alleen voor host bij pending status */}
          {showQuickReplies && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Snelle reactie:</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    handleQuickReply("Ja, laten we een swap bespreken! Ik ben geïnteresseerd in jouw voorstel.", true)
                  }
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={actionLoading === "accept-quick"}
                >
                  {actionLoading === "accept-quick" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-4 h-4 mr-2" />
                  )}
                  Ja, laten we een swap bespreken
                </Button>

                <Button
                  onClick={() =>
                    handleQuickReply(
                      "Nee, helaas komen onze reisplannen niet overeen. Bedankt voor je interesse!",
                      false,
                    )
                  }
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  disabled={actionLoading === "reject-quick"}
                >
                  {actionLoading === "reject-quick" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ThumbsDown className="w-4 h-4 mr-2" />
                  )}
                  Nee, helaas geen match
                </Button>
              </div>
            </div>
          )}

          {/* Betaling succes melding */}
          {showPaymentSuccess && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200 animate-pulse">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Betaling geslaagd! 💳</span>
              </div>
              <p className="text-green-700 text-sm">
                Je betaling is succesvol verwerkt.{" "}
                {otherUserConfirmed
                  ? "De swap is nu bevestigd!"
                  : "We wachten nu op goedkeuring van de andere gebruiker."}
              </p>
            </div>
          )}

          {/* Chat berichten */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {isLoading ? (
              <div className="text-center text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Berichten laden...
              </div>
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
                        message.sender_id === currentUserId
                          ? "bg-teal-500 text-white"
                          : message.is_quick_reply
                            ? "bg-blue-100 text-blue-900 border border-blue-200"
                            : "bg-gray-200 text-gray-900"
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
            {exchange.status === "pending" && isHost && !showQuickReplies && (
              <div className="space-y-2">
                <Button
                  onClick={handleAccept}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={actionLoading === "accept"}
                >
                  {actionLoading === "accept" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Accepteer Swap
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-red-600 text-red-600 hover:bg-red-50"
                      disabled={actionLoading === "reject"}
                    >
                      {actionLoading === "reject" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <X className="w-4 h-4 mr-2" />
                      )}
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
                  <Button variant="outline" className="w-full" disabled={actionLoading === "cancel"}>
                    {actionLoading === "cancel" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Ban className="w-4 h-4 mr-2" />
                    )}
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

            {/* Confirm stage - when swap is accepted, both parties can confirm */}
            {exchange.status === "accepted" && !currentUserConfirmed && (
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
                Bevestig Swap (Eerste swap gratis!)
              </Button>
            )}

            {/* Waiting for other party to confirm */}
            {exchange.status === "accepted" && currentUserConfirmed && !otherUserConfirmed && (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-teal-600" />
                  <span className="font-medium text-teal-800">Je hebt bevestigd! ✓</span>
                </div>
                <p className="text-teal-700 text-sm">
                  Wacht tot de andere partij ook bevestigt om de swap definitief te maken.
                </p>
              </div>
            )}

            {/* Both confirmed */}
            {bothConfirmed && (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-teal-600" />
                  <span className="font-medium text-teal-800">🎉 Swap bevestigd!</span>
                </div>
                <p className="text-teal-700 text-sm">
                  Beide partijen hebben goedgekeurd! Jullie swap is nu definitief. Geniet ervan!
                </p>
              </div>
            )}

            {/* Delete option voor rejected swaps */}
            {(exchange.status === "rejected" || exchange.status === "cancelled") && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50"
                    disabled={actionLoading === "delete"}
                  >
                    {actionLoading === "delete" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Ban className="w-4 h-4 mr-2" />
                    )}
                    Verwijder uit berichten
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Swap verwijderen</AlertDialogTitle>
                    <AlertDialogDescription>
                      Weet je zeker dat je deze swap wilt verwijderen uit je berichten?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteExchange} className="bg-red-600 hover:bg-red-700">
                      Verwijderen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
    </div>
  )
}

export default ExchangeChat
