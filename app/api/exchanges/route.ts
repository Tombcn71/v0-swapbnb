import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const { title, description, game, platform, capacity, date, time, timezone, userId } = await req.json()

    if (!title || !description || !game || !platform || !capacity || !date || !time || !timezone || !userId) {
      return new NextResponse(JSON.stringify({ error: "Missing required fields" }), { status: 400 })
    }

    const newExchange = await prisma.exchange.create({
      data: {
        title,
        description,
        game,
        platform,
        capacity: Number.parseInt(capacity),
        date,
        time,
        timezone,
        userId,
      },
    })

    // Verstuur notificatie naar host
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/exchanges/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exchangeId: newExchange.id,
          type: "new_request",
        }),
      })
    } catch (error) {
      console.error("Failed to send notification:", error)
    }

    return new NextResponse(JSON.stringify(newExchange), { status: 201 })
  } catch (error) {
    console.error("Error creating exchange:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to create exchange" }), { status: 500 })
  }
}
