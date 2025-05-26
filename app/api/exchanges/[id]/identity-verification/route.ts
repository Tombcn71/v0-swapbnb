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

// POST /api/exchanges/[id]/identity-verification - Start ID verificatie
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

    // Controleer of de uitwisseling bevestigd is
    if (exchange.status !== "confirmed") {
      return NextResponse.json({ error: "Exchange must be confirmed before identity verification" }, { status: 400 })
    }

    // Bepaal welke rol de gebruiker heeft
    const isRequester = exchange.requester_id === session.user.id
    const verificationField = isRequester
      ? "requester_identity_verification_status"
      : "host_identity_verification_status"
    const sessionField = isRequester ? "requester_identity_session_id" : "host_identity_session_id"

    // Controleer of de verificatie al is gedaan
    if (exchange[verificationField] === "verified") {
      return NextResponse.json({ error: "Identity verification already completed" }, { status: 400 })
    }

    // In een echte applicatie zou hier de Stripe Identity sessie worden aangemaakt
    // Voor deze demo simuleren we het proces
    const mockSessionId = `is_${Math.random().toString(36).substr(2, 9)}`

    // Update de sessie ID
    await executeQuery(`UPDATE exchanges SET ${sessionField} = $1 WHERE id = $2`, [mockSessionId, exchangeId])

    // Simuleer verificatie na 3 seconden (in productie zou dit via webhook gebeuren)
    setTimeout(async () => {
      try {
        await executeQuery(`UPDATE exchanges SET ${verificationField} = $1 WHERE id = $2`, ["verified", exchangeId])
      } catch (error) {
        console.error("Error updating verification status:", error)
      }
    }, 3000)

    return NextResponse.json({
      sessionId: mockSessionId,
      redirectUrl: `/exchanges/${exchangeId}?verification=success`,
    })
  } catch (error) {
    console.error("Error starting identity verification:", error)
    return NextResponse.json({ error: "Failed to start identity verification" }, { status: 500 })
  }
}
