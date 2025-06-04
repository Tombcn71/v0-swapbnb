import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await executeQuery("SELECT identity_verification_status FROM users WHERE id = $1", [session.user.id])

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ status: users[0].identity_verification_status || "pending" })
  } catch (error) {
    console.error("Error fetching verification status:", error)
    return NextResponse.json({ error: "Failed to fetch verification status" }, { status: 500 })
  }
}
