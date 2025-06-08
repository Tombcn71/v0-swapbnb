"use client"

import { useState } from "react"
import Image from "next/image"
import { format, differenceInDays } from "date-fns"
import { nl } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Bed, Calendar, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Exchange } from "@/lib/types"

interface ExchangeDetailsSidebarProps {
  exchange: Exchange
  isRequester: boolean
  isHost: boolean
  onStatusUpdate: () => void
}

export function ExchangeDetailsSidebar({ exchange, isRequester, isHost, onStatusUpdate }: ExchangeDetailsSidebarProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const { toast } = useToast()

  const displayHome = isRequester
    ? {
        title: exchange.host_home_title,
        city: exchange.host_home_city,
        images: exchange.host_home_images,
        address: exchange.host_home_address,
      }
    : {
        title: exchange.requester_home_title,
        city: exchange.requester_home_city,
        images: exchange.requester_home_images,
        address: exchange.requester_home_address,
      }

  const nights = differenceInDays(new Date(exchange.end_date), new Date(exchange.start_date))
  const images = typeof displayHome.images === "string" ? JSON.parse(displayHome.images) : displayHome.images || []

  const handleAcceptExchange = async () => {
    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      })

      if (!response.ok) {
        throw new Error("Failed to update exchange status")
      }

      toast({
        title: "Swap geaccepteerd!",
        description: "Je hebt de swap geaccepteerd.",
      })
      onStatusUpdate()
    } catch (error) {
      console.error("Error accepting exchange:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het accepteren van de swap.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleConfirmExchange = async () => {
    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/confirm`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to confirm exchange")
      }

      const data = await response.json()

      // If we get a checkout URL, redirect to Stripe
      if (data.url) {
        window.location.href = data.url
        return
      }

      toast({
        title: "Swap bevestigd!",
        description: "Je hebt de swap bevestigd.",
      })
      onStatusUpdate()
    } catch (error) {
      console.error("Error confirming exchange:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bevestigen van de swap.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleRejectExchange = async () => {
    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      })

      if (response.ok) {
        toast({
          title: "Swap afgewezen",
          description: "Je hebt de swap afgewezen.",
        })
        onStatusUpdate()
      }
    } catch (error) {
      console.error("Error rejecting exchange:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Property Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {isRequester ? "Jouw reis" : "De reis van " + exchange.requester_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative h-48 rounded-lg overflow-hidden">
            <Image
              src={images[0] || "/placeholder.svg?height=200&width=300&query=house"}
              alt={displayHome.title || "Huis"}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">{displayHome.title}</h3>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{displayHome.city}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trip Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Reis Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center text-gray-600 mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Aankomst</span>
              </div>
              <p className="text-sm">{format(new Date(exchange.start_date), "d MMM yyyy", { locale: nl })}</p>
            </div>
            <div>
              <div className="flex items-center text-gray-600 mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Vertrek</span>
              </div>
              <p className="text-sm">{format(new Date(exchange.end_date), "d MMM yyyy", { locale: nl })}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-gray-600" />
              <div>
                <span className="text-sm font-medium text-gray-600">Gasten</span>
                <p className="text-sm">{exchange.guests}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-2 text-gray-600" />
              <div>
                <span className="text-sm font-medium text-gray-600">Nachten</span>
                <p className="text-sm">{nights}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Swap Fee</span>
              <span className="font-semibold">1 credit</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Per persoon voor deze swap</p>
          </div>

          {/* Action Buttons */}
          {exchange.status === "pending" && isHost && (
            <div className="pt-4 space-y-2">
              <Button
                onClick={handleAcceptExchange}
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={isUpdatingStatus}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isUpdatingStatus ? "Bezig..." : "Goedkeuren"}
              </Button>
              <Button onClick={handleRejectExchange} variant="outline" className="w-full" disabled={isUpdatingStatus}>
                <XCircle className="w-4 h-4 mr-2" />
                Afwijzen
              </Button>
            </div>
          )}

          {exchange.status === "accepted" && (
            <div className="pt-4 space-y-2">
              <Button
                onClick={handleConfirmExchange}
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={isUpdatingStatus}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isUpdatingStatus ? "Bezig..." : "Bevestigen (1 credit)"}
              </Button>
              <Button onClick={handleRejectExchange} variant="outline" className="w-full" disabled={isUpdatingStatus}>
                <XCircle className="w-4 h-4 mr-2" />
                Annuleren
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
