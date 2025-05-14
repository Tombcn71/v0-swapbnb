import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions)

  // Check if user is logged in
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as HandleUploadBody

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Here you can validate the user is allowed to upload
        // and customize the pathname

        // Only allow images
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This is called when the upload is completed
        // You can store the blob URL in your database here
        console.log("Upload completed:", blob)
        return blob
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
