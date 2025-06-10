import { type NextRequest, NextResponse } from "next/server"
import { render } from "@react-email/render"
import { sendEmail } from "@/lib/email-service"
import WelcomeEmail from "@/emails/templates/welcome"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    // Render the email template
    const emailHtml = render(
      WelcomeEmail({
        userName: name,
        loginUrl: `${process.env.NEXTAUTH_URL}/login`,
      }),
    )

    // Send the email
    const result = await sendEmail({
      to: email,
      subject: "Welcome to SwapBnB! 🏠",
      html: emailHtml,
    })

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
