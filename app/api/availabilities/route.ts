import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET /api/availabilities - Haal beschikbaarheden op
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const homeId = url.searchParams.get("homeId")

    if (!homeId) {
      return NextResponse.json({ error: "Home ID is required" }, { status: 400 })
    }

    console.log(`Fetching availabilities for home ID: ${homeId}`) // Debug log

    const availabilities = await executeQuery(
      "SELECT * FROM availabilities WHERE home_id = $1 ORDER BY start_date ASC",
      [homeId],
    )

    console.log(`Found ${availabilities.length} availabilities`) // Debug log

    return NextResponse.json(availabilities)
  } catch (error) {
    console.error("Error fetching availabilities:", error)
    return NextResponse.json({ error: "Failed to fetch availabilities" }, { status: 500 })
  }
}

// POST /api/availabilities - Maak een nieuwe beschikbaarheid aan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { homeId, startDate, endDate } = await request.json()

    // Valideer input
    if (!homeId || !startDate || !endDate) {
      return NextResponse.json({ error: "Home ID, start date, and end date are required" }, { status: 400 })
    }

    // Controleer of de woning bestaat en van de gebruiker is
    const home = await executeQuery("SELECT * FROM homes WHERE id = $1 AND owner_id = $2", [homeId, session.user.id])

    if (home.length === 0) {
      return NextResponse.json({ error: "Home not found or you are not the owner" }, { status: 404 })
    }

    // Controleer of er overlappende beschikbaarheden zijn
    const overlapping = await executeQuery(
      `SELECT * FROM availabilities 
       WHERE home_id = $1 
       AND ((start_date <= $2 AND end_date >= $2) OR (start_date <= $3 AND end_date >= $3) OR (start_date >= $2 AND end_date <= $3))`,
      [homeId, startDate, endDate],
    )

    if (overlapping.length > 0) {
      return NextResponse.json({ error: "Overlapping availability periods" }, { status: 400 })
    }

    // Maak de beschikbaarheid aan
    const result = await executeQuery(
      "INSERT INTO availabilities (home_id, start_date, end_date, status) VALUES ($1, $2, $3, 'available') RETURNING *",
      [homeId, startDate, endDate],
    )

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating availability:", error)
    return NextResponse.json({ error: "Failed to create availability" }, { status: 500 })
  }
}
