import { Suspense } from "react"
import { ListingsHeader } from "@/components/listings/listings-header"
import { ListingsFilters } from "@/components/listings/listings-filters"
import { ListingsGrid } from "@/components/listings/listings-grid"
import { ListingsSkeleton } from "@/components/listings/listings-skeleton"

export default function ListingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ListingsHeader />
      <ListingsFilters />
      <Suspense fallback={<ListingsSkeleton />}>
        <ListingsGrid />
      </Suspense>
    </div>
  )
}
