import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { filename, contentType } = await request.json()

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Filename and contentType are required" }, { status: 400 })
    }

    // Genereer een unieke bestandsnaam om overschrijvingen te voorkomen
    const uniqueFilename = `${uuidv4()}-${filename}`
    const pathname = `homes/${session.user.id}/${uniqueFilename}`

    // Genereer een uploadable URL zonder body (null als placeholder)
    const { url, uploadUrl } = await put(pathname, null, {
      contentType,
      access: "public",
    })

    return NextResponse.json({ url, uploadUrl })
  } catch (error) {
    console.error("Error generating upload URL:", error)
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 })
  }
}
