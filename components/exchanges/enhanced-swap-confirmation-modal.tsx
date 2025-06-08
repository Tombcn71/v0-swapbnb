"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, MapPin } from "lucide-react"
import confetti from "canvas-confetti"

interface EnhancedSwapConfirmationModalProps {
  userName: string
  startDate: string
  endDate: string
  exchangeId: string
  requesterName: string
  hostName: string
  requesterHomeCity: string
  hostHomeCity: string
  onClose: () => void
}

export function EnhancedSwapConfirmationModal({
  userName,
  startDate,
  endDate,
  exchangeId,
  requesterName,
  hostName,
  requesterHomeCity,
  hostHomeCity,
  onClose,
}: EnhancedSwapConfirmationModalProps) {
  const [open, setOpen] = useState(true)

  // Trigger confetti when modal opens
  useEffect(() => {
    if (open) {
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        // since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#14b8a6", "#0d9488", "#0f766e"],
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#14b8a6", "#0d9488", "#0f766e"],
        })
      }, 250)

      // Save to localStorage to prevent showing again
      const shownConfirmations = JSON.parse(localStorage.getItem("shownSwapConfirmations") || "[]")
      if (!shownConfirmations.includes(exchangeId)) {
        localStorage.setItem("shownSwapConfirmations", JSON.stringify([...shownConfirmations, exchangeId]))
      }
    }
  }, [open, exchangeId])

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-teal-700">🎉 Swap Bevestigd! 🎉</DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-6">
          <div className="flex justify-center">
            <div className="bg-teal-50 rounded-full p-4">
              <CheckCircle className="h-16 w-16 text-teal-600" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg font-medium">Gefeliciteerd, {userName}! Jullie swap is bevestigd.</p>
            <p className="text-gray-600">
              Beide partijen hebben de swap goedgekeurd en betaald. Jullie kunnen nu de details afronden.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600" />
              <div>
                <p className="text-sm font-medium">Periode</p>
                <p className="text-gray-600">
                  {format(new Date(startDate), "d MMM", { locale: nl })} -{" "}
                  {format(new Date(endDate), "d MMM yyyy", { locale: nl })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-teal-600" />
              <div>
                <p className="text-sm font-medium">Locaties</p>
                <p className="text-gray-600">
                  {requesterName} ({requesterHomeCity}) ↔️ {hostName} ({hostHomeCity})
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={handleClose} className="bg-teal-600 hover:bg-teal-700">
              Geweldig!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
