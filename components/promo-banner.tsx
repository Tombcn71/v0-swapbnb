"use client"

import { X } from "lucide-react"
import { useState } from "react"

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-[#4285F4] text-white py-2 px-4 text-center relative">
      <p className="font-medium">
       👋 Zeg maar dag tegen hotels en accommodaties die de prijzen verhogen net wanneer jij vrij hebt
      </p>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-blue-100 transition-colors"
        aria-label="Sluit banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
