"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle, CreditCard, Shield, Zap, X } from "lucide-react"

interface CreditModalProps {
  isOpen?: boolean
  onClose?: () => void
}

export function CreditModal({ isOpen = false, onClose }: CreditModalProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(isOpen)

  useEffect(() => {
    setIsVisible(isOpen)
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) onClose()
  }

  const handleBuyCredits = () => {
    router.push("/credits")
    handleClose()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]" onClick={handleClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold">Credits nodig voor swap verzoek</h2>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-gray-600">
            Je hebt geen credits meer om een swap verzoek te versturen. Elke swap verzoek kost 1 credit.
          </p>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Waarom credits?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Voorkomt spam en ongewenste verzoeken</li>
              <li>• Zorgt voor serieuze swap partners</li>
              <li>• Houdt de kwaliteit van de community hoog</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Voordelen van credits kopen
            </h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Verstuur meerdere swap verzoeken</li>
              <li>• Geen wachttijd bij bevestiging</li>
              <li>• Credits verlopen nooit</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose}>
            Annuleren
          </Button>
          <Button onClick={handleBuyCredits} className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Credits kopen
          </Button>
        </div>
      </div>
    </div>
  )
}
