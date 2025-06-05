"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Shield, Loader2, AlertCircle, FileText, Camera, CheckCircle } from "lucide-react"

interface OnboardingVerificationProps {
  onComplete: () => void
}

export function OnboardingVerification({ onComplete }: OnboardingVerificationProps) {
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<string>("not_started")
  const { toast } = useToast()

  // Check verification status periodically
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const response = await fetch("/api/profile/verification-status")
        const data = await response.json()

        setVerificationStatus(data.status)

        // If verified, complete this step
        if (data.status === "verified") {
          setTimeout(() => {
            onComplete()
          }, 2000)
        }
      } catch (error) {
        console.error("Error checking verification status:", error)
      }
    }

    // Check immediately
    checkVerificationStatus()

    // Then check every 5 seconds if not verified
    const interval = setInterval(() => {
      if (verificationStatus !== "verified") {
        checkVerificationStatus()
      } else {
        clearInterval(interval)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [verificationStatus, onComplete])

  const startVerification = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/profile/verify", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start verification")
      }

      const data = await response.json()
      setVerificationUrl(data.url)

      // Open verification in same window
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error("Error starting verification:", error)
      toast({
        title: "Fout bij verificatie",
        description: error.message || "Er is een fout opgetreden bij het starten van de verificatie.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusDisplay = () => {
    switch (verificationStatus) {
      case "verified":
        return (
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800 text-lg">Verificatie voltooid!</h3>
                <p className="text-green-700">Je identiteit is succesvol geverifieerd.</p>
              </div>
            </div>
            <p className="text-green-600 text-sm">Je wordt automatisch doorgestuurd naar de volgende stap...</p>
          </div>
        )
      case "pending":
        return (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              <div>
                <h3 className="font-medium text-blue-800">Verificatie wordt verwerkt...</h3>
                <p className="text-blue-700 text-sm">Dit kan enkele minuten duren.</p>
              </div>
            </div>
          </div>
        )
      case "failed":
        return (
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Verificatie mislukt</h3>
                <p className="text-red-700 text-sm">Probeer het opnieuw met een geldig ID-document.</p>
              </div>
            </div>
            <Button onClick={startVerification} disabled={isLoading} className="mt-3">
              Opnieuw proberen
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Identiteitsverificatie
        </CardTitle>
        <CardDescription>
          Verifieer je identiteit met een officieel ID-document om het vertrouwen van andere gebruikers te winnen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {getStatusDisplay()}

        {verificationStatus === "not_started" && (
          <>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">Waarom identiteitsverificatie?</h3>
                  <p className="text-blue-700 text-sm mt-1">
                    Identiteitsverificatie zorgt voor een veilige community waar leden elkaar kunnen vertrouwen bij het
                    ruilen van woningen.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Wat heb je nodig?</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-sm">Geldig ID</p>
                    <p className="text-xs text-gray-600">Paspoort, rijbewijs of ID-kaart</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Camera className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-sm">Selfie</p>
                    <p className="text-xs text-gray-600">Voor identiteitsbevestiging</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-sm">5 minuten</p>
                    <p className="text-xs text-gray-600">Snel en veilig proces</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Hoe werkt het?</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600 min-w-[20px]">1.</span>
                  <span>Je wordt doorgestuurd naar Stripe's beveiligde verificatie omgeving</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600 min-w-[20px]">2.</span>
                  <span>Upload een foto van je ID-bewijs (paspoort, rijbewijs of ID-kaart)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600 min-w-[20px]">3.</span>
                  <span>Maak een selfie om te bevestigen dat jij het bent</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600 min-w-[20px]">4.</span>
                  <span>Keer automatisch terug naar SwapBnB als geverifieerd lid</span>
                </div>
              </div>
            </div>

            <Button onClick={startVerification} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificatie starten...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" /> Start identiteitsverificatie
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500 text-center">
              Je gegevens worden veilig verwerkt door Stripe Identity en niet gedeeld met andere leden
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
