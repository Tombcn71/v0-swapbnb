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

    // Get user data
    const users = await executeQuery(
      `SELECT 
        id, 
        name, 
        email, 
        bio, 
        profile_image, 
        identity_verification_status, 
        onboarding_completed,
        credits
      FROM users 
      WHERE id = $1`,
      [session.user.id],
    )

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    // Check if user has any properties
    const homes = await executeQuery("SELECT COUNT(*) as count FROM homes WHERE user_id = $1", [session.user.id])
    const hasProperty = homes[0].count > 0

    return NextResponse.json({
      hasProfile: true, // User exists, so they have a basic profile
      profileCompleted: !!(user.name && user.email && user.bio && user.profile_image),
      isVerified: user.identity_verification_status === "verified",
      hasProperty,
      onboardingCompleted: user.onboarding_completed,
      credits: user.credits,
    })
  } catch (error) {
    console.error("Error fetching onboarding status:", error)
    return NextResponse.json({ error: "Failed to fetch onboarding status" }, { status: 500 })
  }
}
