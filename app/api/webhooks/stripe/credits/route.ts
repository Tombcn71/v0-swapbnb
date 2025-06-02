import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import Stripe from "stripe"

// Webhook handler voor Stripe credits aankopen
export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Webhook received")

    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("❌ Missing Stripe environment variables")
      throw new Error("Missing Stripe environment variables")
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })

    // Haal de signature header op
    const signature = request.headers.get("stripe-signature")
    if (!signature) {
      console.error("❌ Missing stripe-signature header")
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
    }

    // Haal de raw body op
    const body = await request.text()
    console.log("📄 Webhook body length:", body.length)

    // Verifieer de webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
      console.log("✅ Webhook signature verified")
    } catch (err: any) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: `Webhook signature verification failed` }, { status: 400 })
    }

    console.log(`📧 Received webhook event: ${event.type}`)
    console.log(`🆔 Event ID: ${event.id}`)

    // Handle checkout.session.completed voor credits aankopen
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      console.log(`💳 Processing checkout session: ${session.id}`)
      console.log(`📧 Customer email: ${session.customer_email}`)
      console.log(`🔗 Client reference ID: ${session.client_reference_id}`)
      console.log(`💰 Amount total: ${session.amount_total}`)

      const customerEmail = session.customer_email || session.customer_details?.email

      if (!customerEmail) {
        console.error("❌ No customer email found in session")
        return NextResponse.json({ error: "No customer email" }, { status: 400 })
      }

      console.log(`🔍 Looking for user with email: ${customerEmail}`)

      // Find user by email
      const userResult = await executeQuery("SELECT id, credits, email FROM users WHERE email = $1", [customerEmail])

      if (userResult.length === 0) {
        console.error(`❌ User not found for email: ${customerEmail}`)
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const userId = userResult[0].id
      const currentCredits = userResult[0].credits || 0
      console.log(`👤 Found user: ${userId}, current credits: ${currentCredits}`)

      // Check if transaction already exists (prevent duplicates)
      const existingTransaction = await executeQuery(
        "SELECT id FROM credits_transactions WHERE stripe_session_id = $1",
        [session.id],
      )

      if (existingTransaction.length > 0) {
        console.log(`⚠️ Transaction already processed: ${session.id}`)
        return NextResponse.json({ message: "Transaction already processed" })
      }

      // Determine credits amount based on line items
      let creditsToAdd = 0
      const amountPaid = session.amount_total! / 100 // Convert from cents to euros

      console.log(`💶 Amount paid: €${amountPaid}`)

      // Get line items to determine exact credits purchased
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
        console.log(`📋 Line items count: ${lineItems.data.length}`)

        for (const item of lineItems.data) {
          console.log(`📦 Item: ${item.description}, Price ID: ${item.price?.id}, Quantity: ${item.quantity}`)

          if (
            item.price?.id === process.env.STRIPE_PRICE_ID_CREDITS ||
            item.price?.id === "price_1RVUXGBVKGepSVqC3Js4UMF1"
          ) {
            // This is our credits price - determine credits based on quantity or metadata
            creditsToAdd = item.quantity || 1
            console.log(`✅ Found credits item, adding ${creditsToAdd} credits`)
            break
          }
        }
      } catch (lineItemError) {
        console.error("❌ Error fetching line items:", lineItemError)
      }

      // Fallback: determine credits based on amount if line items don't work
      if (creditsToAdd === 0) {
        console.log("🔄 Using fallback credit calculation based on amount")
        if (amountPaid >= 80) {
          creditsToAdd = 25
        } else if (amountPaid >= 45) {
          creditsToAdd = 12
        } else if (amountPaid >= 20) {
          creditsToAdd = 5
        } else if (amountPaid >= 5) {
          creditsToAdd = 1
        }
        console.log(`💡 Fallback calculation: €${amountPaid} = ${creditsToAdd} credits`)
      }

      if (creditsToAdd > 0) {
        console.log(`➕ Adding ${creditsToAdd} credits to user ${userId}`)

        // Add credits to user
        await executeQuery("UPDATE users SET credits = credits + $1 WHERE id = $2", [creditsToAdd, userId])

        // Record transaction
        await executeQuery(
          `INSERT INTO credits_transactions (user_id, amount, transaction_type, stripe_session_id, description)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            userId,
            creditsToAdd,
            "purchase",
            session.id,
            `Purchased ${creditsToAdd} credits (€${amountPaid}) via Stripe`,
          ],
        )

        console.log(`✅ Successfully added ${creditsToAdd} credits to user ${userId}`)
        console.log(`📊 User credits: ${currentCredits} → ${currentCredits + creditsToAdd}`)
      } else {
        console.error(`❌ Could not determine credits amount for payment of €${amountPaid}`)
      }
    } else {
      console.log(`ℹ️ Ignoring event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error(`💥 Error handling credits webhook: ${error.message}`)
    console.error("Stack trace:", error.stack)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
