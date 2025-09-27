import { type NextRequest, NextResponse } from "next/server"
import { PredictionEngine } from "@/lib/services/prediction-engine"

const predictionEngine = new PredictionEngine()

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Prediction API called")
    const caseData = await request.json()
    console.log("[v0] Case data received:", caseData)

    if (!caseData.caseId) {
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 })
    }

    if (!caseData.caseType) {
      return NextResponse.json({ error: "Case type is required" }, { status: 400 })
    }

    const prediction = await predictionEngine.predictCaseOutcome(caseData)
    console.log("[v0] Prediction completed successfully")

    let caseSummary = null
    if (caseData.caseText || caseData.description) {
      caseSummary = await predictionEngine.generateCaseSummary(caseData.caseText || caseData.description)
    }

    return NextResponse.json({
      success: true,
      prediction,
      caseSummary,
    })
  } catch (error) {
    console.error("[v0] Prediction error:", error)
    return NextResponse.json(
      {
        error: "Internal server error during prediction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get("caseId")

    if (caseId) {
      // Get prediction history for specific case
      const history = await predictionEngine.getPredictionHistory(caseId)
      return NextResponse.json({ history })
    } else {
      // Get model accuracy statistics
      const accuracy = await predictionEngine.getModelAccuracy()
      return NextResponse.json({ accuracy })
    }
  } catch (error) {
    console.error("Error fetching prediction data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
