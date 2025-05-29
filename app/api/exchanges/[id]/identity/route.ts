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

// POST /api/exchanges/[id]/identity - Maak Stripe Identity verificatie sessie
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

    // Bepaal welke rol de gebruiker heeft
    const isRequester = exchange.requester_id === session.user.id
    const paymentField = isRequester ? "requester_payment_status" : "host_payment_status"
    const identityField = isRequester ? "requester_identity_verification_status" : "host_identity_verification_status"

    // Controleer of de betaling is voltooid
    if (exchange[paymentField] !== "paid") {
      return NextResponse.json({ error: "Payment must be completed before identity verification" }, { status: 400 })
    }

    // Controleer of de verificatie al is gedaan
    if (exchange[identityField] === "verified") {
      return NextResponse.json({ error: "Identity already verified" }, { status: 400 })
    }

    // Voor nu simuleren we Stripe Identity - later vervangen door echte Stripe integratie
    const mockIdentitySession = {
      id: `vs_mock_${Date.now()}`,
      url: `https://verify.stripe.com/start/mock_session_${exchangeId}`,
    }

    // Update de identity session ID
    const sessionField = isRequester ? "requester_identity_session_id" : "host_identity_session_id"
    await executeQuery(`UPDATE exchanges SET ${sessionField} = $1 WHERE id = $2`, [mockIdentitySession.id, exchangeId])

    // Voor demo: automatisch markeren als geverifieerd na 5 seconden
    setTimeout(async () => {
      try {
        await executeQuery(`UPDATE exchanges SET ${identityField} = $1 WHERE id = $2`, ["verified", exchangeId])

        // Controleer of beide partijen klaar zijn
        const updatedExchanges = await executeQuery("SELECT * FROM exchanges WHERE id = $1", [exchangeId])
        const updatedExchange = updatedExchanges[0]

        if (
          updatedExchange.requester_payment_status === "paid" &&
          updatedExchange.host_payment_status === "paid" &&
          updatedExchange.requester_identity_verification_status === "verified" &&
          updatedExchange.host_identity_verification_status === "verified"
        ) {
          // Markeer exchange als voltooid
          await executeQuery("UPDATE exchanges SET status = $1 WHERE id = $2", ["completed", exchangeId])
          console.log(`Exchange ${exchangeId} completed!`)
        }

        console.log(`Identity verified for exchange ${exchangeId}`)
      } catch (error) {
        console.error("Error updating identity status:", error)
      }
    }, 5000)

    return NextResponse.json({
      url: mockIdentitySession.url,
      sessionId: mockIdentitySession.id,
    })
  } catch (error) {
    console.error("Error creating identity verification session:", error)
    return NextResponse.json({ error: "Failed to create identity verification session" }, { status: 500 })
  }
}
