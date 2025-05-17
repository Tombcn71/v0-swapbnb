import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import { SwapRequestForm } from "@/components/exchanges/swap-request-form"

interface SwapRequestPageProps {
  params: {
    id: string
  }
}

export default async function SwapRequestPage({ params }: SwapRequestPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/homes/" + params.id + "/swap-request")
  }

  // Haal de woning op
  const homes = await executeQuery("SELECT * FROM homes WHERE id = $1", [params.id])

  if (homes.length === 0) {
    redirect("/homes")
  }

  const home = homes[0]

  // Controleer of de gebruiker niet de eigenaar is
  if (home.owner_id === session.user.id) {
    redirect(`/homes/${params.id}`)
  }

  // Haal de eigenaar op
  const owners = await executeQuery("SELECT id, name, email FROM users WHERE id = $1", [home.owner_id])
  home.owner = owners[0]

  // Haal de woningen van de gebruiker op
  const userHomes = await executeQuery("SELECT id, title, city FROM homes WHERE owner_id = $1", [session.user.id])

  // Haal de beschikbaarheid van de woning op
  const availabilities = await executeQuery("SELECT * FROM availabilities WHERE home_id = $1", [params.id])

  // Controleer of er een chatgeschiedenis is
  const chatHistory = await executeQuery(
    `SELECT COUNT(*) as count
     FROM messages
     WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)`,
    [session.user.id, home.owner_id],
  )

  const hasChatted = chatHistory[0].count > 0

  if (!hasChatted) {
    redirect(`/homes/${params.id}`)
  }

  return (
    <div className="container mx-auto py-8">
      <SwapRequestForm home={home} userHomes={userHomes} availabilities={availabilities} />
    </div>
  )
}
