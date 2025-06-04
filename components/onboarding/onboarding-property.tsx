"use client"

import { useState } from "react"
import { useOnboarding } from "@/components/providers/onboarding-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddHomeForm } from "@/components/homes/add-home-form"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function OnboardingProperty() {
  const { completeStep } = useOnboarding()
  const [skipConfirmOpen, setSkipConfirmOpen] = useState(false)
  const router = useRouter()

  const handlePropertyAdded = () => {
    completeStep("property")
  }

  const handleSkip = () => {
    setSkipConfirmOpen(true)
  }

  const confirmSkip = () => {
    completeStep("property")
    router.push("/dashboard")
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
        <AddHomeForm onComplete={handlePropertyAdded} isOnboarding={true} />

        {!skipConfirmOpen ? (
          <div className="mt-6 text-center">
            <Button variant="link" onClick={handleSkip}>
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
