"use client"

import { useState, useEffect } from "react"

interface HomeMapProps {
  address: string
  city: string
  postalCode: string
}

export function HomeMap({ address, city, postalCode }: HomeMapProps) {
  const [mapUrl, setMapUrl] = useState<string>("")

  useEffect(() => {
    // Combineer adres, stad en postcode voor de kaart
    const fullAddress = encodeURIComponent(`${address}, ${postalCode} ${city}, Netherlands`)
    setMapUrl(`https://maps.google.com/maps?q=${fullAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`)
  }, [address, city, postalCode])

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Locatie</h2>
      <div className="rounded-lg overflow-hidden border border-gray-200 h-[300px]">
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Kaart van ${address}, ${city}`}
        ></iframe>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        {address}, {postalCode} {city}
      </p>
    </div>
  )
}
