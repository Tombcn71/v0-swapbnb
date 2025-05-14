import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Haal de woning op met eigenaar informatie
    const home = await sql`
      SELECT h.*, 
        u.id as owner_id, 
        u.name as owner_name, 
        u.email as owner_email
        FROM homes h
        LEFT JOIN users u ON h.user_id = u.id
        WHERE h.id = ${id}
    `

    if (!home || home.length === 0) {
      return NextResponse.json({ error: "Woning niet gevonden" }, { status: 404 })
    }

    // Haal beschikbaarheid op
    const availability = await sql`
      SELECT * FROM availability WHERE home_id = ${id}
    `

    // Haal reviews op met gebruikersinformatie
    const reviews = await sql`
      SELECT r.*, 
        u.id as user_id, 
        u.name as user_name
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.home_id = ${id}
    `

    return NextResponse.json({
      home: home[0],
      availability,
      reviews,
    })
  } catch (error) {
    console.error("Error fetching home:", error)
    return NextResponse.json({ error: "Er is een fout opgetreden bij het ophalen van de woning" }, { status: 500 })
  }
}
