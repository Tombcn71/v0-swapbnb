import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET /api/exchanges - Haal uitwisselingen op
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const type = url.searchParams.get("type") // 'sent' of 'received'

    let query = `
  SELECT e.*, 
         rh.title as home_title, 
         rh.city as home_city, 
         rh.images as home_images,
         hh.title as host_home_title,
         hh.city as host_home_city,
         ru.id as requester_id,
         ru.name as requester_name, 
         ru.profile_image as requester_profile_image,
         hu.id as host_id,
         hu.name as host_name, 
         hu.profile_image as host_profile_image
  FROM exchanges e
  JOIN homes rh ON e.requester_home_id = rh.id
  JOIN homes hh ON e.host_home_id = hh.id
  JOIN users ru ON e.requester_id = ru.id
  JOIN users hu ON e.host_id = hu.id
`

    const params: any[] = []
    const paramIndex = 1

    if (type === "sent") {
      query += ` WHERE e.requester_id = $1`
      params.push(session.user.id)
    } else if (type === "received") {
      query += ` WHERE e.host_id = $1`
      params.push(session.user.id)
    } else {
      query += ` WHERE e.requester_id = $1 OR e.host_id = $1`
      params.push(session.user.id)
    }

    query += " ORDER BY e.created_at DESC"

    const exchanges = await executeQuery(query, params)

    // Voeg een veld toe om aan te geven of de huidige gebruiker de eigenaar is
    const exchangesWithOwnerFlag = exchanges.map((exchange: any) => ({
      ...exchange,
      isOwner: exchange.owner_id === session.user.id,
      home_image: exchange.home_images && exchange.home_images.length > 0 ? exchange.home_images[0] : null,
    }))

    return NextResponse.json(exchangesWithOwnerFlag)
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

    const { homeId, ownerId, startDate, endDate, guests, message } = await request.json()

    // Valideer input
    if (!homeId || !ownerId || !startDate || !endDate || !guests || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Controleer of de woning bestaat
    const homes = await executeQuery("SELECT * FROM homes WHERE id = $1", [homeId])

    if (homes.length === 0) {
      return NextResponse.json({ error: "Home not found" }, { status: 404 })
    }

    // Controleer of de eigenaar bestaat
    const owners = await executeQuery("SELECT * FROM users WHERE id = $1", [ownerId])

    if (owners.length === 0) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 })
    }

    // Controleer of de gebruiker niet zijn eigen woning probeert te boeken
    if (session.user.id === ownerId) {
      return NextResponse.json({ error: "You cannot book your own home" }, { status: 400 })
    }

    // Maak de uitwisseling aan
    const result = await executeQuery(
      `INSERT INTO exchanges 
       (home_id, guest_id, start_date, end_date, guests, message, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [homeId, session.user.id, startDate, endDate, guests, message, "pending"],
    )

    // Stuur een bericht naar de eigenaar
    await executeQuery(
      `INSERT INTO messages 
       (sender_id, receiver_id, content, read) 
       VALUES ($1, $2, $3, false)`,
      [
        session.user.id,
        ownerId,
        `Ik heb een aanvraag gedaan voor je woning van ${new Date(startDate).toLocaleDateString()} tot ${new Date(endDate).toLocaleDateString()} voor ${guests} gasten.`,
      ],
    )

    // Haal de volledige uitwisselingsgegevens op
    const exchanges = await executeQuery(
      `SELECT e.*, 
              h.title as home_title, 
              h.city as home_city,
              h.images as home_images,
              owner.id as owner_id,
              owner.name as owner_name, 
              owner.profile_image as owner_profile_image,
              guest.name as guest_name, 
              guest.profile_image as guest_profile_image
       FROM exchanges e
       JOIN homes h ON e.home_id = h.id
       JOIN users owner ON h.user_id = owner.id
       JOIN users guest ON e.guest_id = guest.id
       WHERE e.id = $1`,
      [result[0].id],
    )

    const exchange = {
      ...exchanges[0],
      isOwner: exchanges[0].owner_id === session.user.id,
      home_image: exchanges[0].home_images && exchanges[0].home_images.length > 0 ? exchanges[0].home_images[0] : null,
    }

    return NextResponse.json(exchange, { status: 201 })
  } catch (error) {
    console.error("Error creating exchange:", error)
    return NextResponse.json({ error: "Failed to create exchange" }, { status: 500 })
  }
}
