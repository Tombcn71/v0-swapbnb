"use client"
import { CheckCircle, MessageCircle, UserCheck } from "lucide-react"
import type { Exchange } from "@/lib/types"

interface SwapProgressIndicatorProps {
  exchange: Exchange
  currentUserId: string
  isRequester: boolean
  isHost: boolean
}

export function SwapProgressIndicator({ exchange, currentUserId, isRequester, isHost }: SwapProgressIndicatorProps) {
  // Calculate progress based on status
  const getProgressPercentage = () => {
    if (exchange.status === "pending") return 0
    if (exchange.status === "accepted") return 50
    if (exchange.requester_confirmed || exchange.host_confirmed) return 75
    if (exchange.status === "confirmed") return 100
    return 0
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-xs">
        {/* Stap 1: Aanvraag */}
        <div className="flex flex-col items-center">
          <div
            className={`h-8 w-8 rounded-full ${exchange.status !== "pending" ? "bg-teal-100" : "bg-gray-100"} flex items-center justify-center mb-2`}
          >
            {exchange.status !== "pending" ? (
              <CheckCircle className="h-4 w-4 text-teal-600" />
            ) : (
              <MessageCircle className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <span className={`font-medium ${exchange.status !== "pending" ? "text-teal-600" : "text-gray-400"}`}>
            Aanvraag
          </span>
        </div>

        {/* Stap 2: Goedkeuren (alleen host) */}
        <div className="flex flex-col items-center">
          <div
            className={`h-8 w-8 rounded-full ${exchange.status === "accepted" || exchange.status === "confirmed" ? "bg-teal-100" : "bg-gray-100"} flex items-center justify-center mb-2`}
          >
            {exchange.status === "accepted" || exchange.status === "confirmed" ? (
              <CheckCircle className="h-4 w-4 text-teal-600" />
            ) : (
              <UserCheck className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <span
            className={`font-medium ${exchange.status === "accepted" || exchange.status === "confirmed" ? "text-teal-600" : "text-gray-400"}`}
          >
            Goedkeuren
          </span>
        </div>

        {/* Stap 3: Bevestigen */}
        <div className="flex flex-col items-center">
          <div
            className={`h-8 w-8 rounded-full ${exchange.status === "confirmed" ? "bg-teal-100" : "bg-gray-100"} flex items-center justify-center mb-2`}
          >
            {exchange.status === "confirmed" ? (
              <CheckCircle className="h-4 w-4 text-teal-600" />
            ) : (
              <UserCheck className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <span className={`font-medium ${exchange.status === "confirmed" ? "text-teal-600" : "text-gray-400"}`}>
            Bevestigen
          </span>
        </div>
      </div>

      {/* Status text */}
      <div className="mt-4 text-center text-sm text-gray-600">
        {exchange.status === "pending" && "Wachten op goedkeuring van de host..."}
        {exchange.status === "accepted" &&
          !exchange.requester_confirmed &&
          !exchange.host_confirmed &&
          "Host heeft goedgekeurd! Nu kunnen beide partijen bevestigen"}
        {exchange.status === "accepted" &&
          (exchange.requester_confirmed || exchange.host_confirmed) &&
          !(exchange.requester_confirmed && exchange.host_confirmed) &&
          "Wachten op bevestiging van andere partij..."}
        {exchange.status === "confirmed" && "🎉 Swap bevestigd!"}
      </div>
    </div>
  )
}
