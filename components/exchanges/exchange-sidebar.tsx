"use client"

import Image from "next/image"
import { format, differenceInDays } from "date-fns"
import { nl } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Bed } from "lucide-react"
import type { Exchange } from "@/lib/types"

interface ExchangeSidebarProps {
  exchange: Exchange
  isRequester: boolean
  isHost: boolean
}

export function ExchangeSidebar({ exchange, isRequester, isHost }: ExchangeSidebarProps) {
  // Bepaal welk huis we tonen (het andere huis dan dat van de huidige gebruiker)
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

  // Bereken aantal nachten
  const nights = differenceInDays(new Date(exchange.end_date), new Date(exchange.start_date))

  // Parse images als het een string is
  const images = typeof displayHome.images === "string" ? JSON.parse(displayHome.images) : displayHome.images || []

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "In afwachting", variant: "secondary" as const },
      accepted: { label: "Geaccepteerd", variant: "default" as const },
      videocall_scheduled: { label: "Videocall gepland", variant: "default" as const },
      videocall_completed: { label: "Videocall voltooid", variant: "default" as const },
      payment_pending: { label: "Betaling vereist", variant: "destructive" as const },
      completed: { label: "Voltooid", variant: "default" as const },
      rejected: { label: "Afgewezen", variant: "destructive" as const },
      cancelled: { label: "Geannuleerd", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Huis Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{isRequester ? "Host's Huis" : "Requester's Huis"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Huis afbeelding */}
          <div className="relative h-48 rounded-lg overflow-hidden">
            <Image
              src={images[0] || "/placeholder.svg?height=200&width=300&query=house"}
              alt={displayHome.title || "Huis"}
              fill
              className="object-cover"
            />
          </div>

          {/* Huis details */}
          <div>
            <h3 className="font-semibold text-lg mb-2">{displayHome.title}</h3>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{displayHome.city}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Swap Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Swap Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div>
            <span className="text-sm font-medium text-gray-600">Status</span>
            <div className="mt-1">{getStatusBadge(exchange.status)}</div>
          </div>

          {/* Datums */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Aankomst</span>
              <p className="text-sm mt-1">{format(new Date(exchange.start_date), "d MMM yyyy", { locale: nl })}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Vertrek</span>
              <p className="text-sm mt-1">{format(new Date(exchange.end_date), "d MMM yyyy", { locale: nl })}</p>
            </div>
          </div>

          {/* Gasten en nachten */}
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

          {/* Swap fee */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Swap Fee</span>
              <span className="font-semibold">€20</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Eenmalige vergoeding per persoon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
