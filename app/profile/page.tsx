import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/profile/profile-form"
import { executeQuery } from "@/lib/db"
import type { User } from "@/lib/types"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  // Haal de gebruikersgegevens op
  const users = await executeQuery("SELECT * FROM users WHERE id = $1", [session.user.id])
  const user = users.length > 0 ? (users[0] as User) : null

  if (!user) {
    return <div className="container mx-auto px-4 py-8">Gebruiker niet gevonden</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mijn Profiel</h1>
      <ProfileForm user={user} />
    </div>
  )
}
