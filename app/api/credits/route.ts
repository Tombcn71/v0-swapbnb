import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user credits
    const result = await sql`
      SELECT credits FROM users WHERE email = ${session.user.email}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const credits = result[0].credits || 0

    console.log(`Credits for ${session.user.email}: ${credits}`) // Debug log

    return NextResponse.json({
      credits: credits,
      user: session.user.email,
    })
  } catch (error) {
    console.error("Error fetching credits:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        credits: 0, // Fallback to 0 credits
      },
      { status: 500 },
    )
  }
}
