"use client"

import Image from "next/image"
import { format, differenceInDays } from "date-fns"
import { nl } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Users, Bed, Calendar } from "lucide-react"
import type { Exchange } from "@/lib/types"

interface ExchangeDetailsSidebarProps {
  exchange: Exchange
  isRequester: boolean
  isHost: boolean
}

export function ExchangeDetailsSidebar({ exchange, isRequester, isHost }: ExchangeDetailsSidebarProps) {
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
              <span className="font-semibold">€20</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Eenmalige vergoeding per persoon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
