import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import Stripe from "stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Controleer of gebruiker al geverifieerd is
    const users = await executeQuery("SELECT identity_verification_status FROM users WHERE id = $1", [session.user.id])

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (users[0].identity_verification_status === "verified") {
      return NextResponse.json({ error: "Already verified" }, { status: 400 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable")
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })

    // Bouw een geldige return URL op basis van de request
    const protocol = request.headers.get("x-forwarded-proto") || "https"
    const host = request.headers.get("host")

    if (!host) {
      throw new Error("Unable to determine host for return URL")
    }

    const returnUrl = `${protocol}://${host}/onboarding?step=verification&verification_complete=true`

    console.log("Using return URL:", returnUrl)

    // Maak een VerificationSession aan voor profiel verificatie
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
        user_id: session.user.id,
        verification_type: "profile",
      },
      return_url: returnUrl,
    })

    // Sla de verificatie sessie ID op
    await executeQuery(
      "UPDATE users SET identity_verification_status = $1, stripe_verification_session_id = $2 WHERE id = $3",
      ["pending", verificationSession.id, session.user.id],
    )

    return NextResponse.json({
      url: verificationSession.url,
      client_secret: verificationSession.client_secret,
      id: verificationSession.id,
    })
  } catch (error: any) {
    console.error("Error creating profile verification session:", error)
    return NextResponse.json({ error: error.message || "Failed to create verification session" }, { status: 500 })
  }
}
