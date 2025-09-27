import { type NextRequest, NextResponse } from "next/server"
import { DataIngestionService } from "@/lib/services/data-ingestion"

const ingestionService = new DataIngestionService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({ error: "Missing type or data in request body" }, { status: 400 })
    }

    let result

    switch (type) {
      case "cases":
        result = await ingestionService.ingestCaseData(data)
        break
      case "judges":
        result = await ingestionService.ingestJudgeData(data)
        break
      default:
        return NextResponse.json({ error: "Invalid data type. Use 'cases' or 'judges'" }, { status: 400 })
    }

    return NextResponse.json({
      message: `Successfully ingested ${result.success} records`,
      success: result.success,
      errors: result.errors,
    })
  } catch (error) {
    console.error("Data ingestion error:", error)
    return NextResponse.json({ error: "Internal server error during data ingestion" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const stats = await ingestionService.getCaseStatistics()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
