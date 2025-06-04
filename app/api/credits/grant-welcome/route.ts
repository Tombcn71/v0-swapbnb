import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already has credits
    const users = await executeQuery("SELECT credits FROM users WHERE id = $1", [session.user.id])

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currentCredits = users[0].credits || 0

    // Only grant welcome credit if user has 0 credits
    if (currentCredits === 0) {
      // Add 1 welcome credit
      await executeQuery("UPDATE users SET credits = credits + 1 WHERE id = $1", [session.user.id])

      // Record the transaction
      await executeQuery(
        `INSERT INTO credits_transactions (user_id, amount, transaction_type, description)
         VALUES ($1, $2, $3, $4)`,
        [session.user.id, 1, "welcome", "Welkom credit voor nieuwe gebruiker"],
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error granting welcome credit:", error)
    return NextResponse.json({ error: "Failed to grant welcome credit" }, { status: 500 })
  }
}
