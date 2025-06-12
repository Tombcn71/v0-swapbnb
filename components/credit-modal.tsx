"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Credits nodig</h2>
        <p className="mb-4">Je hebt niet genoeg credits om deze swap aan te vragen. Elke swap kost 1 credit.</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Sluiten
          </Button>
          <Button onClick={handleBuyCredits}>Credits kopen</Button>
        </div>
      </div>
    </div>
  )
}
