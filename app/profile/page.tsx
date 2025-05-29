import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import { ProfileForm } from "@/components/profile/profile-form"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  // Haal de volledige gebruikersgegevens op
  const users = await executeQuery("SELECT id, name, email, profile_image, bio, phone FROM users WHERE id = $1", [
    session.user.id,
  ])

  if (users.length === 0) {
    redirect("/login")
  }

  const user = users[0]

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Profiel</h1>
      <ProfileForm user={user} />
    </div>
  )
}
