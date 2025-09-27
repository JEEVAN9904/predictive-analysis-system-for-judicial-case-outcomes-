import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { JudicialCase } from "@/lib/models/case"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const casesCollection = db.collection<JudicialCase>("cases")

    const caseData = await casesCollection.findOne({ caseId: params.id })

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    return NextResponse.json(caseData)
  } catch (error) {
    console.error("Error fetching case:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    const { db } = await connectToDatabase()
    const casesCollection = db.collection<JudicialCase>("cases")

    const result = await casesCollection.updateOne(
      { caseId: params.id },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Case updated successfully" })
  } catch (error) {
    console.error("Error updating case:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const casesCollection = db.collection<JudicialCase>("cases")

    const result = await casesCollection.deleteOne({ caseId: params.id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Case deleted successfully" })
  } catch (error) {
    console.error("Error deleting case:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
