import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import Stripe from "stripe"

// Webhook handler voor Stripe events
export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("Missing Stripe environment variables")
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })

    // Haal de signature header op
    const signature = request.headers.get("stripe-signature")
    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
    }

    // Haal de raw body op
    const body = await request.text()

    // Verifieer de webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err: any) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: `Webhook signature verification failed` }, { status: 400 })
    }

    // Handle verschillende event types
    switch (event.type) {
      case "identity.verification_session.verified": {
        // Verificatie succesvol
        const session = event.data.object as Stripe.Identity.VerificationSession
        const { exchange_id, user_role } = session.metadata as { exchange_id: string; user_role: string }

        // Update de verificatie status
        const identityField =
          user_role === "requester" ? "requester_identity_verification_status" : "host_identity_verification_status"
        await executeQuery(`UPDATE exchanges SET ${identityField} = $1 WHERE id = $2`, ["verified", exchange_id])

        console.log(`Identity verified for exchange ${exchange_id}, role: ${user_role}`)
        break
      }

      case "identity.verification_session.requires_input": {
        // Verificatie vereist extra input
        const session = event.data.object as Stripe.Identity.VerificationSession
        const { exchange_id, user_role } = session.metadata as { exchange_id: string; user_role: string }

        // Update de verificatie status
        const identityField =
          user_role === "requester" ? "requester_identity_verification_status" : "host_identity_verification_status"
        await executeQuery(`UPDATE exchanges SET ${identityField} = $1 WHERE id = $2`, ["pending", exchange_id])

        console.log(`Identity verification requires input for exchange ${exchange_id}, role: ${user_role}`)
        break
      }

      case "checkout.session.completed": {
        // Betaling succesvol
        const session = event.data.object as Stripe.Checkout.Session
        const { exchange_id, user_role } = session.metadata as { exchange_id: string; user_role: string }

        // Update de betaling status
        const paymentField = user_role === "requester" ? "requester_payment_status" : "host_payment_status"
        await executeQuery(`UPDATE exchanges SET ${paymentField} = $1 WHERE id = $2`, ["paid", exchange_id])

        console.log(`Payment completed for exchange ${exchange_id}, role: ${user_role}`)

        // Controleer of de exchange nu voltooid kan worden
        const exchanges = await executeQuery("SELECT * FROM exchanges WHERE id = $1", [exchange_id])
        if (exchanges.length > 0) {
          const exchange = exchanges[0]
          if (
            exchange.requester_identity_verification_status === "verified" &&
            exchange.host_identity_verification_status === "verified" &&
            exchange.requester_payment_status === "paid" &&
            exchange.host_payment_status === "paid"
          ) {
            // Markeer de exchange als voltooid
            await executeQuery("UPDATE exchanges SET status = $1, completed_at = NOW() WHERE id = $2", [
              "completed",
              exchange_id,
            ])
            console.log(`Exchange ${exchange_id} marked as completed`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error(`Error handling webhook: ${error.message}`)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
