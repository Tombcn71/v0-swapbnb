import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions)

  // Controleer of de gebruiker is ingelogd
  if (!session) {
    return NextResponse.json({ error: "Je moet ingelogd zijn om bestanden te uploaden" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as HandleUploadBody

    // Valideer bestandstype (alleen afbeeldingen)
    if (!body.contentType?.startsWith("image/")) {
      return NextResponse.json({ error: "Alleen afbeeldingen zijn toegestaan" }, { status: 400 })
    }

    // Genereer een unieke bestandsnaam om overschrijvingen te voorkomen
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 10)
    const fileName = body.filename ? `${timestamp}-${randomId}-${body.filename}` : `${timestamp}-${randomId}`

    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Valideer bestandsgrootte (max 5MB)
        const fileSize = clientPayload?.size || 0
        if (fileSize > 5 * 1024 * 1024) {
          throw new Error("Bestand is te groot (max 5MB)")
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
          tokenPayload: {
            userId: session.user.id,
            timestamp: Date.now(),
          },
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Upload voltooid:", blob)
        console.log("Token payload:", tokenPayload)
        // Hier kun je eventueel de blob URL opslaan in je database
        return blob
      },
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error handling upload:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Er is een fout opgetreden" },
      { status: 500 },
    )
  }
}
