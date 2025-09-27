import { NextResponse } from "next/server"
import { AnalyticsService } from "@/lib/services/analytics"

const analyticsService = new AnalyticsService()

export async function GET() {
  try {
    const stats = await analyticsService.getDashboardStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
