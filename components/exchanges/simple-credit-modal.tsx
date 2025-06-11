"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Shield, Users, Ban, Award } from "lucide-react"
import { useRouter } from "next/navigation"

interface SimpleCreditModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SimpleCreditModal({ isOpen, onClose }: SimpleCreditModalProps) {
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBuyCredits = () => {
    router.push("/credits")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="p-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold">Waarom gebruiken we credits?</h2>
            <p className="text-gray-500">Credits helpen ons om een veilige en betrouwbare community te bouwen</p>
          </div>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Veiligheid & Vertrouwen</h3>
                <p className="text-sm text-gray-500">
                  Credits zorgen ervoor dat alleen serieuze gebruikers swap aanvragen kunnen doen, wat de veiligheid van
                  onze community verhoogt.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Ban className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Voorkomt Spam</h3>
                <p className="text-sm text-gray-500">
                  Door credits te vragen voor aanvragen, voorkomen we dat mensen massaal aanvragen versturen zonder
                  echte intentie.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Betere Matches</h3>
                <p className="text-sm text-gray-500">
                  Gebruikers die credits gebruiken zijn serieuzer over hun aanvragen, wat leidt tot betere en meer
                  succesvolle swaps.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium">Eerste Credit Gratis</h3>
                <p className="text-sm text-gray-500">
                  Nieuwe gebruikers krijgen 1 gratis credit om het platform te proberen. Daarna kun je credits kopen
                  voor meer swaps.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button variant="outline" onClick={onClose} className="sm:flex-1">
              Sluiten
            </Button>
            <Button onClick={handleBuyCredits} className="sm:flex-1">
              Credits kopen
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
