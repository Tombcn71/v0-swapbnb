import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id
    const { payWithCredits } = await request.json()

    // Get exchange details
    const exchanges = await executeQuery(`SELECT * FROM exchanges WHERE id = $1`, [exchangeId])

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    const exchange = exchanges[0]
    const isRequester = exchange.requester_id === session.user.id
    const isHost = exchange.host_id === session.user.id

    if (!isRequester && !isHost) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has already confirmed
    if ((isRequester && exchange.requester_confirmed) || (isHost && exchange.host_confirmed)) {
      return NextResponse.json({ error: "Already confirmed" }, { status: 400 })
    }

    if (payWithCredits) {
      // Check if user has enough credits
      const users = await executeQuery(`SELECT credits FROM users WHERE id = $1`, [session.user.id])

      if (users.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const user = users[0]
      if (user.credits < 1) {
        return NextResponse.json({ error: "Not enough credits" }, { status: 400 })
      }

      // Deduct credits
      await executeQuery(`UPDATE users SET credits = credits - 1 WHERE id = $1`, [session.user.id])

      // Record credit usage
      await executeQuery(
        `INSERT INTO credit_transactions (user_id, amount, type, description, exchange_id)
         VALUES ($1, -1, 'swap_payment', 'Swap payment', $2)`,
        [session.user.id, exchangeId],
      )

      // Update exchange confirmation status
      if (isRequester) {
        await executeQuery(`UPDATE exchanges SET requester_confirmed = true, updated_at = NOW() WHERE id = $1`, [
          exchangeId,
        ])
      } else {
        await executeQuery(`UPDATE exchanges SET host_confirmed = true, updated_at = NOW() WHERE id = $1`, [exchangeId])
      }

      return NextResponse.json({ success: true })
    } else {
      // Create Stripe checkout session for credit purchase
      const origin = request.headers.get("origin") || request.headers.get("referer") || "https://swapbnb.vercel.app"
      const baseUrl = origin.endsWith("/") ? origin.slice(0, -1) : origin

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
          exchangeId,
          userId: session.user.id,
          isRequester: isRequester ? "true" : "false",
          isHost: isHost ? "true" : "false",
        },
      })

      return NextResponse.json({ url: checkoutSession.url })
    }
  } catch (error) {
    console.error("Error confirming exchange:", error)
    return NextResponse.json({ error: "Error confirming exchange" }, { status: 500 })
  }
}
