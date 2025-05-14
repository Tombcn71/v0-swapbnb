"use client"

import type React from "react"

import { useState } from "react"
import { X, ImageIcon } from "lucide-react"
import Image from "next/image"
import { upload } from "@vercel/blob/client"

interface ImageUploaderProps {
  onImagesChange: (urls: string[]) => void
  initialImages?: string[]
}

export default function ImageUploader({ onImagesChange, initialImages = [] }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    const files = Array.from(e.target.files)
    const totalFiles = files.length
    let completedFiles = 0
    const newImageUrls: string[] = []

    try {
      for (const file of files) {
        // Upload naar Vercel Blob
        const { url } = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        })

        newImageUrls.push(url)
        completedFiles++
        setUploadProgress(Math.round((completedFiles / totalFiles) * 100))
      }

      const updatedImages = [...images, ...newImageUrls]
      setImages(updatedImages)
      onImagesChange(updatedImages)
    } catch (error) {
      console.error("Error uploading images:", error)
      alert("Er is een fout opgetreden bij het uploaden van de afbeeldingen.")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = [...images]
    updatedImages.splice(index, 1)
    setImages(updatedImages)
    onImagesChange(updatedImages)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative w-32 h-32 rounded-md overflow-hidden border border-gray-200">
            <Image src={url || "/placeholder.svg"} alt={`Uploaded image ${index + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
              aria-label="Remove image"
            >
              <X className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ))}

        {isUploading && (
          <div className="w-32 h-32 border border-gray-200 rounded-md flex items-center justify-center">
            <div className="text-center">
              <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-xs mt-1">{uploadProgress}%</p>
            </div>
          </div>
        )}

        <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
          <ImageIcon className="h-8 w-8 text-gray-400" />
          <span className="text-sm text-gray-500 mt-1">Voeg foto's toe</span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>

      {images.length === 0 && <p className="text-sm text-gray-500">Upload minimaal 3 foto's van je woning</p>}
    </div>
  )
}
