import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// POST /api/exchanges/[id]/pay-credits - Betaal credits voor swap
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id
    const userId = session.user.id

    // Haal exchange op
    const exchanges = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, userId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    const exchange = exchanges[0]

    // Check if exchange is in accepted status
    if (exchange.status !== "accepted") {
      return NextResponse.json({ error: "Exchange must be accepted before payment" }, { status: 400 })
    }

    // Check if user already paid
    const isRequester = exchange.requester_id === userId
    const alreadyPaid = isRequester ? exchange.requester_credits_paid : exchange.host_credits_paid

    if (alreadyPaid) {
      return NextResponse.json({ error: "You have already paid for this exchange" }, { status: 400 })
    }

    // Check if user has enough credits
    const userResult = await executeQuery("SELECT credits FROM users WHERE id = $1", [userId])
    const userCredits = userResult[0]?.credits || 0

    if (userCredits < 1) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 })
    }

    // Deduct credit and mark as paid
    await executeQuery("UPDATE users SET credits = credits - 1 WHERE id = $1", [userId])

    // Update exchange payment status
    const paymentColumn = isRequester ? "requester_credits_paid" : "host_credits_paid"
    await executeQuery(`UPDATE exchanges SET ${paymentColumn} = true WHERE id = $1`, [exchangeId])

    // Record transaction
    await executeQuery(
      `INSERT INTO credits_transactions (user_id, amount, transaction_type, exchange_id, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, -1, "swap_payment", exchangeId, `Betaling voor swap ${exchangeId}`],
    )

    // Check if both parties have paid
    const updatedExchange = await executeQuery(
      "SELECT requester_credits_paid, host_credits_paid FROM exchanges WHERE id = $1",
      [exchangeId],
    )

    const bothPaid = updatedExchange[0].requester_credits_paid && updatedExchange[0].host_credits_paid

    if (bothPaid) {
      // Update status to confirmed
      await executeQuery("UPDATE exchanges SET status = 'confirmed', confirmed_at = NOW() WHERE id = $1", [exchangeId])
    }

    return NextResponse.json({
      success: true,
      message: "Payment successful",
      bothPaid,
      newStatus: bothPaid ? "confirmed" : "accepted",
    })
  } catch (error) {
    console.error("Error processing credits payment:", error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
