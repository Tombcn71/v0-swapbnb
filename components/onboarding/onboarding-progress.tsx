"use client"

import type React from "react"

import { useOnboarding, type OnboardingStep } from "@/components/providers/onboarding-provider"
import { Check, User, Shield, Home, PartyPopper } from "lucide-react"
import { cn } from "@/lib/utils"

export function OnboardingProgress() {
  const { currentStep, isStepCompleted } = useOnboarding()

  const steps: { id: OnboardingStep; label: string; icon: React.ReactNode }[] = [
    { id: "welcome", label: "Welkom", icon: <PartyPopper className="h-5 w-5" /> },
    { id: "profile", label: "Profiel", icon: <User className="h-5 w-5" /> },
    { id: "verification", label: "Verificatie", icon: <Shield className="h-5 w-5" /> },
    { id: "property", label: "Woning", icon: <Home className="h-5 w-5" /> },
    { id: "complete", label: "Voltooid", icon: <Check className="h-5 w-5" /> },
  ]

  return (
    <div className="w-full">
      <div className="flex items-center justify-between w-full">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2",
                currentStep === step.id
                  ? "border-teal-500 bg-teal-50 text-teal-600"
                  : isStepCompleted(step.id)
                    ? "border-teal-500 bg-teal-500 text-white"
                    : "border-gray-300 bg-gray-50 text-gray-400",
              )}
            >
              {isStepCompleted(step.id) ? <Check className="h-5 w-5" /> : step.icon}
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium",
                currentStep === step.id
                  ? "text-teal-600"
                  : isStepCompleted(step.id)
                    ? "text-teal-600"
                    : "text-gray-500",
              )}
            >
              {step.label}
            </span>

            {index < steps.length - 1 && (
              <div className="hidden sm:block absolute left-0 w-full">
                <div className={cn("h-0.5 w-full", isStepCompleted(step.id) ? "bg-teal-500" : "bg-gray-200")} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="relative mt-2">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-200">
          {steps.map((step, index) => {
            if (index === steps.length - 1) return null

            return (
              <div
                key={`line-${step.id}`}
                className={cn("absolute h-0.5", isStepCompleted(step.id) ? "bg-teal-500" : "bg-gray-200")}
                style={{
                  left: `${(index / (steps.length - 1)) * 100}%`,
                  width: `${100 / (steps.length - 1)}%`,
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
