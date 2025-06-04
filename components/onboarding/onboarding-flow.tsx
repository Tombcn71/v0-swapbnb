"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useOnboarding } from "@/components/providers/onboarding-provider"
import { OnboardingWelcome } from "@/components/onboarding/onboarding-welcome"
import { OnboardingProfile } from "@/components/onboarding/onboarding-profile"
import { OnboardingVerification } from "@/components/onboarding/onboarding-verification"
import { OnboardingProperty } from "@/components/onboarding/onboarding-property"
import { OnboardingComplete } from "@/components/onboarding/onboarding-complete"
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress"

interface OnboardingFlowProps {
  userId: string
}

export function OnboardingFlow({ userId }: OnboardingFlowProps) {
  const { currentStep, isStepCompleted } = useOnboarding()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Small delay to prevent flash of content
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Welkom bij SwapBnB</h1>

      <OnboardingProgress />

      <div className="mt-8">
        {currentStep === "welcome" && <OnboardingWelcome />}
        {currentStep === "profile" && <OnboardingProfile />}
        {currentStep === "verification" && <OnboardingVerification />}
        {currentStep === "property" && <OnboardingProperty />}
        {currentStep === "complete" && <OnboardingComplete />}
      </div>
    </div>
  )
}
