import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  // Check if user has already completed onboarding
  const users = await executeQuery("SELECT onboarding_completed FROM users WHERE id = $1", [session.user.id])

  if (users.length === 0) {
    redirect("/login")
  }

  // If onboarding is already completed, redirect to dashboard
  if (users[0].onboarding_completed) {
    redirect("/dashboard")
  }

  return (
    <div className="container py-8">
      <OnboardingFlow userId={session.user.id} />
    </div>
  )
}
