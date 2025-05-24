import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const endpointSecret = process.env.STRIPE_PAYMENT_WEBHOOK_SECRET!

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

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const { exchange_id, user_id, user_role } = paymentIntent.metadata

      if (exchange_id && user_id && user_role) {
        // Update payment status
        const paymentStatusField = user_role === "requester" ? "requester_payment_status" : "host_payment_status"

        await executeQuery(`UPDATE exchanges SET ${paymentStatusField} = $1 WHERE id = $2`, ["paid", exchange_id])

        // Log successful payment
        await executeQuery(
          `UPDATE payment_logs 
           SET status = $1, updated_at = NOW() 
           WHERE payment_intent_id = $2`,
          ["paid", paymentIntent.id],
        )

        // Check if both parties have paid
        const exchanges = await executeQuery(
          "SELECT requester_payment_status, host_payment_status FROM exchanges WHERE id = $1",
          [exchange_id],
        )

        if (exchanges.length > 0) {
          const exchange = exchanges[0]
          if (exchange.requester_payment_status === "paid" && exchange.host_payment_status === "paid") {
            // Both parties paid, confirm the exchange
            await executeQuery("UPDATE exchanges SET status = $1 WHERE id = $2", ["confirmed", exchange_id])
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing payment webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
