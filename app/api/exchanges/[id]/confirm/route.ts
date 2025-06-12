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
    if (exchange.status !== "accepted" && exchange.status !== "videocall_completed") {
      return NextResponse.json(
        { error: "Exchange must be accepted or videocall completed before confirmation" },
        { status: 400 },
      )
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

    // Check if user has free swap available - met fallback
    let hasFreeSWap = true // Default: eerste swap is gratis
    try {
      const userResult = await executeQuery("SELECT first_swap_free FROM users WHERE id = $1", [userId])
      hasFreeSWap = userResult[0]?.first_swap_free || false
    } catch (error) {
      // Kolom bestaat nog niet, behandel als eerste swap (gratis)
      console.log("first_swap_free column doesn't exist yet, treating as free swap")
      hasFreeSWap = true
    }

    if (hasFreeSWap) {
      // Free swap - direct confirmation
      if (isRequester) {
        await executeQuery("UPDATE exchanges SET requester_confirmed = true WHERE id = $1", [exchangeId])
      } else {
        await executeQuery("UPDATE exchanges SET host_confirmed = true WHERE id = $1", [exchangeId])
      }

      // Probeer first_swap_free te updaten (als kolom bestaat)
      try {
        await executeQuery("UPDATE users SET first_swap_free = false WHERE id = $1", [userId])
      } catch (error) {
        console.log("Could not update first_swap_free - column may not exist yet")
      }

      // Check if both parties confirmed
      const updatedExchange = await executeQuery("SELECT * FROM exchanges WHERE id = $1", [exchangeId])
      const bothConfirmed = updatedExchange[0].requester_confirmed && updatedExchange[0].host_confirmed

      if (bothConfirmed) {
        await executeQuery("UPDATE exchanges SET status = 'confirmed', confirmed_at = NOW() WHERE id = $1", [
          exchangeId,
        ])
      }

      return NextResponse.json({
        success: true,
        free_swap: true,
        both_confirmed: bothConfirmed,
        message: bothConfirmed
          ? "Swap bevestigd! Jullie eerste swap is gratis."
          : "Je bevestiging is geregistreerd (gratis). Wacht op de andere partij.",
      })
    } else {
      // Paid swap - create Stripe session
      const swapPrice = 500 // €5.00 in cents

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "ideal"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Home Swap Bevestiging",
                description: `Bevestiging voor swap van ${exchange.start_date} tot ${exchange.end_date}`,
              },
              unit_amount: swapPrice,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXTAUTH_URL}/exchanges/${exchangeId}?payment=success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/exchanges/${exchangeId}?payment=cancelled`,
        metadata: {
          exchange_id: exchangeId,
          user_id: userId,
          confirmation_type: isRequester ? "requester" : "host",
        },
      })

      // Save session ID
      await executeQuery("UPDATE exchanges SET stripe_payment_session_id = $1, payment_amount = $2 WHERE id = $3", [
        stripeSession.id,
        swapPrice,
        exchangeId,
      ])

      return NextResponse.json({
        success: true,
        free_swap: false,
        checkout_url: stripeSession.url,
        message: "Doorverwijzen naar betaling...",
      })
    }
  } catch (error) {
    console.error("Error confirming exchange:", error)
    return NextResponse.json({ error: "Failed to confirm exchange" }, { status: 500 })
  }
}
