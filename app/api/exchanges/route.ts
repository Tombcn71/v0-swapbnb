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

// GET /api/exchanges - Haal alle uitwisselingen op voor de ingelogde gebruiker
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

    // Haal alle uitwisselingen op waar de gebruiker betrokken is
    const exchanges = await executeQuery(
      `SELECT e.*, 
              rh.title as requester_home_title, rh.city as requester_home_city, rh.images as requester_home_images,
              hh.title as host_home_title, hh.city as host_home_city, hh.images as host_home_images,
              ru.name as requester_name, ru.email as requester_email,
              hu.name as host_name, hu.email as host_email
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

    const { requesterHomeId, hostHomeId, hostId, startDate, endDate, guests, message, specialRequests } =
      await request.json()

    // Valideer input
    if (!requesterHomeId || !hostHomeId || !hostId || !startDate || !endDate || !guests || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Controleer of alle IDs geldige UUIDs zijn
    if (!isValidUUID(requesterHomeId) || !isValidUUID(hostHomeId) || !isValidUUID(hostId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const requesterId = session.user.id

    // Controleer of de requester niet zijn eigen huis probeert te ruilen
    if (requesterId === hostId) {
      return NextResponse.json({ error: "You cannot request a swap with yourself" }, { status: 400 })
    }

    // Controleer of de requester eigenaar is van het requester huis
    const requesterHome = await executeQuery("SELECT * FROM homes WHERE id = $1 AND user_id = $2", [
      requesterHomeId,
      requesterId,
    ])

    if (requesterHome.length === 0) {
      return NextResponse.json({ error: "You don't own the selected home" }, { status: 403 })
    }

    // Controleer of het host huis bestaat
    const hostHome = await executeQuery("SELECT * FROM homes WHERE id = $1 AND user_id = $2", [hostHomeId, hostId])

    if (hostHome.length === 0) {
      return NextResponse.json({ error: "Host home not found" }, { status: 404 })
    }

    // Controleer of er al een actieve uitwisseling bestaat tussen deze huizen
    const existingExchange = await executeQuery(
      `SELECT * FROM exchanges 
       WHERE ((requester_home_id = $1 AND host_home_id = $2) OR (requester_home_id = $2 AND host_home_id = $1))
       AND status IN ('pending', 'accepted', 'confirmed')`,
      [requesterHomeId, hostHomeId],
    )

    if (existingExchange.length > 0) {
      return NextResponse.json({ error: "An active exchange already exists between these homes" }, { status: 400 })
    }

    // Controleer of de gebruiker genoeg credits heeft
    const userResult = await executeQuery("SELECT credits FROM users WHERE id = $1", [requesterId])

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userCredits = userResult[0].credits || 0

    if (userCredits < 1) {
      return NextResponse.json(
        { error: "Not enough credits. You need at least 1 credit to request a swap." },
        { status: 400 },
      )
    }

    // Begin een transactie
    await executeQuery("BEGIN")

    try {
      // Maak de nieuwe uitwisseling aan
      const newExchange = await executeQuery(
        `INSERT INTO exchanges (
          requester_id, host_id, requester_home_id, host_home_id, 
          start_date, end_date, guests, message, special_requests,
          status, created_at, updated_at,
          requester_credit_reserved
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', NOW(), NOW(), true)
        RETURNING *`,
        [
          requesterId,
          hostId,
          requesterHomeId,
          hostHomeId,
          startDate,
          endDate,
          guests,
          message,
          specialRequests || null,
        ],
      )

      // Verminder de credits van de gebruiker
      await executeQuery("UPDATE users SET credits = credits - 1 WHERE id = $1", [requesterId])

      // Voeg een credit transactie toe
      await executeQuery(
        `INSERT INTO credits_transactions (
          user_id, amount, transaction_type, description, exchange_id, created_at
        ) VALUES ($1, -1, 'swap_request', 'Credit gebruikt voor swap aanvraag', $2, NOW())`,
        [requesterId, newExchange[0].id],
      )

      // Commit de transactie
      await executeQuery("COMMIT")

      // Haal de volledige uitwisseling op met alle details
      const fullExchange = await executeQuery(
        `SELECT e.*, 
                rh.title as requester_home_title, rh.city as requester_home_city, rh.images as requester_home_images,
                hh.title as host_home_title, hh.city as host_home_city, hh.images as host_home_images,
                ru.name as requester_name, ru.email as requester_email,
                hu.name as host_name, hu.email as host_email
         FROM exchanges e
         JOIN homes rh ON e.requester_home_id = rh.id
         JOIN homes hh ON e.host_home_id = hh.id
         JOIN users ru ON e.requester_id = ru.id
         JOIN users hu ON e.host_id = hu.id
         WHERE e.id = $1`,
        [newExchange[0].id],
      )

      // Verstuur notificatie naar host
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/exchanges/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exchangeId: newExchange[0].id,
            type: "new_request",
          }),
        })
      } catch (error) {
        console.error("Failed to send notification:", error)
      }

      return NextResponse.json(fullExchange[0], { status: 201 })
    } catch (error) {
      // Rollback bij fouten
      await executeQuery("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error creating exchange:", error)
    return NextResponse.json({ error: "Failed to create exchange" }, { status: 500 })
  }
}
