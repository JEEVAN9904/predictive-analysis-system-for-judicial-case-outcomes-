import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth"

const authService = new AuthService()

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    if (!userData.email || !userData.password || !userData.name || !userData.role) {
      return NextResponse.json(
        {
          error: "Email, password, name, and role are required",
        },
        { status: 400 },
      )
    }

    const user = await authService.createUser(userData)

    return NextResponse.json({
      success: true,
      user: { ...user, password: undefined }, // Don't return password
      message: "User created successfully",
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)

    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
