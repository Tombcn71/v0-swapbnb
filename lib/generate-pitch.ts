"use server"

interface PitchFormData {
  problem: string
  solution: string
  uniqueness: string
  market: string
  traction: string
  business: string
  team: string
  ask: string
}

export async function generatePitch(data: PitchFormData): Promise<string> {
  try {
    // Validate input data
    if (
      !data.problem ||
      !data.solution ||
      !data.uniqueness ||
      !data.market ||
      !data.traction ||
      !data.business ||
      !data.team ||
      !data.ask
    ) {
      throw new Error("All fields are required to generate a pitch.")
    }

    // Check API key
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      throw new Error("Google API key is not configured.")
    }

    // Create the prompt
    const prompt = `Create a professional 3-minute pitch based on David Beckett's pitch canvas method:

PROBLEM: ${data.problem}
SOLUTION: ${data.solution}
UNIQUENESS: ${data.uniqueness}
TARGET MARKET: ${data.market}
TRACTION: ${data.traction}
BUSINESS MODEL: ${data.business}
TEAM: ${data.team}
THE ASK: ${data.ask}

Format as a well-structured 3-minute pitch script with clear sections and transitions.`

    // Make API call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      },
    )

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your Google API key.")
      } else if (response.status === 429) {
        throw new Error("API quota exceeded. Please try again later.")
      } else {
        throw new Error(`API error: ${response.status}`)
      }
    }

    const result = await response.json()

    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("No content generated. Please try again.")
    }

    return result.candidates[0].content.parts[0].text
  } catch (error) {
    console.error("Generate pitch error:", error)

    if (error instanceof Error) {
      throw new Error(error.message)
    }

    throw new Error("Failed to generate pitch. Please try again.")
  }
}
