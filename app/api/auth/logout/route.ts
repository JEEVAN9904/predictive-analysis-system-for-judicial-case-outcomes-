import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth"

const authService = new AuthService()

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value

    if (sessionToken) {
      await authService.logout(sessionToken)
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })

    // Clear session cookie
    response.cookies.delete("session_token")

    return response
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
