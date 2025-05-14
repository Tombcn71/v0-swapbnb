import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as HandleUploadBody

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Generate a unique filename to prevent overwrites
        const uniqueFilename = `${uuidv4()}-${pathname.split("/").pop()}`
        const newPathname = pathname.replace(/[^/]+$/, uniqueFilename)

        // You can validate user permissions here
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          maximumSizeInBytes: 5 * 1024 * 1024, // 5MB
          pathname: newPathname,
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This will be called when the upload is complete
        console.log("Upload completed", blob)

        // You could save the blob URL to your database here
        // or associate it with the user who uploaded it
        return
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error("Error handling upload:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 })
  }
}
