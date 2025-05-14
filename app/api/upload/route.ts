import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as HandleUploadBody

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Hier kunnen we de bestandsnaam aanpassen en validatie toevoegen
        const uniqueFilename = `homes/${session.user.id}/${uuidv4()}-${pathname.split("/").pop()}`

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          maximumSizeInBytes: 5 * 1024 * 1024, // 5MB
          pathname: uniqueFilename,
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Hier kunnen we eventueel de database updaten na een succesvolle upload
        console.log("Upload completed:", blob)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error("Error handling upload:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to handle upload" },
      { status: 500 },
    )
  }
}
