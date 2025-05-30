import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Stripe from "stripe"

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
    const identityField = isRequester ? "requester_identity_verification_status" : "host_identity_verification_status"

    // Controleer of de verificatie al is gedaan
    if (exchange[identityField] === "verified") {
      return NextResponse.json({ error: "Identity already verified" }, { status: 400 })
    }

    // Correcte Stripe Identity implementatie volgens de docs
    // https://stripe.com/docs/identity/verify-identity-documents

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable")
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16", // Gebruik de meest recente API versie
    })

    // 1. Maak een VerificationSession aan
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: "document",
      options: {
        document: {
          allowed_types: ["driving_license", "id_card", "passport"],
          require_matching_selfie: true,
          require_live_capture: true,
        },
      },
      metadata: {
        exchange_id: exchangeId,
        user_id: session.user.id,
        user_role: isRequester ? "requester" : "host",
      },
      return_url: `${process.env.NEXTAUTH_URL}/exchanges/${exchangeId}?verification_complete=true`,
    })

    // 2. Sla de verificatie sessie ID op
    const sessionField = isRequester ? "requester_identity_session_id" : "host_identity_session_id"
    await executeQuery(`UPDATE exchanges SET ${sessionField} = $1 WHERE id = $2`, [verificationSession.id, exchangeId])

    // 3. Stuur de client_secret en URL terug naar de client
    return NextResponse.json({
      url: verificationSession.url,
      client_secret: verificationSession.client_secret,
      id: verificationSession.id,
    })

    // 4. De webhook handler (in een aparte route) zal de verificatie status updaten
    // wanneer Stripe een event stuurt (zie app/api/webhooks/stripe/route.ts)
  } catch (error: any) {
    console.error("Error creating identity verification session:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create identity verification session" },
      { status: 500 },
    )
  }
}
