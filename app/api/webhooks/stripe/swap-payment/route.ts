import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { executeQuery } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handlePaymentSuccess(event.data.object as Stripe.Checkout.Session)
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  const exchangeId = session.metadata?.exchange_id
  const userId = session.metadata?.user_id
  const confirmationType = session.metadata?.confirmation_type

  if (!exchangeId || !userId || !confirmationType) {
    console.error("Missing metadata in payment session")
    return
  }

  try {
    // Mark user as confirmed
    const confirmationField = confirmationType === "requester" ? "requester_confirmed" : "host_confirmed"
    await executeQuery(`UPDATE exchanges SET ${confirmationField} = true WHERE id = $1`, [exchangeId])

    // Check if both parties confirmed
    const exchange = await executeQuery("SELECT * FROM exchanges WHERE id = $1", [exchangeId])
    const bothConfirmed = exchange[0].requester_confirmed && exchange[0].host_confirmed

    if (bothConfirmed) {
      await executeQuery("UPDATE exchanges SET status = 'confirmed', confirmed_at = NOW() WHERE id = $1", [exchangeId])
      console.log(`Exchange ${exchangeId} fully confirmed after payment!`)
    }

    console.log(`Payment successful for exchange ${exchangeId}, user ${userId}`)
  } catch (error) {
    console.error("Error processing payment confirmation:", error)
  }
}
