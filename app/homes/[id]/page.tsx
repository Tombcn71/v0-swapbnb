import { HomeDetailClient } from "@/components/homes/home-detail-client"

export default function HomeDetailPage({ params }: { params: { id: string } }) {
  return <HomeDetailClient homeId={params.id} />
}
