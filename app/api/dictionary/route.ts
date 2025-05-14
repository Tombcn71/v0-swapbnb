import { type NextRequest, NextResponse } from "next/server"
import { getDictionary } from "@/lib/dictionaries"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const locale = (searchParams.get("locale") || "nl") as "nl" | "en"

  try {
    const dictionary = await getDictionary(locale)
    return NextResponse.json(dictionary)
  } catch (error) {
    console.error("Error loading dictionary:", error)
    return NextResponse.json({ error: "Failed to load dictionary" }, { status: 500 })
  }
}
