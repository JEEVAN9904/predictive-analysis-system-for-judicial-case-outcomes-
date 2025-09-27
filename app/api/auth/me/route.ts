import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth"

const authService = new AuthService()

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await authService.validateSession(sessionToken)

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("[v0] Auth check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
