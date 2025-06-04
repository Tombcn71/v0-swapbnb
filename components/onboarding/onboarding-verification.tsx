"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Shield, Check, Loader2 } from "lucide-react"

interface OnboardingVerificationProps {
  onComplete: () => void
}

export function OnboardingVerification({ onComplete }: OnboardingVerificationProps) {
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<string>("pending")
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
          }, 1500)
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
        throw new Error("Failed to start verification")
      }

      const data = await response.json()
      setVerificationUrl(data.url)

      // Open verification in new window
      if (data.url) {
        window.open(data.url, "_blank")
      }
    } catch (error) {
      console.error("Error starting verification:", error)
      toast({
        title: "Fout bij verificatie",
        description: "Er is een fout opgetreden bij het starten van de verificatie.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Identiteitsverificatie</CardTitle>
        <CardDescription>
          Verifieer je identiteit om het vertrouwen van andere gebruikers te winnen. Dit is een belangrijke stap voor
          een veilige community.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Waarom identiteitsverificatie?</h3>
              <p className="text-blue-700 text-sm mt-1">
                Identiteitsverificatie zorgt voor een veilige community. Je gegevens worden veilig verwerkt en alleen
                gebruikt om je identiteit te bevestigen.
              </p>
            </div>
          </div>
        </div>

        {verificationStatus === "verified" ? (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center gap-3">
            <Check className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-medium text-green-800">Verificatie voltooid!</h3>
              <p className="text-green-700 text-sm">
                Je identiteit is succesvol geverifieerd. Je kunt nu doorgaan naar de volgende stap.
              </p>
            </div>
          </div>
        ) : verificationUrl ? (
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-amber-800">
                Verificatie is gestart. Volg de instructies in het nieuwe venster om je identiteit te verifiëren.
              </p>
            </div>
            <Button onClick={() => window.open(verificationUrl, "_blank")} variant="outline" className="w-full">
              Verificatie opnieuw openen
            </Button>
          </div>
        ) : (
          <Button onClick={startVerification} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificatie starten...
              </>
            ) : (
              <>Start identiteitsverificatie</>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
