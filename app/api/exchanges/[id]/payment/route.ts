import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id
    const userId = session.user.id

    // Haal exchange en gebruiker gegevens op
    const exchanges = await executeQuery(
      `SELECT e.*, u.verification_status, u.stripe_customer_id 
       FROM exchanges e
       JOIN users u ON (u.id = e.requester_id OR u.id = e.host_id)
       WHERE e.id = $1 AND u.id = $2`,
      [exchangeId, userId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found or access denied" }, { status: 404 })
    }

    const exchange = exchanges[0]

    // Controleer verificatie status
    if (exchange.verification_status !== "verified") {
      return NextResponse.json(
        {
          error: "Identity verification required before payment",
          requiresVerification: true,
        },
        { status: 400 },
      )
    }

    // Controleer exchange status
    if (exchange.status !== "accepted") {
      return NextResponse.json({ error: "Exchange must be accepted before payment" }, { status: 400 })
    }

    // Bepaal of gebruiker requester of host is
    const isRequester = exchange.requester_id === userId
    const paymentStatusField = isRequester ? "requester_payment_status" : "host_payment_status"
    const paymentIntentField = isRequester ? "requester_payment_intent_id" : "host_payment_intent_id"

    // Controleer of al betaald
    if (exchange[paymentStatusField] === "paid") {
      return NextResponse.json({ error: "Payment already completed" }, { status: 400 })
    }

    // Maak of haal Stripe customer op
    let customerId = exchange.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: session.user.name!,
        metadata: { user_id: userId },
      })
      customerId = customer.id

      await executeQuery("UPDATE users SET stripe_customer_id = $1 WHERE id = $2", [customerId, userId])
    }

    // Maak payment intent aan
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round((exchange.service_fee || 25) * 100), // Convert to cents
      currency: "eur",
      customer: customerId,
      metadata: {
        exchange_id: exchangeId,
        user_id: userId,
        user_role: isRequester ? "requester" : "host",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Update exchange met payment intent
    await executeQuery(`UPDATE exchanges SET ${paymentIntentField} = $1 WHERE id = $2`, [paymentIntent.id, exchangeId])

    // Log payment
    await executeQuery(
      `INSERT INTO payment_logs (exchange_id, user_id, payment_intent_id, amount, status) 
       VALUES ($1, $2, $3, $4, $5)`,
      [exchangeId, userId, paymentIntent.id, exchange.service_fee || 25, "created"],
    )

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
