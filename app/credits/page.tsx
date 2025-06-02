import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import { CreditsPurchase } from "@/components/credits/credits-purchase"
import { CreditsHistory } from "@/components/credits/credits-history"

export default async function CreditsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  // Get current credits
  const userResult = await executeQuery("SELECT credits FROM users WHERE id = $1", [session.user.id])
  const currentCredits = userResult[0]?.credits || 0

  // Get transaction history
  const transactions = await executeQuery(
    `SELECT id, amount, transaction_type, description, created_at, exchange_id
     FROM credits_transactions 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT 20`,
    [session.user.id],
  )

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Credits</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Credits & Purchase */}
          <div>
            <CreditsPurchase currentCredits={currentCredits} userEmail={session.user.email!} />
          </div>

          {/* Transaction History */}
          <div>
            <CreditsHistory transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  )
}
