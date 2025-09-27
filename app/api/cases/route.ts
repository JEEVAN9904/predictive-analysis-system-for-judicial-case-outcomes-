import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { JudicialCase } from "@/lib/models/case"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const caseType = searchParams.get("caseType") || ""
    const status = searchParams.get("status") || ""

    const { db } = await connectToDatabase()
    const casesCollection = db.collection<JudicialCase>("cases")

    // Build filter
    const filter: any = {}
    if (search) {
      filter.$or = [
        { caseId: { $regex: search, $options: "i" } },
        { plaintiff: { $regex: search, $options: "i" } },
        { defendant: { $regex: search, $options: "i" } },
        { judgeName: { $regex: search, $options: "i" } },
      ]
    }
    if (caseType) filter.caseType = caseType
    if (status) filter.caseStatus = status

    // Get total count
    const total = await casesCollection.countDocuments(filter)

    // Get cases with pagination
    const cases = await casesCollection
      .find(filter)
      .sort({ filingDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      cases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const caseData = await request.json()

    // Validate required fields
    if (!caseData.caseId || !caseData.caseType || !caseData.filingDate) {
      return NextResponse.json({ error: "Missing required fields: caseId, caseType, filingDate" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const casesCollection = db.collection<JudicialCase>("cases")

    // Check if case already exists
    const existingCase = await casesCollection.findOne({ caseId: caseData.caseId })
    if (existingCase) {
      return NextResponse.json({ error: "Case with this ID already exists" }, { status: 409 })
    }

    // Create new case
    const newCase: JudicialCase = {
      ...caseData,
      filingDate: new Date(caseData.filingDate),
      createdAt: new Date(),
      updatedAt: new Date(),
      caseStatus: caseData.caseStatus || "pending",
      priority: caseData.priority || "medium",
      courtLevel: caseData.courtLevel || "district",
    }

    const result = await casesCollection.insertOne(newCase)

    return NextResponse.json({
      success: true,
      caseId: result.insertedId,
      message: "Case created successfully",
    })
  } catch (error) {
    console.error("Error creating case:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
