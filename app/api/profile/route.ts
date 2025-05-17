import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, email, image } = await request.json()

    // Valideer input
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Controleer of e-mail al in gebruik is door een andere gebruiker
    if (email !== session.user.email) {
      const existingUser = await executeQuery("SELECT id FROM users WHERE email = $1 AND id != $2", [
        email,
        session.user.id,
      ])

      if (existingUser.length > 0) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 409 })
      }
    }

    // Update het gebruikersprofiel
    const result = await executeQuery(
      "UPDATE users SET name = $1, email = $2, image = $3 WHERE id = $4 RETURNING id, name, email, image",
      [name, email, image, session.user.id],
    )

    const updatedUser = result[0]

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
