"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import type { Exchange, Home } from "@/lib/types"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ExchangeDetailsSidebarProps {
  exchange: Exchange
  guestHome: Home
  hostHome: Home
}

export default function ExchangeDetailsSidebar({ exchange, guestHome, hostHome }: ExchangeDetailsSidebarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isHost = session?.user?.id === exchange.hostId
  const isGuest = session?.user?.id === exchange.guestId
  const userRole = isHost ? "host" : "guest"

  const handleConfirmExchange = async () => {
    if (!session?.user?.id) return

    setIsConfirming(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          role: userRole,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error confirming exchange")
      }

      const data = await response.json()

      // If we have a checkout URL, redirect to it
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      toast.success("Swap bevestigd!")
      router.refresh()
    } catch (error: any) {
      console.error("Error confirming exchange:", error)
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsConfirming(false)
    }
  }

  const handleDeleteExchange = async () => {
    if (!confirm("Weet je zeker dat je deze ruil wilt annuleren?")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/delete`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error deleting exchange")
      }

      toast.success("Ruil geannuleerd")
      router.push("/exchanges")
    } catch (error: any) {
      console.error("Error deleting exchange:", error)
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  // Determine if the user can confirm
  const canConfirm =
    (isHost || isGuest) &&
    exchange.status === "approved" &&
    !(isHost ? exchange.hostConfirmed : exchange.guestConfirmed)

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <h3 className="font-semibold text-lg">Trip Details</h3>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">Check-in</p>
        <p className="font-medium">{formatDate(exchange.startDate)}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">Check-out</p>
        <p className="font-medium">{formatDate(exchange.endDate)}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">Guests</p>
        <p className="font-medium">{exchange.guestCount} guests</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">Homes</p>
        <div className="flex flex-col gap-2">
          <p className="font-medium">{isHost ? "Your home" : guestHome.title}</p>
          <p className="font-medium">↔️</p>
          <p className="font-medium">{isHost ? hostHome.title : "Your home"}</p>
        </div>
      </div>

      {canConfirm && (
        <Button
          onClick={handleConfirmExchange}
          className="w-full bg-teal-600 hover:bg-teal-700"
          disabled={isConfirming}
        >
          {isConfirming ? "Bezig met bevestigen..." : "Bevestig Swap"}
        </Button>
      )}

      {(isHost || isGuest) && exchange.status !== "completed" && (
        <Button
          onClick={handleDeleteExchange}
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
          disabled={isDeleting}
        >
          {isDeleting ? "Bezig met annuleren..." : "Annuleer Swap"}
        </Button>
      )}
    </div>
  )
}
