"use client"
import { CheckCircle, MessageCircle, UserCheck, Video, Users } from "lucide-react"
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
    if (exchange.status === "accepted") return 25
    if (exchange.status === "videocall_scheduled") return 50
    if (exchange.status === "videocall_completed") return 75
    if (exchange.status === "confirmed") return 100
    return 0
  }

  const getStepStatus = (step: string) => {
    const statusOrder = ["pending", "accepted", "videocall_scheduled", "videocall_completed", "confirmed"]
    const currentIndex = statusOrder.indexOf(exchange.status)
    const stepIndex = statusOrder.indexOf(step)

    if (stepIndex <= currentIndex) return "completed"
    if (stepIndex === currentIndex + 1) return "current"
    return "upcoming"
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

      <div className="grid grid-cols-5 gap-2 text-xs">
        {/* Stap 1: Aanvraag */}
        <div className="flex flex-col items-center">
          <div
            className={`h-8 w-8 rounded-full ${getStepStatus("pending") === "completed" ? "bg-teal-100" : "bg-gray-100"} flex items-center justify-center mb-2`}
          >
            {getStepStatus("pending") === "completed" ? (
              <CheckCircle className="h-4 w-4 text-teal-600" />
            ) : (
              <MessageCircle className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <span
            className={`font-medium text-center ${getStepStatus("pending") === "completed" ? "text-teal-600" : "text-gray-400"}`}
          >
            Aanvraag
          </span>
        </div>

        {/* Stap 2: In Gesprek */}
        <div className="flex flex-col items-center">
          <div
            className={`h-8 w-8 rounded-full ${getStepStatus("accepted") === "completed" ? "bg-teal-100" : getStepStatus("accepted") === "current" ? "bg-blue-100" : "bg-gray-100"} flex items-center justify-center mb-2`}
          >
            {getStepStatus("accepted") === "completed" ? (
              <CheckCircle className="h-4 w-4 text-teal-600" />
            ) : getStepStatus("accepted") === "current" ? (
              <Users className="h-4 w-4 text-blue-600" />
            ) : (
              <Users className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <span
            className={`font-medium text-center ${
              getStepStatus("accepted") === "completed"
                ? "text-teal-600"
                : getStepStatus("accepted") === "current"
                  ? "text-blue-600"
                  : "text-gray-400"
            }`}
          >
            In Gesprek
          </span>
        </div>

        {/* Stap 3: Videocall */}
        <div className="flex flex-col items-center">
          <div
            className={`h-8 w-8 rounded-full ${getStepStatus("videocall_scheduled") === "completed" ? "bg-teal-100" : getStepStatus("videocall_scheduled") === "current" ? "bg-blue-100" : "bg-gray-100"} flex items-center justify-center mb-2`}
          >
            {getStepStatus("videocall_scheduled") === "completed" ? (
              <CheckCircle className="h-4 w-4 text-teal-600" />
            ) : getStepStatus("videocall_scheduled") === "current" ? (
              <Video className="h-4 w-4 text-blue-600" />
            ) : (
              <Video className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <span
            className={`font-medium text-center ${
              getStepStatus("videocall_scheduled") === "completed"
                ? "text-teal-600"
                : getStepStatus("videocall_scheduled") === "current"
                  ? "text-blue-600"
                  : "text-gray-400"
            }`}
          >
            Videocall
          </span>
        </div>

        {/* Stap 4: Kennismaking */}
        <div className="flex flex-col items-center">
          <div
            className={`h-8 w-8 rounded-full ${getStepStatus("videocall_completed") === "completed" ? "bg-teal-100" : getStepStatus("videocall_completed") === "current" ? "bg-blue-100" : "bg-gray-100"} flex items-center justify-center mb-2`}
          >
            {getStepStatus("videocall_completed") === "completed" ? (
              <CheckCircle className="h-4 w-4 text-teal-600" />
            ) : getStepStatus("videocall_completed") === "current" ? (
              <UserCheck className="h-4 w-4 text-blue-600" />
            ) : (
              <UserCheck className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <span
            className={`font-medium text-center ${
              getStepStatus("videocall_completed") === "completed"
                ? "text-teal-600"
                : getStepStatus("videocall_completed") === "current"
                  ? "text-blue-600"
                  : "text-gray-400"
            }`}
          >
            Voltooid
          </span>
        </div>

        {/* Stap 5: Bevestigen */}
        <div className="flex flex-col items-center">
          <div
            className={`h-8 w-8 rounded-full ${getStepStatus("confirmed") === "completed" ? "bg-teal-100" : getStepStatus("confirmed") === "current" ? "bg-blue-100" : "bg-gray-100"} flex items-center justify-center mb-2`}
          >
            {getStepStatus("confirmed") === "completed" ? (
              <CheckCircle className="h-4 w-4 text-teal-600" />
            ) : getStepStatus("confirmed") === "current" ? (
              <UserCheck className="h-4 w-4 text-blue-600" />
            ) : (
              <UserCheck className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <span
            className={`font-medium text-center ${
              getStepStatus("confirmed") === "completed"
                ? "text-teal-600"
                : getStepStatus("confirmed") === "current"
                  ? "text-blue-600"
                  : "text-gray-400"
            }`}
          >
            Bevestigd
          </span>
        </div>
      </div>

      {/* Status text */}
      <div className="mt-4 text-center text-sm text-gray-600">
        {exchange.status === "pending" && "Wachten op reactie van de host..."}
        {exchange.status === "accepted" && "💬 In gesprek - bespreek de details van jullie swap"}
        {exchange.status === "videocall_scheduled" && "📹 Videocall gepland - maak kennis met elkaar"}
        {exchange.status === "videocall_completed" && "✅ Kennismaking voltooid - nu kunnen beide partijen bevestigen"}
        {exchange.status === "confirmed" && "🎉 Swap bevestigd!"}
      </div>
    </div>
  )
}
