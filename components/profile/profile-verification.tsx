"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Shield, CheckCircle, AlertCircle, Star } from "lucide-react"

interface ProfileVerificationProps {
  isVerified: boolean
  verificationStatus: string
}

export function ProfileVerification({ isVerified, verificationStatus }: ProfileVerificationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleVerification = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/profile/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start verification")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error: any) {
      toast({
        title: "Verificatie mislukt",
        description: error.message || "Er is iets misgegaan. Probeer het opnieuw.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800">✓ Geverifieerd</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ In behandeling</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">✗ Mislukt</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Niet geverifieerd</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Identiteitsverificatie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVerified ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status</span>
              {getStatusBadge()}
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 mb-1">✓ Je bent geverifieerd!</h4>
                  <p className="text-green-800 text-sm">
                    Je identiteit is bevestigd via Stripe Identity. Andere leden kunnen nu zien dat je een vertrouwbaar
                    lid bent.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 text-blue-800">
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium">Voordelen van verificatie:</span>
              </div>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Andere leden vertrouwen je meer</li>
                <li>• Je krijgt meer ruil aanvragen</li>
                <li>• Je kunt ruilen met andere geverifieerde leden</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status</span>
              {getStatusBadge()}
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-1">Verificatie aanbevolen</h4>
                  <p className="text-yellow-800 text-sm">
                    Verifieer je identiteit om het vertrouwen van andere leden te winnen en meer ruil kansen te krijgen.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Wat gebeurt er tijdens verificatie?</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">1.</span>
                  <span>Je wordt doorgestuurd naar Stripe's beveiligde omgeving</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">2.</span>
                  <span>Upload een foto van je ID-bewijs (paspoort, rijbewijs of ID-kaart)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">3.</span>
                  <span>Maak een selfie om te bevestigen dat jij het bent</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">4.</span>
                  <span>Keer terug naar SwapBnB als geverifieerd lid</span>
                </div>
              </div>
            </div>

            <Button onClick={handleVerification} disabled={isLoading} className="w-full">
              <Shield className="mr-2 h-4 w-4" />
              {isLoading ? "Doorsturen naar verificatie..." : "Start verificatie"}
            </Button>

            <div className="text-xs text-gray-500 text-center">
              Je gegevens worden veilig verwerkt door Stripe en niet gedeeld met andere leden
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
