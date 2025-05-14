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

    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        }
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
