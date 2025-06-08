"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CalendarDays, Home } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import Confetti to avoid SSR issues
const Confetti = dynamic(() => import("react-confetti"), { ssr: false })

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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Set window dimensions for confetti
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    // Store that we've shown this confirmation
    const shownConfirmations = JSON.parse(localStorage.getItem("shownSwapConfirmations") || "[]")
    if (!shownConfirmations.includes(exchangeId)) {
      localStorage.setItem("shownSwapConfirmations", JSON.stringify([...shownConfirmations, exchangeId]))
    }

    return () => window.removeEventListener("resize", updateDimensions)
  }, [exchangeId])

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  return (
    <>
      {open && <Confetti width={dimensions.width} height={dimensions.height} recycle={false} numberOfPieces={200} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 Gefeliciteerd!</DialogTitle>
            <DialogDescription className="text-center pt-2">Je swap is succesvol bevestigd!</DialogDescription>
          </DialogHeader>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-purple-100 my-4">
            <div className="text-center mb-4">
              <span className="text-lg font-medium text-purple-800">
                {requesterName} ↔️ {hostName}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Periode</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(startDate), "d MMM", { locale: nl })} -{" "}
                    {format(new Date(endDate), "d MMM yyyy", { locale: nl })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Home className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Locaties</p>
                  <p className="text-sm text-gray-600">
                    {requesterHomeCity} ↔️ {hostHomeCity}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600">
            Je kunt nu alle details uitwisselen via de chat. Veel plezier met je huizenruil!
          </p>

          <DialogFooter className="sm:justify-center">
            <Button onClick={handleClose} className="bg-purple-600 hover:bg-purple-700">
              Geweldig!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
