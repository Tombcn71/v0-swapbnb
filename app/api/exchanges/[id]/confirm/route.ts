import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import Stripe from "stripe"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, role } = await request.json()
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id

    // Get the exchange
    const exchange = await db.exchange.findUnique({
      where: { id: exchangeId },
      include: {
        guest: true,
        host: true,
      },
    })

    if (!exchange) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    // Check if the user is part of this exchange
    if (exchange.guestId !== userId && exchange.hostId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the exchange is in the right status
    if (exchange.status !== "approved") {
      return NextResponse.json({ error: "Exchange is not in approved status" }, { status: 400 })
    }

    const isHost = role === "host"
    const isGuest = role === "guest"

    // Check if the user has already confirmed
    if ((isHost && exchange.hostConfirmed) || (isGuest && exchange.guestConfirmed)) {
      return NextResponse.json({ error: "You have already confirmed this exchange" }, { status: 400 })
    }

    // Check if the user has enough credits or needs to pay
    const userCredits = await db.credit.findMany({
      where: {
        userId: userId,
        status: "active",
      },
    })

    const availableCredits = userCredits.length
    const needsCredits = true // Always require 1 credit per swap

    // If the user needs credits but doesn't have any, create a checkout session
    if (needsCredits && availableCredits < 1) {
      // Get the host URL from the request
      const headersList = headers()
      const host = headersList.get("host") || ""
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
      const baseUrl = `${protocol}://${host}`

      // Create a checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID_CREDITS,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/exchanges/${exchangeId}?payment=success`,
        cancel_url: `${baseUrl}/exchanges/${exchangeId}?payment=canceled`,
        metadata: {
          exchangeId,
          userId,
          role,
          type: "swap_payment",
        },
      })

      return NextResponse.json({ checkoutUrl: checkoutSession.url })
    }

    // If the user has enough credits, use one
    if (needsCredits && availableCredits >= 1) {
      // Use one credit
      const creditToUse = userCredits[0]
      await db.credit.update({
        where: { id: creditToUse.id },
        data: {
          status: "used",
          usedAt: new Date(),
          usedForExchangeId: exchangeId,
        },
      })
    }

    // Update the exchange
    const updateData: any = {}
    if (isHost) {
      updateData.hostConfirmed = true
      updateData.hostConfirmedAt = new Date()
    } else if (isGuest) {
      updateData.guestConfirmed = true
      updateData.guestConfirmedAt = new Date()
    }

    // If both parties have confirmed, update the status to completed
    if ((isHost && exchange.guestConfirmed) || (isGuest && exchange.hostConfirmed)) {
      updateData.status = "completed"
      updateData.completedAt = new Date()
    }

    await db.exchange.update({
      where: { id: exchangeId },
      data: updateData,
    })

    // Add a system message about the confirmation
    await db.message.create({
      data: {
        exchangeId,
        senderId: userId,
        content: `${isHost ? "Host" : "Guest"} heeft de swap bevestigd.`,
        isSystemMessage: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error confirming exchange:", error)
    return NextResponse.json({ error: `Error confirming exchange: ${error.message}` }, { status: 500 })
  }
}
