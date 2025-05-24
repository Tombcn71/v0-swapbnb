import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Functie om te controleren of een string een geldige UUID is
const isValidUUID = (id: string) => {
  if (!id) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// POST /api/exchanges - Maak een nieuwe uitwisseling aan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { hostHomeId, requesterHomeId, startDate, endDate, message } = await request.json()

    // Valideer de vereiste velden
    if (!hostHomeId || !requesterHomeId || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Controleer of de IDs geldige UUIDs zijn
    if (!isValidUUID(hostHomeId) || !isValidUUID(requesterHomeId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    // Controleer of de gebruiker de eigenaar is van de requesterHome
    const requesterHomes = await executeQuery("SELECT user_id FROM homes WHERE id = $1", [requesterHomeId])

    if (requesterHomes.length === 0) {
      return NextResponse.json({ error: "Requester home not found" }, { status: 404 })
    }

    if (requesterHomes[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "You are not the owner of this home" }, { status: 403 })
    }

    // Controleer of de hostHome bestaat
    const hostHomes = await executeQuery("SELECT user_id FROM homes WHERE id = $1", [hostHomeId])

    if (hostHomes.length === 0) {
      return NextResponse.json({ error: "Host home not found" }, { status: 404 })
    }

    // Controleer of er een chatgeschiedenis is
    const chatHistory = await executeQuery(
      `SELECT COUNT(*) as count
       FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)`,
      [session.user.id, hostHomes[0].user_id],
    )

    if (chatHistory[0].count === 0) {
      return NextResponse.json({ error: "You must chat with the host before creating a swap request" }, { status: 403 })
    }

    // Maak de uitwisseling aan
    const result = await executeQuery(
      `INSERT INTO exchanges 
       (requester_home_id, host_home_id, start_date, end_date, status, message, requester_paid, host_paid) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id`,
      [requesterHomeId, hostHomeId, startDate, endDate, "pending", message || null, false, false],
    )

    return NextResponse.json({ id: result[0].id, status: "pending" })
  } catch (error) {
    console.error("Error creating exchange:", error)
    return NextResponse.json({ error: "Failed to create exchange" }, { status: 500 })
  }
}

// GET /api/exchanges - Haal uitwisselingen op
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const role = url.searchParams.get("role") // 'requester' of 'host'

    let query = `
      SELECT e.*, 
             rh.title as requester_home_title, rh.city as requester_home_city, rh.image_url as requester_home_image,
             hh.title as host_home_title, hh.city as host_home_city, hh.image_url as host_home_image,
             ru.name as requester_name, hu.name as host_name
      FROM exchanges e
      JOIN homes rh ON e.requester_home_id = rh.id
      JOIN homes hh ON e.host_home_id = hh.id
      JOIN users ru ON rh.user_id = ru.id
      JOIN users hu ON hh.user_id = hu.id
      WHERE (rh.user_id = $1 OR hh.user_id = $1)
    `

    const params = [session.user.id]

    if (status) {
      query += ` AND e.status = $${params.length + 1}`
      params.push(status)
    }

    if (role === "requester") {
      query += ` AND rh.user_id = $1`
    } else if (role === "host") {
      query += ` AND hh.user_id = $1`
    }

    query += ` ORDER BY e.created_at DESC`

    const exchanges = await executeQuery(query, params)

    return NextResponse.json(exchanges)
  } catch (error) {
    console.error("Error fetching exchanges:", error)
    return NextResponse.json({ error: "Failed to fetch exchanges" }, { status: 500 })
  }
}
