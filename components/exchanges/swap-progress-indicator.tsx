"use client"

import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Clock } from "lucide-react"

interface SwapProgressIndicatorProps {
  exchange: any
}

export function SwapProgressIndicator({ exchange }: SwapProgressIndicatorProps) {
  const getProgressValue = (status: string) => {
    switch (status) {
      case "pending":
        return 20
      case "accepted":
        return 40
      case "confirmed":
        return 80
      case "completed":
        return 100
      default:
        return 0
    }
  }

  const getStepStatus = (step: string, currentStatus: string) => {
    const statusOrder = ["pending", "accepted", "confirmed", "completed"]
    const currentIndex = statusOrder.indexOf(currentStatus)
    const stepIndex = statusOrder.indexOf(step)

    if (stepIndex <= currentIndex) return "completed"
    if (stepIndex === currentIndex + 1) return "current"
    return "upcoming"
  }

  const steps = [
    { key: "pending", label: "Aanvraag", description: "Swap aangevraagd" },
    { key: "accepted", label: "Geaccepteerd", description: "Host heeft geaccepteerd" },
    { key: "confirmed", label: "Bevestigd", description: "Beide partijen bevestigd" },
    { key: "completed", label: "Voltooid", description: "Swap afgerond" },
  ]

  return (
    <div className="w-full">
      <div className="mb-4">
        <Progress value={getProgressValue(exchange.status)} className="h-2" />
      </div>

      <div className="flex justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.key, exchange.status)

          return (
            <div key={step.key} className="flex flex-col items-center text-center flex-1">
              <div className="flex items-center mb-2">
                {status === "completed" ? (
                  <CheckCircle className="h-6 w-6 text-teal-600" />
                ) : status === "current" ? (
                  <Clock className="h-6 w-6 text-teal-600" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-300" />
                )}
              </div>

              <div className="text-xs">
                <div
                  className={`font-medium ${
                    status === "completed" || status === "current" ? "text-teal-600" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </div>
                <div className="text-gray-500 mt-1">{step.description}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Also export as default for backward compatibility
export default SwapProgressIndicator
