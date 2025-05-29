import { Check } from "lucide-react"

interface HomeAmenitiesProps {
  amenities: Record<string, boolean>
}

export function HomeAmenities({ amenities }: HomeAmenitiesProps) {
  // Converteer het amenities object naar een array van key-value pairs
  const amenitiesList = Object.entries(amenities || {}).filter(([_, value]) => value)

  if (amenitiesList.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Voorzieningen</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {amenitiesList.map(([key]) => (
          <div key={key} className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <span>{formatAmenityName(key)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper functie om de amenity naam te formatteren
function formatAmenityName(name: string): string {
  const formattedName = name.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

  const translations: Record<string, string> = {
    Wifi: "WiFi",
    Tv: "TV",
    Kitchen: "Keuken",
    Washer: "Wasmachine",
    "Free Parking": "Gratis parkeren",
    "Paid Parking": "Betaald parkeren",
    "Air Conditioning": "Airconditioning",
    "Dedicated Workspace": "Werkplek",
    Pool: "Zwembad",
    "Hot Tub": "Jacuzzi",
    Patio: "Terras",
    "Bbq Grill": "BBQ",
    "Outdoor Dining": "Buiten eten",
    "Fire Pit": "Vuurplaats",
    "Pool Table": "Pooltafel",
    "Indoor Fireplace": "Open haard",
    Piano: "Piano",
    "Exercise Equipment": "Fitnessapparatuur",
    "Lake Access": "Toegang tot meer",
    "Beach Access": "Toegang tot strand",
    "Ski In Ski Out": "Ski-in/ski-out",
  }

  return translations[formattedName] || formattedName
}
