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

// GET /api/exchanges - Haal uitwisselingen op
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Controleer of de gebruiker ID een geldige UUID is
    if (!isValidUUID(userId)) {
      console.error("Invalid UUID format for user ID:", userId)
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    // Haal uitwisselingen op waarbij de gebruiker betrokken is
    const exchanges = await executeQuery(
      `SELECT e.*, 
              rh.title as requester_home_title, rh.city as requester_home_city, 
              hh.title as host_home_title, hh.city as host_home_city,
              ru.name as requester_name, hu.name as host_name
       FROM exchanges e
       JOIN homes rh ON e.requester_home_id = rh.id
       JOIN homes hh ON e.host_home_id = hh.id
       JOIN users ru ON e.requester_id = ru.id
       JOIN users hu ON e.host_id = hu.id
       WHERE e.requester_id = $1 OR e.host_id = $1
       ORDER BY e.created_at DESC`,
      [userId],
    )

    return NextResponse.json(exchanges)
  } catch (error) {
    console.error("Error fetching exchanges:", error)
    return NextResponse.json({ error: "Failed to fetch exchanges" }, { status: 500 })
  }
}

// POST /api/exchanges - Maak een nieuwe uitwisseling aan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { hostHomeId, requesterHomeId, startDate, endDate, message } = await request.json()

    // Valideer input
    if (!hostHomeId || !requesterHomeId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Host home ID, requester home ID, start date, and end date are required" },
        { status: 400 },
      )
    }

    const userId = session.user.id

    // Controleer of de gebruiker ID een geldige UUID is
    if (!isValidUUID(userId)) {
      console.error("Invalid UUID format for user ID:", userId)
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    // Controleer of de home IDs geldige UUIDs zijn
    if (!isValidUUID(hostHomeId) || !isValidUUID(requesterHomeId)) {
      console.error("Invalid UUID format for home IDs:", { hostHomeId, requesterHomeId })
      return NextResponse.json({ error: "Invalid home ID format" }, { status: 400 })
    }

    // Haal de host ID op van de host woning
    const hostHomes = await executeQuery("SELECT owner_id FROM homes WHERE id = $1", [hostHomeId])

    if (hostHomes.length === 0) {
      return NextResponse.json({ error: "Host home not found" }, { status: 404 })
    }

    const hostId = hostHomes[0].owner_id

    // Controleer of de gebruiker de eigenaar is van de requester woning
    const requesterHomes = await executeQuery("SELECT * FROM homes WHERE id = $1 AND owner_id = $2", [
      requesterHomeId,
      userId,
    ])

    if (requesterHomes.length === 0) {
      return NextResponse.json(
        { error: "You are not the owner of the requester home or the home does not exist" },
        { status: 403 },
      )
    }

    // Controleer of de woning beschikbaar is voor de opgegeven data
    const availabilities = await executeQuery(
      "SELECT * FROM availabilities WHERE home_id = $1 AND start_date <= $2 AND end_date >= $3",
      [hostHomeId, startDate, endDate],
    )

    if (availabilities.length === 0) {
      return NextResponse.json({ error: "The host home is not available for the selected dates" }, { status: 400 })
    }

    // Maak de uitwisseling aan
    const result = await executeQuery(
      `INSERT INTO exchanges 
       (requester_id, host_id, requester_home_id, host_home_id, start_date, end_date, status, message) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [userId, hostId, requesterHomeId, hostHomeId, startDate, endDate, "pending", message || ""],
    )

    // Haal de volledige uitwisselingsgegevens op
    const exchange = await executeQuery(
      `SELECT e.*, 
              rh.title as requester_home_title, rh.city as requester_home_city, 
              hh.title as host_home_title, hh.city as host_home_city,
              ru.name as requester_name, hu.name as host_name
       FROM exchanges e
       JOIN homes rh ON e.requester_home_id = rh.id
       JOIN homes hh ON e.host_home_id = hh.id
       JOIN users ru ON e.requester_id = ru.id
       JOIN users hu ON e.host_id = hu.id
       WHERE e.id = $1`,
      [result[0].id],
    )

    return NextResponse.json(exchange[0], { status: 201 })
  } catch (error) {
    console.error("Error creating exchange:", error)
    return NextResponse.json({ error: "Failed to create exchange" }, { status: 500 })
  }
}
