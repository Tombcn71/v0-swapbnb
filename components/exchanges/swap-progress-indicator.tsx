"use client"

import { Progress } from "@/components/ui/progress"
import { CheckCircle, Video, MessageSquare, AlertCircle } from "lucide-react"
import type { Exchange } from "@/lib/types"

interface SwapProgressIndicatorProps {
  exchange: Exchange
  currentUserId: string
  isRequester: boolean
  isHost: boolean
}

export function SwapProgressIndicator({ exchange, currentUserId, isRequester, isHost }: SwapProgressIndicatorProps) {
  // Determine progress percentage based on status
  const getProgressPercentage = () => {
    const statusMap: Record<string, number> = {
      pending: 25,
      accepted: 50,
      videocall_scheduled: 75,
      videocall_completed: 90,
      confirmed: 100,
      rejected: 0,
      cancelled: 0,
    }

    return statusMap[exchange.status] || 0
  }

  // Get the current step based on status
  const getCurrentStep = () => {
    const stepMap: Record<string, number> = {
      pending: 1,
      accepted: 2,
      videocall_scheduled: 2,
      videocall_completed: 3,
      confirmed: 4,
      rejected: 0,
      cancelled: 0,
    }

    return stepMap[exchange.status] || 0
  }

  const currentStep = getCurrentStep()
  const progressPercentage = getProgressPercentage()

  // Check if the exchange is rejected or cancelled
  const isRejectedOrCancelled = exchange.status === "rejected" || exchange.status === "cancelled"

  if (isRejectedOrCancelled) {
    return (
      <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="font-medium text-red-800">
            {exchange.status === "rejected" ? "Swap afgewezen" : "Swap geannuleerd"}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="mb-2">
        <Progress value={progressPercentage} className="h-2" />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <div className={`flex flex-col items-center ${currentStep >= 1 ? "text-teal-600 font-medium" : ""}`}>
          <MessageSquare className={`h-4 w-4 ${currentStep >= 1 ? "text-teal-600" : "text-gray-400"}`} />
          <span className="mt-1">Gesprek</span>
        </div>
        <div className={`flex flex-col items-center ${currentStep >= 2 ? "text-teal-600 font-medium" : ""}`}>
          <Video className={`h-4 w-4 ${currentStep >= 2 ? "text-teal-600" : "text-gray-400"}`} />
          <span className="mt-1">Videocall</span>
        </div>
        <div className={`flex flex-col items-center ${currentStep >= 3 ? "text-teal-600 font-medium" : ""}`}>
          <CheckCircle className={`h-4 w-4 ${currentStep >= 3 ? "text-teal-600" : "text-gray-400"}`} />
          <span className="mt-1">Bevestiging</span>
        </div>
      </div>
    </div>
  )
}
