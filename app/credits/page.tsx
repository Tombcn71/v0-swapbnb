import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CreditsPurchase } from "@/components/credits/credits-purchase"
import { CreditsHistory } from "@/components/credits/credits-history"
import { executeQuery } from "@/lib/db"

export default async function CreditsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  // Haal huidige credits op
  const userResult = await executeQuery("SELECT credits FROM users WHERE id = $1", [session.user.id])
  const currentCredits = userResult[0]?.credits || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Credits</h1>
            <p className="text-gray-600 mt-2">
              Beheer je credits voor home swaps. Elke bevestigde swap kost 1 credit per persoon.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Credits Purchase */}
            <div>
              <CreditsPurchase currentCredits={currentCredits} userEmail={session.user.email!} />
            </div>

            {/* Credits History */}
            <div>
              <CreditsHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
