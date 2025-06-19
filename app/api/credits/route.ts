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

    // Haal huidige credits op
    const userResult = await executeQuery("SELECT credits FROM users WHERE id = $1", [session.user.id])

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const credits = userResult[0].credits || 0

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
