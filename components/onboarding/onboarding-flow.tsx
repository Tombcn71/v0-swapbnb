"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  const [currentStep, setCurrentStep] = useState<string>("welcome")
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Define the onboarding steps in order
  const steps = ["welcome", "profile", "verification", "property", "complete"]

  useEffect(() => {
    // Fetch the user's current onboarding status
    const fetchOnboardingStatus = async () => {
      try {
        const response = await fetch("/api/users/onboarding-status")
        const data = await response.json()

        if (data.completedSteps) {
          setCompletedSteps(data.completedSteps)

          // Find the first incomplete step
          const firstIncompleteStep = steps.find((step) => !data.completedSteps[step]) || "welcome"
          setCurrentStep(firstIncompleteStep)
        }
      } catch (error) {
        console.error("Error fetching onboarding status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOnboardingStatus()
  }, [])

  const completeStep = async (step: string) => {
    try {
      // Update the completed steps locally
      setCompletedSteps((prev) => ({ ...prev, [step]: true }))

      // Save progress to the server
      await fetch("/api/users/onboarding-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, completed: true }),
      })

      // Move to the next step
      const currentIndex = steps.indexOf(step)
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1])
      } else {
        // Complete onboarding if all steps are done
        await fetch("/api/users/complete-onboarding", { method: "POST" })
        router.push("/listings") // Redirect to listings page after completion
      }
    } catch (error) {
      console.error("Error updating onboarding status:", error)
    }
  }

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

      <OnboardingProgress steps={steps} currentStep={currentStep} completedSteps={completedSteps} />

      <div className="mt-8">
        {currentStep === "welcome" && <OnboardingWelcome onComplete={() => completeStep("welcome")} />}
        {currentStep === "profile" && <OnboardingProfile onComplete={() => completeStep("profile")} />}
        {currentStep === "verification" && <OnboardingVerification onComplete={() => completeStep("verification")} />}
        {currentStep === "property" && <OnboardingProperty onComplete={() => completeStep("property")} />}
        {currentStep === "complete" && <OnboardingComplete />}
      </div>
    </div>
  )
}
