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

    // Directe query zonder complexiteit
    const result = await sql`
      SELECT id, home_id, start_date, end_date, status
      FROM availabilities 
      WHERE home_id = ${homeId}
      ORDER BY start_date ASC
    `

    // Transformeer de resultaten naar camelCase voor frontend
    const availabilities = result.rows.map((row) => ({
      id: row.id,
      homeId: row.home_id,
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
    }))

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

    if (!homeId || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Format dates for PostgreSQL
    const formattedStartDate = new Date(startDate).toISOString().split("T")[0]
    const formattedEndDate = new Date(endDate).toISOString().split("T")[0]

    // Test query om te zien of de woning bestaat
    console.log(`Testing if home ${homeId} exists...`)
    const testQuery = `SELECT id, user_id FROM homes WHERE id = '${homeId}'`
    console.log(`Test query: ${testQuery}`)

    // Directe query zonder parameters om te debuggen
    const directResult = await sql.unsafe(testQuery)
    console.log(`Direct query result: ${JSON.stringify(directResult.rows)}`)

    if (directResult.rows.length === 0) {
      return NextResponse.json({ error: "Home not found (direct query)" }, { status: 404 })
    }

    // Stap 1: Controleer of de woning bestaat met parameterized query
    const homeCheck = await sql`SELECT id, user_id FROM homes WHERE id = ${homeId}`
    console.log(`Parameterized query result: ${JSON.stringify(homeCheck.rows)}`)

    if (homeCheck.rows.length === 0) {
      return NextResponse.json({ error: "Home not found (parameterized)" }, { status: 404 })
    }

    // Stap 2: Controleer of de gebruiker de eigenaar is
    const home = homeCheck.rows[0]
    if (home.user_id !== session.user.id) {
      return NextResponse.json(
        {
          error: "You are not the owner of this home",
          homeOwnerId: home.user_id,
          sessionUserId: session.user.id,
        },
        { status: 403 },
      )
    }

    // Stap 3: Controleer op overlappende beschikbaarheden
    const overlapCheck = await sql`
      SELECT id FROM availabilities 
      WHERE home_id = ${homeId}
      AND (
        (start_date <= ${formattedStartDate}::date AND end_date >= ${formattedStartDate}::date) 
        OR (start_date <= ${formattedEndDate}::date AND end_date >= ${formattedEndDate}::date) 
        OR (start_date >= ${formattedStartDate}::date AND end_date <= ${formattedEndDate}::date)
      )
    `

    if (overlapCheck.rows.length > 0) {
      return NextResponse.json({ error: "Overlapping availability periods" }, { status: 400 })
    }

    // Stap 4: Voeg de beschikbaarheid toe
    const insertResult = await sql`
      INSERT INTO availabilities (home_id, start_date, end_date, status) 
      VALUES (${homeId}, ${formattedStartDate}::date, ${formattedEndDate}::date, 'available') 
      RETURNING id, home_id, start_date, end_date, status
    `

    if (insertResult.rows.length === 0) {
      throw new Error("Failed to create availability")
    }

    // Transformeer het resultaat naar camelCase voor frontend
    const newAvailability = {
      id: insertResult.rows[0].id,
      homeId: insertResult.rows[0].home_id,
      startDate: insertResult.rows[0].start_date,
      endDate: insertResult.rows[0].end_date,
      status: insertResult.rows[0].status,
    }

    return NextResponse.json(newAvailability, { status: 201 })
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
