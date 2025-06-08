import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id

    // Controleer toegang
    const exchanges = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, session.user.id],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    const exchange = exchanges[0]

    if (exchange.status !== "accepted") {
      return NextResponse.json({ error: "Exchange must be accepted first" }, { status: 400 })
    }

    // Bepaal welke gebruiker bevestigt
    const isRequester = exchange.requester_id === session.user.id
    const confirmationField = isRequester ? "requester_confirmed" : "host_confirmed"

    // Controleer of deze gebruiker al heeft bevestigd
    if (exchange[confirmationField]) {
      return NextResponse.json({ error: "Already confirmed" }, { status: 400 })
    }

    // Controleer credits
    const userCredits = await executeQuery("SELECT credits FROM users WHERE id = $1", [session.user.id])
    if (userCredits.length === 0 || userCredits[0].credits < 1) {
      // Maak Stripe checkout sessie voor credits
      const baseUrl = process.env.NEXTAUTH_URL || `https://${request.headers.get("host")}`

      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID_CREDITS,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/exchanges/${exchangeId}?payment_success=true`,
        cancel_url: `${baseUrl}/exchanges/${exchangeId}?payment_cancelled=true`,
        metadata: {
          type: "credits_purchase",
          user_id: session.user.id,
          exchange_id: exchangeId,
          action: "confirm",
        },
      })

      return NextResponse.json({ url: checkoutSession.url })
    }

    // Deduct credit en bevestig
    await executeQuery("UPDATE users SET credits = credits - 1 WHERE id = $1", [session.user.id])
    await executeQuery(`UPDATE exchanges SET ${confirmationField} = true WHERE id = $1`, [exchangeId])

    // Controleer of beide partijen hebben bevestigd
    const updatedExchange = await executeQuery("SELECT * FROM exchanges WHERE id = $1", [exchangeId])
    if (updatedExchange[0].requester_confirmed && updatedExchange[0].host_confirmed) {
      await executeQuery("UPDATE exchanges SET status = 'videocall_scheduled' WHERE id = $1", [exchangeId])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error confirming exchange:", error)
    return NextResponse.json({ error: "Failed to confirm exchange" }, { status: 500 })
  }
}
