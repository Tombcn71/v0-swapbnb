import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET /api/credits - Haal credits en transacties op
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Haal huidige credits op met fallback naar 0
    const userResult = await executeQuery("SELECT credits, created_at FROM users WHERE id = $1", [session.user.id])

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult[0]
    const credits = user.credits || 0

    // Check if user is new (created within last 24 hours) and has 0 credits
    const isNewUser = new Date(user.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)

    // If new user has 0 credits, give them 1 free credit
    if (isNewUser && credits === 0) {
      await executeQuery("UPDATE users SET credits = 1 WHERE id = $1", [session.user.id])

      // Log the free credit transaction
      await executeQuery(
        `INSERT INTO credits_transactions (user_id, amount, transaction_type, description)
         VALUES ($1, $2, $3, $4)`,
        [session.user.id, 1, "welcome_bonus", "Gratis welkomstcredit voor nieuwe gebruiker"],
      )

      return NextResponse.json({ credits: 1, transactions: [] })
    }

    // Haal transactie geschiedenis op
    const transactions = await executeQuery(
      `SELECT id, amount, transaction_type, description, created_at, stripe_session_id, exchange_id
       FROM credits_transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [session.user.id],
    )

    return NextResponse.json({
      credits,
      transactions,
    })
  } catch (error) {
    console.error("Error fetching credits:", error)
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 })
  }
}
