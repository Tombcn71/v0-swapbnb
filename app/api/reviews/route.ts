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

// GET /api/reviews - Haal reviews op
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const homeId = url.searchParams.get("homeId")
    const exchangeId = url.searchParams.get("exchangeId")

    let reviews = []

    if (homeId) {
      // Controleer of de home ID een geldige UUID is
      if (!isValidUUID(homeId)) {
        console.error("Invalid UUID format for home ID:", homeId)
        return NextResponse.json({ error: "Invalid home ID format" }, { status: 400 })
      }

      // Haal reviews op voor een specifieke woning
      reviews = await executeQuery(
        `SELECT r.*, u.name as reviewer_name, u.image as reviewer_image
         FROM reviews r
         JOIN users u ON r.reviewer_id = u.id
         WHERE r.home_id = $1
         ORDER BY r.created_at DESC`,
        [homeId],
      )
    } else if (exchangeId) {
      // Controleer of de exchange ID een geldige UUID is
      if (!isValidUUID(exchangeId)) {
        console.error("Invalid UUID format for exchange ID:", exchangeId)
        return NextResponse.json({ error: "Invalid exchange ID format" }, { status: 400 })
      }

      // Haal reviews op voor een specifieke uitwisseling
      reviews = await executeQuery(
        `SELECT r.*, u.name as reviewer_name, u.image as reviewer_image, h.title as home_title
         FROM reviews r
         JOIN users u ON r.reviewer_id = u.id
         JOIN homes h ON r.home_id = h.id
         WHERE r.exchange_id = $1
         ORDER BY r.created_at DESC`,
        [exchangeId],
      )
    } else {
      // Haal alle reviews op
      reviews = await executeQuery(
        `SELECT r.*, u.name as reviewer_name, u.image as reviewer_image, h.title as home_title
         FROM reviews r
         JOIN users u ON r.reviewer_id = u.id
         JOIN homes h ON r.home_id = h.id
         ORDER BY r.created_at DESC`,
      )
    }

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

// POST /api/reviews - Maak een nieuwe review aan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { exchangeId, homeId, rating, comment } = await request.json()

    // Valideer input
    if (!exchangeId || !homeId || !rating || !comment) {
      return NextResponse.json({ error: "Exchange ID, home ID, rating, and comment are required" }, { status: 400 })
    }

    // Controleer of de exchange ID een geldige UUID is
    if (!isValidUUID(exchangeId)) {
      console.error("Invalid UUID format for exchange ID:", exchangeId)
      return NextResponse.json({ error: "Invalid exchange ID format" }, { status: 400 })
    }

    // Controleer of de home ID een geldige UUID is
    if (!isValidUUID(homeId)) {
      console.error("Invalid UUID format for home ID:", homeId)
      return NextResponse.json({ error: "Invalid home ID format" }, { status: 400 })
    }

    // Controleer of de sessie gebruiker ID een geldige UUID is
    if (!isValidUUID(session.user.id)) {
      console.error("Invalid UUID format for session user ID:", session.user.id)
      return NextResponse.json({ error: "Invalid session user ID format" }, { status: 400 })
    }

    // Controleer of de uitwisseling bestaat en voltooid is
    const exchanges = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2) AND status = 'completed'",
      [exchangeId, session.user.id],
    )

    if (exchanges.length === 0) {
      return NextResponse.json(
        { error: "Exchange not found, not completed, or you are not part of it" },
        { status: 404 },
      )
    }

    // Controleer of de woning deel uitmaakt van de uitwisseling
    const exchange = exchanges[0]
    if (exchange.requester_home_id !== homeId && exchange.host_home_id !== homeId) {
      return NextResponse.json({ error: "Home is not part of the exchange" }, { status: 400 })
    }

    // Controleer of de gebruiker al een review heeft geschreven voor deze woning in deze uitwisseling
    const existingReviews = await executeQuery(
      "SELECT * FROM reviews WHERE exchange_id = $1 AND reviewer_id = $2 AND home_id = $3",
      [exchangeId, session.user.id, homeId],
    )

    if (existingReviews.length > 0) {
      return NextResponse.json({ error: "You have already reviewed this home for this exchange" }, { status: 400 })
    }

    // Maak de review aan
    const result = await executeQuery(
      `INSERT INTO reviews 
       (exchange_id, reviewer_id, home_id, rating, comment) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [exchangeId, session.user.id, homeId, rating, comment],
    )

    // Haal de volledige reviewgegevens op
    const reviews = await executeQuery(
      `SELECT r.*, u.name as reviewer_name, u.image as reviewer_image, h.title as home_title
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       JOIN homes h ON r.home_id = h.id
       WHERE r.id = $1`,
      [result[0].id],
    )

    return NextResponse.json(reviews[0], { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
