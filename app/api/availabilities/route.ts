import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
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

    const availabilities = await sql`
      SELECT 
        id, 
        home_id as "homeId", 
        start_date as "startDate", 
        end_date as "endDate", 
        status
      FROM availabilities 
      WHERE home_id = ${homeId} 
      ORDER BY start_date ASC
    `

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

    const body = await request.json()
    const { homeId, startDate, endDate } = body

    // Valideer input
    if (!homeId || !startDate || !endDate) {
      return NextResponse.json(
        {
          error: "Home ID, start date, and end date are required",
          received: { homeId, startDate, endDate },
        },
        { status: 400 },
      )
    }

    console.log(`Creating availability for home ${homeId}: ${startDate} to ${endDate}`)

    // Controleer of de woning bestaat en van de gebruiker is
    const homes = await sql`
      SELECT * FROM homes WHERE id = ${homeId} AND user_id = ${session.user.id}
    `

    if (!homes || homes.length === 0) {
      return NextResponse.json({ error: "Home not found or you are not the owner" }, { status: 404 })
    }

    // Controleer of er overlappende beschikbaarheden zijn
    const overlapping = await sql`
      SELECT * FROM availabilities 
      WHERE home_id = ${homeId} 
      AND (
        (start_date <= ${startDate} AND end_date >= ${startDate}) 
        OR (start_date <= ${endDate} AND end_date >= ${endDate}) 
        OR (start_date >= ${startDate} AND end_date <= ${endDate})
      )
    `

    if (overlapping && overlapping.length > 0) {
      return NextResponse.json({ error: "Overlapping availability periods" }, { status: 400 })
    }

    // Maak de beschikbaarheid aan
    const result = await sql`
      INSERT INTO availabilities (home_id, start_date, end_date, status) 
      VALUES (${homeId}, ${startDate}, ${endDate}, 'available') 
      RETURNING 
        id, 
        home_id as "homeId", 
        start_date as "startDate", 
        end_date as "endDate", 
        status
    `

    console.log(`Created availability: ${JSON.stringify(result[0])}`)

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating availability:", error)
    return NextResponse.json(
      {
        error: "Failed to create availability",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
