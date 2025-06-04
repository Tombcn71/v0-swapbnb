"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Coins, ArrowRight } from "lucide-react"

interface OnboardingWelcomeProps {
  onComplete: () => void
}

export function OnboardingWelcome({ onComplete }: OnboardingWelcomeProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    setIsLoading(true)

    try {
      // Grant free credit
      const response = await fetch("/api/credits/grant-welcome", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to grant welcome credit")
      }

      toast({
        title: "Welkom bij SwapBnB!",
        description: "Je hebt een gratis credit ontvangen om te starten met huizenruil.",
      })

      onComplete()
    } catch (error) {
      console.error("Error during welcome step:", error)
      toast({
        title: "Er is iets misgegaan",
        description: "Probeer het later opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Welkom bij de SwapBnB Community!</CardTitle>
        <CardDescription>
          We zijn blij dat je erbij bent. Laten we je helpen om aan de slag te gaan met huizenruil.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 flex items-start gap-3">
          <Coins className="h-6 w-6 text-teal-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-teal-800">Je eerste credit is op ons!</h3>
            <p className="text-teal-700 text-sm mt-1">
              We geven je een gratis credit om te beginnen. Hiermee kun je je eerste huizenruil maken nadat je je
              profiel hebt ingesteld.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Hoe werkt SwapBnB?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="font-medium text-teal-600">1.</span>
              <span>Maak je profiel compleet zodat andere gebruikers je kunnen leren kennen</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-teal-600">2.</span>
              <span>Verifieer je identiteit voor extra veiligheid en vertrouwen</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-teal-600">3.</span>
              <span>Voeg je woning toe met foto's en beschrijving</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-teal-600">4.</span>
              <span>Begin met het ontdekken van woningen en het maken van ruilverzoeken</span>
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleContinue} disabled={isLoading} className="w-full">
          {isLoading ? "Even geduld..." : "Begin met onboarding"}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  )
}
