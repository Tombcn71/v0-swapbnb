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

    // Get user's onboarding status
    const users = await executeQuery(
      `SELECT 
        onboarding_completed,
        name IS NOT NULL AND bio IS NOT NULL AND profile_image IS NOT NULL AS profile_completed,
        identity_verification_status = 'verified' AS verification_completed
      FROM users WHERE id = $1`,
      [session.user.id],
    )

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has any homes
    const homes = await executeQuery("SELECT COUNT(*) as home_count FROM homes WHERE owner_id = $1", [session.user.id])
    const hasHome = homes[0].home_count > 0

    // Determine completed steps
    const completedSteps = {
      welcome: true, // Always start with welcome as available
      profile: users[0].profile_completed,
      verification: users[0].verification_completed,
      property: hasHome,
      complete: users[0].onboarding_completed,
    }

    return NextResponse.json({
      onboardingCompleted: users[0].onboarding_completed,
      completedSteps,
    })
  } catch (error) {
    console.error("Error fetching onboarding status:", error)
    return NextResponse.json({ error: "Failed to fetch onboarding status" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { step, completed } = await request.json()

    // Update the specific step in the database
    // This is just tracking progress, not marking onboarding as complete
    await executeQuery(
      `UPDATE users SET 
        onboarding_progress = jsonb_set(
          COALESCE(onboarding_progress, '{}'::jsonb), 
          $1, 
          $2
        ) 
      WHERE id = $3`,
      [[step], JSON.stringify(completed), session.user.id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating onboarding status:", error)
    return NextResponse.json({ error: "Failed to update onboarding status" }, { status: 500 })
  }
}
