import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const endpointSecret = process.env.STRIPE_VERIFICATION_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    if (event.type === "identity.verification_session.verified") {
      const verificationSession = event.data.object as Stripe.Identity.VerificationSession
      const userId = verificationSession.metadata?.user_id

      if (userId) {
        // Update gebruiker verificatie status
        await executeQuery(
          `UPDATE users 
           SET verification_status = $1, 
               verification_date = NOW(), 
               stripe_verification_id = $2 
           WHERE id = $3`,
          ["verified", verificationSession.id, userId],
        )

        // Log de verificatie
        await executeQuery(
          `INSERT INTO verification_logs (user_id, verification_session_id, status) 
           VALUES ($1, $2, $3)`,
          [userId, verificationSession.id, "verified"],
        )
      }
    } else if (event.type === "identity.verification_session.requires_input") {
      const verificationSession = event.data.object as Stripe.Identity.VerificationSession
      const userId = verificationSession.metadata?.user_id

      if (userId) {
        await executeQuery("UPDATE users SET verification_status = $1 WHERE id = $2", ["failed", userId])

        await executeQuery(
          `INSERT INTO verification_logs (user_id, verification_session_id, status) 
           VALUES ($1, $2, $3)`,
          [userId, verificationSession.id, "failed"],
        )
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing verification webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
