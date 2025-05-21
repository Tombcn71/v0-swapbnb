"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface HomeGalleryProps {
  images: string[]
  title: string
}

export function HomeGallery({ images, title }: HomeGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Als er geen afbeeldingen zijn, toon een placeholder
  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
        <Image
          src="/cozy-suburban-house.png"
          alt={title}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.slice(0, 5).map((image, index) => (
          <div
            key={index}
            className={cn(
              "relative rounded-lg overflow-hidden cursor-pointer",
              index === 0 ? "col-span-1 md:col-span-2 row-span-2 h-[300px] md:h-[400px]" : "h-[200px]",
            )}
            onClick={() => setSelectedImage(image)}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`${title} - Afbeelding ${index + 1}`}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>

      {/* Lightbox voor het bekijken van afbeeldingen */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          {selectedImage && (
            <div className="relative w-full h-[80vh]">
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt={title}
                className="object-contain"
                fill
                sizes="100vw"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
