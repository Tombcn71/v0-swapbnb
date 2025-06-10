"use client"
import { CheckCircle, Users, Video, UserCheck } from "lucide-react"
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
    if (exchange.status === "accepted") return 33
    if (exchange.status === "videocall_scheduled" || exchange.status === "videocall_completed") return 66
    if (exchange.status === "confirmed") return 100
    return 0
  }

  const getStepStatus = (step: string) => {
    const statusOrder = ["accepted", "videocall_completed", "confirmed"]
    const currentIndex = statusOrder.indexOf(exchange.status)
    const stepIndex = statusOrder.indexOf(step)

    if (stepIndex <= currentIndex) return "completed"
    if (stepIndex === currentIndex + 1) return "current"
    return "upcoming"
  }

  // Don't show progress bar if still pending
  if (exchange.status === "pending") {
    return null
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
        {/* Stap 1: In Gesprek */}
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

        {/* Stap 2: Videocall */}
        <div className="flex flex-col items-center">
          <div
            className={`h-8 w-8 rounded-full ${getStepStatus("videocall_completed") === "completed" ? "bg-teal-100" : getStepStatus("videocall_completed") === "current" ? "bg-blue-100" : "bg-gray-100"} flex items-center justify-center mb-2`}
          >
            {getStepStatus("videocall_completed") === "completed" ? (
              <CheckCircle className="h-4 w-4 text-teal-600" />
            ) : getStepStatus("videocall_completed") === "current" ? (
              <Video className="h-4 w-4 text-blue-600" />
            ) : (
              <Video className="h-4 w-4 text-gray-400" />
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
            Videocall
          </span>
        </div>

        {/* Stap 3: Bevestigd */}
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
        {exchange.status === "accepted" && "💬 Bespreek de details en plan een videocall"}
        {(exchange.status === "videocall_scheduled" || exchange.status === "videocall_completed") &&
          "📹 Maak kennis via videocall"}
        {exchange.status === "confirmed" && "🎉 Swap bevestigd!"}
      </div>
    </div>
  )
}
