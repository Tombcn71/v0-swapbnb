// Daily.co configuration and utilities
export const DAILY_CONFIG = {
  apiKey: process.env.DAILY_API_KEY,
  domain: process.env.DAILY_DOMAIN || "swapbnb.daily.co",
  apiUrl: "https://api.daily.co/v1",
}

export interface DailyRoom {
  id: string
  name: string
  url: string
  created_at: string
  config: {
    max_participants?: number
    enable_screenshare?: boolean
    enable_chat?: boolean
    start_video_off?: boolean
    start_audio_off?: boolean
    exp?: number
  }
}

export async function createDailyRoom(
  roomName: string,
  config: Partial<DailyRoom["config"]> = {},
): Promise<DailyRoom | null> {
  if (!DAILY_CONFIG.apiKey) {
    console.warn("No Daily.co API key found, using public room")
    return null
  }

  try {
    const response = await fetch(`${DAILY_CONFIG.apiUrl}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          max_participants: 2,
          enable_screenshare: true,
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 uur geldig
          ...config,
        },
      }),
    })

    if (response.ok) {
      return await response.json()
    } else {
      console.error("Failed to create Daily.co room:", await response.text())
      return null
    }
  } catch (error) {
    console.error("Error creating Daily.co room:", error)
    return null
  }
}

export function getDailyRoomUrl(roomName: string): string {
  return `https://${DAILY_CONFIG.domain}/${roomName}`
}
