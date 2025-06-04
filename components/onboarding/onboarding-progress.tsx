import { Check, Home, User, Shield, Gift } from "lucide-react"

interface OnboardingProgressProps {
  steps: string[]
  currentStep: string
  completedSteps: Record<string, boolean>
}

export function OnboardingProgress({ steps, currentStep, completedSteps }: OnboardingProgressProps) {
  const getStepIcon = (step: string) => {
    switch (step) {
      case "welcome":
        return <Gift className="h-5 w-5" />
      case "profile":
        return <User className="h-5 w-5" />
      case "verification":
        return <Shield className="h-5 w-5" />
      case "property":
        return <Home className="h-5 w-5" />
      case "complete":
        return <Check className="h-5 w-5" />
      default:
        return null
    }
  }

  const getStepLabel = (step: string) => {
    switch (step) {
      case "welcome":
        return "Welkom"
      case "profile":
        return "Profiel"
      case "verification":
        return "Verificatie"
      case "property":
        return "Woning"
      case "complete":
        return "Klaar"
      default:
        return step
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                completedSteps[step]
                  ? "bg-teal-500 text-white"
                  : currentStep === step
                    ? "bg-teal-100 text-teal-700 border-2 border-teal-500"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {completedSteps[step] ? <Check className="h-5 w-5" /> : getStepIcon(step)}
            </div>

            <div className="hidden sm:block ml-2">
              <p
                className={`text-sm font-medium ${
                  completedSteps[step] || currentStep === step ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {getStepLabel(step)}
              </p>
            </div>

            {index < steps.length - 1 && (
              <div className="hidden sm:block w-12 h-0.5 mx-2 bg-gray-200">{/* Connector line */}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
