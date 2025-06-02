"use client"

import { DashboardFavorites } from "@/components/dashboard/dashboard-favorites"

export default function FavoritesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Favoriete Woningen</h1>
        <p className="text-gray-600">Bekijk alle woningen die je hebt toegevoegd aan je favorieten</p>
      </div>

      <DashboardFavorites />
    </div>
  )
}
