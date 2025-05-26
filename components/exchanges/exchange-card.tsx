"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VideocallScheduler } from "./videocall-scheduler"
import { ExchangeActions } from "./exchange-actions"
import { Calendar, MapPin, Users, MessageSquare } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { nl } from "date-fns/locale"

interface ExchangeCardProps {
  exchange: any
  currentUserId: string
}

export function ExchangeCard({ exchange, currentUserId }: ExchangeCardProps) {
  const isRequester = exchange.requester_id === currentUserId

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ In afwachting</Badge>
      case "accepted":
        return <Badge className="bg-blue-100 text-blue-800">✓ Geaccepteerd</Badge>
      case "videocall_scheduled":
        return <Badge className="bg-purple-100 text-purple-800">📹 Videocall gepland</Badge>
      case "videocall_completed":
        return <Badge className="bg-green-100 text-green-800">✓ Videocall voltooid</Badge>
      case "payment_pending":
        return <Badge className="bg-orange-100 text-orange-800">💳 Betaling in behandeling</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">✓ Voltooid</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">✗ Afgewezen</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">✗ Geannuleerd</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {isRequester ? exchange.host_home_title : exchange.requester_home_title}
          </CardTitle>
          {getStatusBadge(exchange.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative h-32 w-full md:w-48 rounded-md overflow-hidden flex-shrink-0">
            <Image
              src={`/placeholder.svg?height=300&width=400&query=${
                isRequester ? exchange.host_home_title : exchange.requester_home_title
              }`}
              alt={isRequester ? exchange.host_home_title : exchange.requester_home_title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-grow space-y-3">
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{isRequester ? exchange.host_home_city : exchange.requester_home_city}</span>
            </div>

            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {format(new Date(exchange.start_date), "d MMM", { locale: nl })} -{" "}
                {format(new Date(exchange.end_date), "d MMM yyyy", { locale: nl })}
              </span>
            </div>

            <div className="flex items-center text-gray-600 text-sm">
              <Users className="h-4 w-4 mr-1" />
              <span>{exchange.guests} gasten</span>
            </div>

            {exchange.message && (
              <div className="bg-gray-50 p-2 rounded text-sm">
                <MessageSquare className="h-3 w-3 inline mr-1" />
                {exchange.message.length > 100 ? exchange.message.substring(0, 100) + "..." : exchange.message}
              </div>
            )}
          </div>
        </div>

        {/* Videocall Scheduler - TONEN ALS GEACCEPTEERD */}
        {(exchange.status === "accepted" ||
          exchange.status === "videocall_scheduled" ||
          exchange.status === "videocall_completed") && (
          <div className="border-t pt-4">
            <VideocallScheduler exchange={exchange} isRequester={isRequester} />
          </div>
        )}

        {/* Exchange Actions */}
        <div className="border-t pt-4">
          <ExchangeActions exchange={exchange} isRequester={isRequester} />
        </div>

        {/* Link naar details */}
        <div className="flex justify-end">
          <Button variant="outline" asChild>
            <Link href={`/exchanges/${exchange.id}`}>Bekijk details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
