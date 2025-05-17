import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Directe database verbinding
const db = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const homeId = url.searchParams.get("homeId")

    if (!homeId) {
      return NextResponse.json({ error: "Home ID is required" }, { status: 400 })
    }

    console.log(`Testing if home ${homeId} exists...`)

    // Methode 1: Directe SQL query met prepared statement
    const homes = await db.query(`SELECT * FROM homes WHERE id = $1`, [homeId])

    console.log(`Method 1 result: ${homes.length} homes found`)

    // Methode 2: Directe SQL query met string
    const directHomes = await db.query(`SELECT * FROM homes WHERE id = '${homeId}'`)

    console.log(`Method 2 result: ${directHomes.length} homes found`)

    return NextResponse.json({
      method1: {
        found: homes.length > 0,
        homes: homes,
      },
      method2: {
        found: directHomes.length > 0,
        homes: directHomes,
      },
    })
  } catch (error) {
    console.error("Error testing home:", error)
    return NextResponse.json(
      {
        error: "Failed to test home",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
