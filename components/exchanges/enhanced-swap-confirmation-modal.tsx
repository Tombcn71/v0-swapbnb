"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Heart, Sparkles, ArrowRight } from "lucide-react"
import Confetti from "react-confetti"
import { useWindowSize } from "@/hooks/use-window-size"

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
  const [showConfetti, setShowConfetti] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()
  const { width, height } = useWindowSize()

  // Animation steps
  const steps = [
    { icon: <Heart className="h-12 w-12 text-pink-500" />, text: "Swap bevestigd!" },
    { icon: <CheckCircle className="h-12 w-12 text-green-500" />, text: "Alles geregeld!" },
    { icon: <Sparkles className="h-12 w-12 text-purple-500" />, text: "Geniet van jullie ruil!" },
  ]

  // Stop confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // Animate through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 1500)

    return () => clearInterval(interval)
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
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-full transition-all duration-500">
                {steps[currentStep].icon}
              </div>
            </div>
            <DialogTitle className="text-center text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {steps[currentStep].text}
            </DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-6">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-lg mb-2">🏠 Jullie Swap Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-medium">{requesterName}</span>
                  <span className="text-gray-500">({requesterHomeCity})</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{hostName}</span>
                  <span className="text-gray-500">({hostHomeCity})</span>
                </div>
                <div className="text-lg font-semibold text-purple-700">
                  📅 {formattedStartDate} t/m {formattedEndDate}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-lg font-medium">Gefeliciteerd {userName}! 🎉</p>
              <p className="text-gray-600">
                Jullie swap is officieel bevestigd. Tijd om te genieten van jullie huizenruil!
              </p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                💡 <strong>Volgende stappen:</strong> Wissel contactgegevens uit en regel de sleuteloverdracht. Vind
                alle details terug onder 'Mijn Swaps'.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <Button
              onClick={handleGoToSwaps}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ga naar Mijn Swaps
            </Button>
            <Button variant="outline" onClick={handleClose} className="w-full">
              Verder chatten
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
