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
      case "identity.verification_session.verified":
        await handleVerificationVerified(event.data.object as Stripe.Identity.VerificationSession)
        break
      case "identity.verification_session.requires_input":
        await handleVerificationRequiresInput(event.data.object as Stripe.Identity.VerificationSession)
        break
      case "identity.verification_session.processing":
        await handleVerificationProcessing(event.data.object as Stripe.Identity.VerificationSession)
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

async function handleVerificationVerified(session: Stripe.Identity.VerificationSession) {
  const userId = session.metadata?.user_id

  if (!userId) {
    console.error("No user_id in verification session metadata")
    return
  }

  // Update user verification status
  await executeQuery("UPDATE users SET identity_verification_status = $1 WHERE id = $2", ["verified", userId])

  console.log(`User ${userId} identity verification completed successfully`)
}

async function handleVerificationRequiresInput(session: Stripe.Identity.VerificationSession) {
  const userId = session.metadata?.user_id

  if (!userId) {
    console.error("No user_id in verification session metadata")
    return
  }

  // Update user verification status to failed
  await executeQuery("UPDATE users SET identity_verification_status = $1 WHERE id = $2", ["failed", userId])

  console.log(`User ${userId} identity verification requires input`)
}

async function handleVerificationProcessing(session: Stripe.Identity.VerificationSession) {
  const userId = session.metadata?.user_id

  if (!userId) {
    console.error("No user_id in verification session metadata")
    return
  }

  // Update user verification status to pending
  await executeQuery("UPDATE users SET identity_verification_status = $1 WHERE id = $2", ["pending", userId])

  console.log(`User ${userId} identity verification is processing`)
}
