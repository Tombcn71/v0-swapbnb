"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PartyPopper, Calendar, MessageSquare } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface SwapCongratulationsModalProps {
  exchange: any
  isOpen: boolean
  onClose: () => void
}

export function SwapCongratulationsModal({ exchange, isOpen, onClose }: SwapCongratulationsModalProps) {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      // Optioneel: laad confetti library en toon confetti
      const loadConfetti = async () => {
        try {
          const confettiModule = await import("canvas-confetti")
          const confetti = confettiModule.default

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          })

          setTimeout(() => {
            confetti({
              particleCount: 50,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
            })
          }, 250)

          setTimeout(() => {
            confetti({
              particleCount: 50,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
            })
          }, 400)
        } catch (error) {
          console.error("Failed to load confetti", error)
        }
      }

      loadConfetti()
    }
  }, [isOpen])

  if (!exchange) return null

  const startDate = exchange.start_date ? formatDate(new Date(exchange.start_date)) : ""
  const endDate = exchange.end_date ? formatDate(new Date(exchange.end_date)) : ""

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <PartyPopper className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center text-xl">Gefeliciteerd met jullie swap!</DialogTitle>
          <DialogDescription className="text-center">
            Jullie swap is bevestigd. Tijd om de details af te spreken!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-3 rounded-md flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Datum</p>
              <p className="text-sm text-gray-600">
                {startDate} tot {endDate}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-md flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Volgende stappen</p>
              <p className="text-sm text-gray-600">
                Gebruik de chat om verdere details af te spreken over sleutels, huisregels en andere belangrijke
                informatie.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-2">
          <Button onClick={onClose} variant="outline">
            Sluiten
          </Button>
          <Button
            onClick={() => {
              onClose()
              // Scroll naar chat sectie
              setTimeout(() => {
                const chatElement = document.getElementById("exchange-chat")
                if (chatElement) {
                  chatElement.scrollIntoView({ behavior: "smooth" })
                }
              }, 100)
            }}
          >
            Naar de chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
