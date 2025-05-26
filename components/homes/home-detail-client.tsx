import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HomeDetailClientProps {
  home: {
    id: string
    owner_name: string
    // Add other properties as needed
  }
  isOwner: boolean
}

export function HomeDetailClient({ home, userId, isOwner }: HomeDetailClientProps) {
  return (
    <div>
      {/* Example content - replace with actual content */}
      <h1>Home Detail</h1>
      {!isOwner && (
        <div className="mb-6">
          <Link href={`/homes/${home.id}/swap-request`}>
            <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              Swap aanvragen met {home.owner_name}
            </Button>
          </Link>
        </div>
      )}
      <p>Home ID: {home.id}</p>
      <p>Owner Name: {home.owner_name}</p>
      {/* More home details here */}
    </div>
  )
}

export default HomeDetailClient
