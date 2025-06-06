"use client"

import { useOnboarding } from "@/components/providers/onboarding-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileVerification } from "@/components/profile/profile-verification"
import { useEffect, useState } from "react"

export function OnboardingVerification() {
  const { completeStep } = useOnboarding()
  const [verificationStatus, setVerificationStatus] = useState<string>("pending")
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    // Check verification status
    const checkVerificationStatus = async () => {
      try {
        const response = await fetch("/api/profile/verification-status")
        const data = await response.json()

        setVerificationStatus(data.status)
        setIsVerified(data.status === "verified")

        // If already verified, auto-complete this step
        if (data.status === "verified") {
          setTimeout(() => {
            completeStep("verification")
          }, 1500)
        }
      } catch (error) {
        console.error("Error checking verification status:", error)
      }
    }

    checkVerificationStatus()

    // Poll for status updates if pending
    const interval = setInterval(() => {
      if (verificationStatus !== "verified") {
        checkVerificationStatus()
      } else {
        clearInterval(interval)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [completeStep, verificationStatus])

  const handleVerificationComplete = () => {
    completeStep("verification")
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
      <CardContent>
        <ProfileVerification
          isVerified={isVerified}
          verificationStatus={verificationStatus}
          onComplete={handleVerificationComplete}
          isOnboarding={true}
        />
      </CardContent>
    </Card>
  )
}
