"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

export type OnboardingStep = "welcome" | "profile" | "verification" | "property" | "complete"

interface OnboardingContextType {
  currentStep: OnboardingStep
  setCurrentStep: (step: OnboardingStep) => void
  completeStep: (step: OnboardingStep) => void
  isStepCompleted: (step: OnboardingStep) => boolean
  resetOnboarding: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome")
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set())
  const router = useRouter()
  const { toast } = useToast()

  // Check if user has completed onboarding
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Check if user has already completed onboarding
      const checkOnboardingStatus = async () => {
        try {
          const response = await fetch("/api/users/onboarding-status")
          const data = await response.json()

          if (data.onboardingCompleted) {
            // User has already completed onboarding
            return
          }

          // Set completed steps based on user data
          const completed = new Set<OnboardingStep>()

          if (data.hasProfile) completed.add("welcome")
          if (data.profileCompleted) completed.add("profile")
          if (data.isVerified) completed.add("verification")
          if (data.hasProperty) completed.add("property")

          setCompletedSteps(completed)

          // Determine current step
          if (!data.hasProfile) {
            setCurrentStep("welcome")
          } else if (!data.profileCompleted) {
            setCurrentStep("profile")
          } else if (!data.isVerified) {
            setCurrentStep("verification")
          } else if (!data.hasProperty) {
            setCurrentStep("property")
          } else {
            setCurrentStep("complete")
            completed.add("complete")
            setCompletedSteps(completed)
          }
        } catch (error) {
          console.error("Failed to fetch onboarding status:", error)
        }
      }

      checkOnboardingStatus()
    }
  }, [status, session, router])

  const completeStep = (step: OnboardingStep) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev)
      newSet.add(step)
      return newSet
    })

    // Determine next step
    const steps: OnboardingStep[] = ["welcome", "profile", "verification", "property", "complete"]
    const currentIndex = steps.indexOf(step)

    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }

    // If completing the final step, mark onboarding as complete
    if (step === "property") {
      fetch("/api/users/complete-onboarding", {
        method: "POST",
      })
        .then((res) => {
          if (res.ok) {
            toast({
              title: "Onboarding voltooid!",
              description: "Je kunt nu beginnen met het ruilen van woningen.",
            })
            setCurrentStep("complete")
          }
        })
        .catch((error) => {
          console.error("Failed to complete onboarding:", error)
        })
    }
  }

  const isStepCompleted = (step: OnboardingStep) => {
    return completedSteps.has(step)
  }

  const resetOnboarding = () => {
    setCompletedSteps(new Set())
    setCurrentStep("welcome")
  }

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        completeStep,
        isStepCompleted,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}
