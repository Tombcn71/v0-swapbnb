"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generatePitch } from "@/lib/generate-pitch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Download, Printer, Copy, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("form")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPitch, setGeneratedPitch] = useState("")
  const [error, setError] = useState<string | null>(null)
  const pitchRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState<PitchFormData>({
    problem: "",
    solution: "",
    uniqueness: "",
    market: "",
    traction: "",
    business: "",
    team: "",
    ask: "",
  })

  const handleInputChange = (field: keyof PitchFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)

    try {
      const pitch = await generatePitch(formData)
      setGeneratedPitch(pitch)
      setActiveTab("result")
      toast({
        title: "Success!",
        description: "Your pitch has been generated successfully.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyToClipboard = async () => {
    if (generatedPitch) {
      try {
        await navigator.clipboard.writeText(generatedPitch)
        toast({
          title: "Copied!",
          description: "Pitch copied to clipboard",
        })
      } catch (error) {
        toast({
          title: "Copy failed",
          description: "Please copy manually",
          variant: "destructive",
        })
      }
    }
  }

  const handleDownload = () => {
    if (generatedPitch) {
      const element = document.createElement("a")
      const file = new Blob([generatedPitch], { type: "text/plain" })
      element.href = URL.createObjectURL(file)
      element.download = "pitch.txt"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

  const formatPitchText = (text: string) => {
    if (!text) return null

    return (
      <div className="space-y-4 p-6 bg-card border rounded-lg">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-lg font-semibold">Your 3-Minute Pitch</h3>
        </div>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{text}</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Pitch Canvas Generator</h1>
        <p className="text-muted-foreground mb-8">Create your perfect pitch with AI</p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Pitch Canvas</TabsTrigger>
            <TabsTrigger value="result" disabled={!generatedPitch}>
              Generated Pitch
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>David Beckett's Pitch Canvas</CardTitle>
                <CardDescription>Fill in all fields to generate your 3-minute pitch</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="problem">Problem *</Label>
                      <Textarea
                        id="problem"
                        placeholder="What problem are you solving?"
                        value={formData.problem}
                        onChange={(e) => handleInputChange("problem", e.target.value)}
                        required
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="solution">Solution *</Label>
                      <Textarea
                        id="solution"
                        placeholder="How does your solution work?"
                        value={formData.solution}
                        onChange={(e) => handleInputChange("solution", e.target.value)}
                        required
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="uniqueness">Uniqueness *</Label>
                      <Textarea
                        id="uniqueness"
                        placeholder="What makes your solution unique?"
                        value={formData.uniqueness}
                        onChange={(e) => handleInputChange("uniqueness", e.target.value)}
                        required
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="market">Target Market *</Label>
                      <Textarea
                        id="market"
                        placeholder="Who is your target audience?"
                        value={formData.market}
                        onChange={(e) => handleInputChange("market", e.target.value)}
                        required
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="traction">Traction *</Label>
                      <Textarea
                        id="traction"
                        placeholder="What traction do you have?"
                        value={formData.traction}
                        onChange={(e) => handleInputChange("traction", e.target.value)}
                        required
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business">Business Model *</Label>
                      <Textarea
                        id="business"
                        placeholder="How will you generate revenue?"
                        value={formData.business}
                        onChange={(e) => handleInputChange("business", e.target.value)}
                        required
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team">Team *</Label>
                      <Textarea
                        id="team"
                        placeholder="Who is part of your team?"
                        value={formData.team}
                        onChange={(e) => handleInputChange("team", e.target.value)}
                        required
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ask">The Ask *</Label>
                      <Textarea
                        id="ask"
                        placeholder="What are you asking for?"
                        value={formData.ask}
                        onChange={(e) => handleInputChange("ask", e.target.value)}
                        required
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isGenerating} size="lg">
                    {isGenerating ? "Generating..." : "Generate Pitch"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="result">
            <Card>
              <CardHeader>
                <CardTitle>Your Generated Pitch</CardTitle>
                <CardDescription>AI-generated 3-minute pitch based on David Beckett's method</CardDescription>
              </CardHeader>
              <CardContent>
                <div ref={pitchRef}>{formatPitchText(generatedPitch)}</div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-3 justify-between">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => setActiveTab("form")}>
                    Edit Canvas
                  </Button>
                  <Button variant="outline" onClick={handleCopyToClipboard}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
