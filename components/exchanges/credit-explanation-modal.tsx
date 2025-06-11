"use client"
import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Shield, Users, Ban, Award } from "lucide-react"
import { useRouter } from "next/navigation"

interface CreditExplanationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreditExplanationModal({ open, onOpenChange }: CreditExplanationModalProps) {
  const router = useRouter()

  // Debug logging
  useEffect(() => {
    console.log("Modal open state:", open)
  }, [open])

  const handleBuyCredits = () => {
    router.push("/credits")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Waarom gebruiken we credits?</DialogTitle>
          <DialogDescription className="text-center">
            Credits helpen ons om een veilige en betrouwbare community te bouwen
          </DialogDescription>
        </DialogHeader>

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
                Door credits te vragen voor aanvragen, voorkomen we dat mensen massaal aanvragen versturen zonder echte
                intentie.
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
                Nieuwe gebruikers krijgen 1 gratis credit om het platform te proberen. Daarna kun je credits kopen voor
                meer swaps.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:flex-1">
            Sluiten
          </Button>
          <Button onClick={handleBuyCredits} className="sm:flex-1">
            Credits kopen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
