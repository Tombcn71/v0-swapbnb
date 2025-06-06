"use client"

import Link from "next/link"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare } from "lucide-react"

interface ExchangesSidebarProps {
  exchanges: any[]
  currentExchangeId: string
  currentUserId: string
}

export function ExchangesSidebar({ exchanges, currentExchangeId, currentUserId }: ExchangesSidebarProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Nieuw", variant: "secondary" as const, color: "bg-orange-100 text-orange-800" },
      accepted: { label: "Geaccepteerd", variant: "default" as const, color: "bg-green-100 text-green-800" },
      confirmed: { label: "Bevestigd", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
      rejected: { label: "Afgewezen", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      cancelled: { label: "Geannuleerd", variant: "destructive" as const, color: "bg-gray-100 text-gray-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-teal-600" />
          <h2 className="font-semibold text-gray-900">Alle berichten</h2>
        </div>
      </div>

      {/* Exchanges List */}
      <div className="flex-1 overflow-y-auto">
        {exchanges.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>Geen berichten gevonden</p>
          </div>
        ) : (
          exchanges.map((exchange) => (
            <Link
              key={exchange.id}
              href={`/exchanges/${exchange.id}`}
              className={`block border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                exchange.id === currentExchangeId ? "bg-teal-50 border-l-4 border-l-teal-500" : ""
              }`}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={exchange.other_user_image || "/placeholder.svg?height=40&width=40&query=user"}
                      alt={exchange.other_user_name}
                    />
                    <AvatarFallback>{getInitials(exchange.other_user_name || "")}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">{exchange.other_user_name}</h3>
                      {getStatusBadge(exchange.status)}
                    </div>

                    <p className="text-sm text-gray-600 mb-1">{exchange.other_user_city}</p>

                    <p className="text-xs text-gray-500">
                      {format(new Date(exchange.created_at), "d MMM", { locale: nl })}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
