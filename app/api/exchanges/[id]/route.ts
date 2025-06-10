import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id
    const userId = session.user.id

    const exchanges = await executeQuery(
      `SELECT e.*, 
              rh.title as requester_home_title, rh.city as requester_home_city,
              hh.title as host_home_title, hh.city as host_home_city,
              ru.name as requester_name, ru.profile_image as requester_profile_image,
              hu.name as host_name, hu.profile_image as host_profile_image
       FROM exchanges e
       LEFT JOIN homes rh ON e.requester_home_id = rh.id
       LEFT JOIN homes hh ON e.host_home_id = hh.id
       LEFT JOIN users ru ON e.requester_id = ru.id
       LEFT JOIN users hu ON e.host_id = hu.id
       WHERE e.id = $1 AND (e.requester_id = $2 OR e.host_id = $2)`,
      [exchangeId, userId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    return NextResponse.json(exchanges[0])
  } catch (error) {
    console.error("Error fetching exchange:", error)
    return NextResponse.json({ error: "Failed to fetch exchange" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id
    const userId = session.user.id
    const { status } = await request.json()

    // Controleer toegang
    const exchanges = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, userId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    // Update status
    await executeQuery("UPDATE exchanges SET status = $1, updated_at = NOW() WHERE id = $2", [status, exchangeId])

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error("Error updating exchange:", error)
    return NextResponse.json({ error: "Failed to update exchange" }, { status: 500 })
  }
}
