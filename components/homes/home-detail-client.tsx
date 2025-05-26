import type React from "react"
import { Button } from "@/components/ui/button"

interface HomeDetailClientProps {
  homeId: string
}

const HomeDetailClient: React.FC<HomeDetailClientProps> = ({ homeId }) => {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Home Details Section */}
        <div className="md:col-span-1">
          <h1 className="text-2xl font-bold mb-4">Home Details</h1>
          <p>Home ID: {homeId}</p>
          {/* Add more home details here */}
        </div>

        {/* HomeContact Section */}
        <div className="md:col-span-1">
          <HomeContact />
        </div>
      </div>
    </div>
  )
}

const HomeContact: React.FC = () => {
  return (
    <div className="border p-4 rounded-md">
      <h2 className="text-lg font-semibold mb-4">Contacteer ons</h2>
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Aankomst</label>
            <input type="date" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vertrek</label>
            <input type="date" className="w-full p-2 border rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Aantal gasten</label>
          <input type="number" min="1" defaultValue="1" className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bericht</label>
          <textarea
            rows={3}
            placeholder="Vertel waarom je geïnteresseerd bent..."
            className="w-full p-2 border rounded"
          ></textarea>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
          Swap aanvragen
        </Button>
      </form>
    </div>
  )
}

export { HomeDetailClient }
export default HomeDetailClient
