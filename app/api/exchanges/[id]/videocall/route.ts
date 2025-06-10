import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type = "instant", meeting_link, platform = "whereby" } = await request.json()
    const exchangeId = params.id

    // Haal exchange details op
    const exchange = await executeQuery(
      `SELECT e.*, 
              r.name as requester_name, 
              h.name as host_name
       FROM exchanges e
       JOIN users r ON e.requester_id = r.id
       JOIN users h ON e.host_id = h.id
       WHERE e.id = $1 AND (e.requester_id = $2 OR e.host_id = $2)`,
      [exchangeId, session.user.id],
    )

    if (exchange.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    const exchangeData = exchange[0]
    const isRequester = exchangeData.requester_id === session.user.id
    const receiverId = isRequester ? exchangeData.host_id : exchangeData.requester_id
    const receiverName = isRequester ? exchangeData.host_name : exchangeData.requester_name

    let messageContent = ""
    const meetLink = meeting_link

    if (platform === "whereby") {
      // Update exchange met Whereby link
      await executeQuery(
        `UPDATE exchanges 
         SET videocall_link = $1,
             videocall_platform = 'whereby',
             status = 'videocall_scheduled',
             updated_at = NOW() 
         WHERE id = $2`,
        [meetLink, exchangeId],
      )

      messageContent = `🎥 ${session.user.name} heeft een Whereby videocall kamer aangemaakt! Klik op de link om deel te nemen. Whereby heeft uitstekende HD kwaliteit en werkt direct in je browser.`
    } else if (platform === "whatsapp") {
      // Update exchange status
      await executeQuery(
        `UPDATE exchanges 
         SET videocall_platform = 'whatsapp',
             status = 'videocall_scheduled',
             updated_at = NOW() 
         WHERE id = $1`,
        [exchangeId],
      )

      messageContent = `📱 ${session.user.name} stelt voor om via WhatsApp te videobellen! Dit is vaak de makkelijkste optie. Deel je WhatsApp nummer zodat jullie kunnen bellen.`
    }

    // Verstuur bericht naar de ontvanger
    await executeQuery(
      `INSERT INTO messages (sender_id, receiver_id, exchange_id, content, message_type, created_at)
       VALUES ($1, $2, $3, $4, 'videocall_invite', NOW())`,
      [session.user.id, receiverId, exchangeId, messageContent],
    )

    return NextResponse.json({
      success: true,
      type,
      platform,
      receiverId,
      receiverName,
      message: `${platform === "whereby" ? "Whereby kamer" : "WhatsApp voorstel"} verstuurd naar ${receiverName}`,
      meetingLink: meetLink,
    })
  } catch (error) {
    console.error("Error creating videocall:", error)
    return NextResponse.json({ error: "Failed to create videocall" }, { status: 500 })
  }
}
