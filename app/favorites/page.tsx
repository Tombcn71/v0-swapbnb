import { DashboardFavorites } from "@/components/dashboard/dashboard-favorites"

export default function FavoritesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mijn Favorieten</h1>
      <DashboardFavorites />
    </div>
  )
}
