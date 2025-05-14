import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ListingsHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Woningen in Nederland</h1>
        <p className="text-gray-600 mb-4 md:mb-0">Ontdek beschikbare woningen voor huizenruil in heel Nederland</p>
      </div>
      <Button asChild>
        <Link href="/homes/new">Voeg je woning toe</Link>
      </Button>
    </div>
  )
}
