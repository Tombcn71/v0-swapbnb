"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddHomeForm } from "@/components/homes/add-home-form"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface OnboardingPropertyProps {
  onComplete: () => void
}

export function OnboardingProperty({ onComplete }: OnboardingPropertyProps) {
  const [skipConfirmOpen, setSkipConfirmOpen] = useState(false)
  const { toast } = useToast()

  const handlePropertyAdded = () => {
    toast({
      title: "Woning toegevoegd!",
      description: "Je woning is succesvol toegevoegd aan SwapBnB.",
    })
    onComplete()
  }

  const confirmSkip = () => {
    toast({
      title: "Stap overgeslagen",
      description: "Je kunt later een woning toevoegen via je dashboard.",
    })
    onComplete()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Voeg je woning toe</CardTitle>
        <CardDescription>
          Voeg details en foto's van je woning toe zodat andere gebruikers geïnteresseerd raken in een huizenruil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
          <p className="text-amber-800">
            <strong>Belangrijk:</strong> Je moet een woning toevoegen voordat je ruilverzoeken kunt doen. Andere
            gebruikers willen zien waar ze kunnen verblijven!
          </p>
        </div>

        <AddHomeForm onComplete={handlePropertyAdded} isOnboarding={true} />

        {!skipConfirmOpen ? (
          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => setSkipConfirmOpen(true)}>
              Ik wil dit later doen
            </Button>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800 mb-3">
              Weet je zeker dat je deze stap wilt overslaan? Je kunt geen huizenruil aanvragen doen zonder een woning
              toe te voegen.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSkipConfirmOpen(false)}>
                Terug
              </Button>
              <Button variant="default" onClick={confirmSkip}>
                Overslaan
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
