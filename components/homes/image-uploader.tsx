"use client"

import type React from "react"

import { useState, useRef } from "react"
import { upload } from "@vercel/blob/client"
import { Button } from "@/components/ui/button"
import { Trash2, Upload, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploaderProps {
  onChange: (urls: string[]) => void
  value?: string[]
  maxImages?: number
}

export function ImageUploader({ onChange, value = [], maxImages = 10 }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(value)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newUploadProgress: Record<string, number> = {}
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        if (images.length + uploadedUrls.length >= maxImages) break

        const file = files[i]
        const fileId = `${Date.now()}-${i}`
        newUploadProgress[fileId] = 0
        setUploadProgress({ ...uploadProgress, ...newUploadProgress })

        const newBlob = await upload(file.name, file, {
          onProgress: (progress) => {
            newUploadProgress[fileId] = progress
            setUploadProgress({ ...uploadProgress, ...newUploadProgress })
          },
          endpoint: "/api/upload",
        })

        uploadedUrls.push(newBlob.url)
      }

      const newImages = [...images, ...uploadedUrls]
      setImages(newImages)
      onChange(newImages)
    } catch (error) {
      console.error("Error uploading images:", error)
      alert("Error uploading images. Please try again.")
    } finally {
      setUploading(false)
      setUploadProgress({})
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
    onChange(newImages)
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((url, index) => (
          <div key={url} className="relative group">
            <div className="w-32 h-32 rounded-md overflow-hidden border border-gray-200">
              <Image
                src={url || "/placeholder.svg"}
                alt={`Uploaded image ${index + 1}`}
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            </div>
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {Object.keys(uploadProgress).map((fileId) => (
          <div
            key={fileId}
            className="w-32 h-32 rounded-md border border-gray-200 flex items-center justify-center bg-gray-50"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-google-blue flex items-center justify-center text-white">
                  {Math.round(uploadProgress[fileId])}%
                </div>
              </div>
              <p className="text-xs text-gray-500">Uploading...</p>
            </div>
          </div>
        ))}

        {images.length < maxImages && !uploading && (
          <button
            type="button"
            onClick={triggerFileInput}
            className="w-32 h-32 rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-google-blue transition-colors"
          >
            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Add Images</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        multiple
        className="hidden"
        disabled={uploading || images.length >= maxImages}
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={triggerFileInput}
          disabled={uploading || images.length >= maxImages}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          Upload Images
        </Button>
        <p className="text-sm text-gray-500">
          {images.length} of {maxImages} images
        </p>
      </div>
    </div>
  )
}
