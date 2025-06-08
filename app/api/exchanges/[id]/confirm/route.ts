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

    // Check if exchange is accepted
    if (exchange.status !== "accepted") {
      return NextResponse.json({ error: "Exchange must be accepted before confirmation" }, { status: 400 })
    }

    const isRequester = exchange.requester_id === userId

    // Voeg confirmation fields toe als ze niet bestaan
    try {
      await executeQuery(`
        ALTER TABLE exchanges 
        ADD COLUMN IF NOT EXISTS requester_confirmed BOOLEAN DEFAULT false
      `)
      await executeQuery(`
        ALTER TABLE exchanges 
        ADD COLUMN IF NOT EXISTS host_confirmed BOOLEAN DEFAULT false
      `)
    } catch (error) {
      console.log("Confirmation columns already exist")
    }

    // Check if already confirmed
    const currentExchange = await executeQuery("SELECT * FROM exchanges WHERE id = $1", [exchangeId])
    const confirmationField = isRequester ? "requester_confirmed" : "host_confirmed"

    if (currentExchange[0][confirmationField]) {
      return NextResponse.json({ error: "You have already confirmed this swap" }, { status: 400 })
    }

    // Check if user has credits
    const userResult = await executeQuery("SELECT credits FROM users WHERE id = $1", [userId])
    const userCredits = userResult[0]?.credits || 0

    if (userCredits < 1) {
      // Create Stripe checkout session for credits
      const baseUrl = process.env.NEXTAUTH_URL || `https://${request.headers.get("host")}`

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "ideal"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "SwapBnB Credits",
                description: "Credits voor het bevestigen van swaps",
              },
              unit_amount: 500, // €5.00 in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/exchanges/${exchangeId}?payment=success`,
        cancel_url: `${baseUrl}/exchanges/${exchangeId}?payment=cancelled`,
        metadata: {
          exchange_id: exchangeId,
          user_id: userId,
          confirmation_type: isRequester ? "requester" : "host",
        },
      })

      return NextResponse.json({ url: stripeSession.url })
    }

    // User has credits, proceed with confirmation
    // Deduct credit
    await executeQuery("UPDATE users SET credits = credits - 1 WHERE id = $1", [userId])

    // Update confirmation
    if (isRequester) {
      await executeQuery("UPDATE exchanges SET requester_confirmed = true WHERE id = $1", [exchangeId])
    } else {
      await executeQuery("UPDATE exchanges SET host_confirmed = true WHERE id = $1", [exchangeId])
    }

    // Check if both parties confirmed
    const updatedExchange = await executeQuery("SELECT * FROM exchanges WHERE id = $1", [exchangeId])
    const bothConfirmed = updatedExchange[0].requester_confirmed && updatedExchange[0].host_confirmed

    if (bothConfirmed) {
      await executeQuery("UPDATE exchanges SET status = 'confirmed', confirmed_at = NOW() WHERE id = $1", [exchangeId])
    }

    return NextResponse.json({
      success: true,
      both_confirmed: bothConfirmed,
      message: bothConfirmed
        ? "Swap bevestigd! Beide partijen hebben bevestigd."
        : "Je bevestiging is geregistreerd. Wacht op de andere partij.",
    })
  } catch (error) {
    console.error("Error confirming exchange:", error)
    return NextResponse.json({ error: "Failed to confirm exchange" }, { status: 500 })
  }
}
