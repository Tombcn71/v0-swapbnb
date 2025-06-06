"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, X } from "lucide-react"
import Confetti from "react-confetti"
import { useWindowSize } from "@/hooks/use-window-size"

interface SwapConfirmationModalProps {
  userName: string
  startDate: string
  endDate: string
  exchangeId: string
  onClose: () => void
}

export function SwapConfirmationModal({
  userName,
  startDate,
  endDate,
  exchangeId,
  onClose,
}: SwapConfirmationModalProps) {
  const [open, setOpen] = useState(true)
  const [showConfetti, setShowConfetti] = useState(true)
  const router = useRouter()
  const { width, height } = useWindowSize()

  // Stop confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // Store that this confirmation has been shown
  useEffect(() => {
    if (exchangeId) {
      const shownConfirmations = JSON.parse(localStorage.getItem("shownSwapConfirmations") || "[]")
      if (!shownConfirmations.includes(exchangeId)) {
        localStorage.setItem("shownSwapConfirmations", JSON.stringify([...shownConfirmations, exchangeId]))
      }
    }
  }, [exchangeId])

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  const handleGoToSwaps = () => {
    setOpen(false)
    router.push("/exchanges")
  }

  const formattedStartDate = format(new Date(startDate), "d MMMM yyyy", { locale: nl })
  const formattedEndDate = format(new Date(endDate), "d MMMM yyyy", { locale: nl })

  return (
    <>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">Gefeliciteerd {userName}! Je swap is bevestigd!</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-lg">
              Jullie ruilen van {formattedStartDate} t/m {formattedEndDate}.
            </p>
            <p className="text-sm text-gray-500">Vind je swap terug onder 'Mijn Swaps'.</p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2">
            <Button onClick={handleGoToSwaps} className="w-full sm:w-auto">
              Ga naar Mijn Swaps
            </Button>
          </DialogFooter>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Sluiten</span>
          </button>
        </DialogContent>
      </Dialog>
    </>
  )
}
