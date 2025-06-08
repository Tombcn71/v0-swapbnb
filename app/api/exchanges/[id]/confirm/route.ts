import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import Stripe from "stripe"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id
    const userId = session.user.id

    // Check if the exchange exists and the user is part of it
    const exchanges = await executeQuery(
      `SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)`,
      [exchangeId, userId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    const exchange = exchanges[0]
    const isRequester = exchange.requester_id === userId
    const isHost = exchange.host_id === userId

    // Check if the user has enough credits
    const credits = await executeQuery(`SELECT credits FROM users WHERE id = $1`, [userId])

    const userCredits = credits[0]?.credits || 0
    const requiredCredits = 1 // 1 credit per swap

    if (userCredits < requiredCredits) {
      // User doesn't have enough credits, redirect to Stripe
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

      // Get the origin for constructing the success and cancel URLs
      const origin = request.headers.get("origin") || request.headers.get("referer") || "https://swapbnb.vercel.app"
      const baseUrl = origin.endsWith("/") ? origin.slice(0, -1) : origin

      // Create a checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID_CREDITS,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/exchanges/${exchangeId}?payment=success`,
        cancel_url: `${baseUrl}/exchanges/${exchangeId}?payment=cancelled`,
        metadata: {
          userId: userId,
          exchangeId: exchangeId,
          type: "swap_payment",
        },
      })

      return NextResponse.json({ url: checkoutSession.url })
    }

    // User has enough credits, proceed with confirmation
    if (isRequester) {
      await executeQuery(`UPDATE exchanges SET requester_confirmed = true WHERE id = $1`, [exchangeId])
    } else if (isHost) {
      await executeQuery(`UPDATE exchanges SET host_confirmed = true WHERE id = $1`, [exchangeId])
    }

    // Check if both parties have confirmed
    const updatedExchange = await executeQuery(`SELECT * FROM exchanges WHERE id = $1`, [exchangeId])

    if (updatedExchange[0].requester_confirmed && updatedExchange[0].host_confirmed) {
      // Both parties have confirmed, update status to confirmed
      await executeQuery(`UPDATE exchanges SET status = 'confirmed' WHERE id = $1`, [exchangeId])

      // Deduct credits from both users
      await executeQuery(`UPDATE users SET credits = credits - $1 WHERE id = $2 OR id = $3`, [
        requiredCredits,
        exchange.requester_id,
        exchange.host_id,
      ])

      // Add credit transaction records
      await executeQuery(
        `INSERT INTO credit_transactions (user_id, amount, description, exchange_id)
         VALUES ($1, -$2, 'Swap payment', $3), ($4, -$2, 'Swap payment', $3)`,
        [exchange.requester_id, requiredCredits, exchangeId, exchange.host_id],
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error confirming exchange:", error)
    return NextResponse.json({ error: "Failed to confirm exchange" }, { status: 500 })
  }
}
