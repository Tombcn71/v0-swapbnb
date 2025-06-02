import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  try {
    const { title, description, location, price, image } = await req.json()

    if (!title || !description || !location || !price || !image) {
      return new NextResponse(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    // Insert the new home into the database
    const result = await executeQuery(
      "INSERT INTO homes (user_id, title, description, location, price, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [session.user.id, title, description, location, price, image],
    )

    if (!result || result.length === 0) {
      return new NextResponse(JSON.stringify({ error: "Failed to create home" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    // Check if this is the user's first home and give free credit
    const existingHomesResult = await executeQuery("SELECT COUNT(*) as count FROM homes WHERE user_id = $1", [
      session.user.id,
    ])
    const homeCount = Number.parseInt(existingHomesResult[0].count)

    if (homeCount === 1) {
      // This is their first home
      // Add 1 free credit
      await executeQuery("UPDATE users SET credits = credits + 1 WHERE id = $1", [session.user.id])

      // Record the transaction
      await executeQuery(
        `INSERT INTO credits_transactions (user_id, amount, transaction_type, description)
         VALUES ($1, $2, $3, $4)`,
        [session.user.id, 1, "free_home_upload", "Gratis credit voor eerste woning upload"],
      )
    }

    return new NextResponse(JSON.stringify({ message: "Home created successfully", home: result[0] }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error: any) {
    console.error("Error creating home:", error)
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
