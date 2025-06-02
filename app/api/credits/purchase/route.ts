import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// Handle credits purchase completion (called by Stripe webhook)
export async function POST(request: Request) {
  try {
    const { userId, amount, stripeSessionId, description } = await request.json()

    // Validate input
    if (!userId || !amount || !stripeSessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if transaction already exists (prevent duplicates)
    const existingTransaction = await executeQuery("SELECT id FROM credits_transactions WHERE stripe_session_id = $1", [
      stripeSessionId,
    ])

    if (existingTransaction.length > 0) {
      return NextResponse.json({ message: "Transaction already processed" })
    }

    // Add credits to user
    await executeQuery("UPDATE users SET credits = credits + $1 WHERE id = $2", [amount, userId])

    // Record transaction
    await executeQuery(
      `INSERT INTO credits_transactions (user_id, amount, transaction_type, stripe_session_id, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, amount, "purchase", stripeSessionId, description || `Purchased ${amount} credits`],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing credits purchase:", error)
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 })
  }
}
