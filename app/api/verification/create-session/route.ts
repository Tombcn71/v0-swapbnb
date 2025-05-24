import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Controleer of gebruiker al geverifieerd is
    const users = await executeQuery("SELECT verification_status FROM users WHERE id = $1", [userId])

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (users[0].verification_status === "verified") {
      return NextResponse.json({ error: "User already verified" }, { status: 400 })
    }

    // Maak Stripe verificatie sessie aan
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: {
        user_id: userId,
      },
      return_url: `${process.env.NEXTAUTH_URL}/verification-complete`,
    })

    // Log de verificatie poging
    await executeQuery(
      `INSERT INTO verification_logs (user_id, verification_session_id, status) 
       VALUES ($1, $2, $3)`,
      [userId, verificationSession.id, "created"],
    )

    // Update gebruiker status naar pending
    await executeQuery("UPDATE users SET verification_status = $1 WHERE id = $2", ["pending", userId])

    return NextResponse.json({
      client_secret: verificationSession.client_secret,
      verification_session_id: verificationSession.id,
    })
  } catch (error) {
    console.error("Error creating verification session:", error)
    return NextResponse.json({ error: "Failed to create verification session" }, { status: 500 })
  }
}
