import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Functie om te controleren of een string een geldige UUID is
const isValidUUID = (id: string) => {
  if (!id) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// POST /api/exchanges/[id]/payment - Maak Stripe Checkout sessie voor swap fee
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id

    // Controleer of de exchange ID een geldige UUID is
    if (!isValidUUID(exchangeId)) {
      console.error("Invalid UUID format for exchange ID:", exchangeId)
      return NextResponse.json({ error: "Invalid exchange ID format" }, { status: 400 })
    }

    // Haal de uitwisseling op
    const exchanges = await executeQuery("SELECT * FROM exchanges WHERE id = $1", [exchangeId])

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    const exchange = exchanges[0]

    // Controleer of de gebruiker betrokken is bij de uitwisseling
    if (exchange.requester_id !== session.user.id && exchange.host_id !== session.user.id) {
      return NextResponse.json({ error: "You are not involved in this exchange" }, { status: 403 })
    }

    // Controleer of de videocall voltooid is
    if (exchange.status !== "videocall_completed") {
      return NextResponse.json({ error: "Videocall must be completed before payment" }, { status: 400 })
    }

    // Bepaal welke rol de gebruiker heeft
    const isRequester = exchange.requester_id === session.user.id
    const paymentField = isRequester ? "requester_payment_status" : "host_payment_status"

    // Controleer of de betaling al is gedaan
    if (exchange[paymentField] === "paid") {
      return NextResponse.json({ error: "Payment already completed" }, { status: 400 })
    }

    // Voor nu simuleren we Stripe - later vervangen door echte Stripe integratie
    const mockStripeSession = {
      id: `cs_mock_${Date.now()}`,
      url: `https://checkout.stripe.com/pay/mock_session_${exchangeId}`,
    }

    // Update de payment session ID
    const sessionField = isRequester ? "requester_payment_session_id" : "host_payment_session_id"
    await executeQuery(`UPDATE exchanges SET ${sessionField} = $1 WHERE id = $2`, [mockStripeSession.id, exchangeId])

    // Voor demo: automatisch markeren als betaald na 3 seconden
    setTimeout(async () => {
      try {
        await executeQuery(`UPDATE exchanges SET ${paymentField} = $1 WHERE id = $2`, ["paid", exchangeId])
        console.log(`Payment completed for exchange ${exchangeId}`)
      } catch (error) {
        console.error("Error updating payment status:", error)
      }
    }, 3000)

    return NextResponse.json({
      url: mockStripeSession.url,
      sessionId: mockStripeSession.id,
    })
  } catch (error) {
    console.error("Error creating payment session:", error)
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 })
  }
}
