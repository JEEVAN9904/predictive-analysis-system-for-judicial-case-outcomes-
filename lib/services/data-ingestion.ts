import { connectToDatabase } from "@/lib/mongodb"
import type { JudicialCase, Judge } from "@/lib/models/case"

export class DataIngestionService {
  private async getDatabase() {
    const { db } = await connectToDatabase()
    return db
  }

  async ingestCaseData(cases: Partial<JudicialCase>[]): Promise<{ success: number; errors: string[] }> {
    const db = await this.getDatabase()
    const casesCollection = db.collection<JudicialCase>("cases")

    let success = 0
    const errors: string[] = []

    for (const caseData of cases) {
      try {
        // Validate required fields
        if (!caseData.caseId || !caseData.caseType || !caseData.filingDate) {
          errors.push(`Missing required fields for case: ${caseData.caseId || "Unknown"}`)
          continue
        }

        // Process and clean data
        const processedCase: JudicialCase = {
          ...caseData,
          caseId: caseData.caseId!,
          caseType: caseData.caseType!,
          filingDate: new Date(caseData.filingDate!),
          createdAt: new Date(),
          updatedAt: new Date(),
          // Set defaults for optional fields
          caseStatus: caseData.caseStatus || "pending",
          priority: caseData.priority || "medium",
          courtLevel: caseData.courtLevel || "district",
        }

        // Insert or update case
        await casesCollection.replaceOne({ caseId: processedCase.caseId }, processedCase, { upsert: true })

        success++
      } catch (error) {
        errors.push(`Error processing case ${caseData.caseId}: ${error}`)
      }
    }

    return { success, errors }
  }

  async ingestJudgeData(judges: Partial<Judge>[]): Promise<{ success: number; errors: string[] }> {
    const db = await this.getDatabase()
    const judgesCollection = db.collection<Judge>("judges")

    let success = 0
    const errors: string[] = []

    for (const judgeData of judges) {
      try {
        if (!judgeData.name) {
          errors.push(`Missing name for judge`)
          continue
        }

        const processedJudge: Judge = {
          ...judgeData,
          name: judgeData.name!,
          experience: judgeData.experience || 0,
          specialization: judgeData.specialization || [],
          totalCases: judgeData.totalCases || 0,
          convictionRate: judgeData.convictionRate || 0,
          averageCaseDuration: judgeData.averageCaseDuration || 0,
          courtLevel: judgeData.courtLevel || "district",
          state: judgeData.state || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await judgesCollection.replaceOne({ name: processedJudge.name }, processedJudge, { upsert: true })

        success++
      } catch (error) {
        errors.push(`Error processing judge ${judgeData.name}: ${error}`)
      }
    }

    return { success, errors }
  }

  async validateCaseData(caseData: any): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Required field validation
    if (!caseData.caseId) errors.push("Case ID is required")
    if (!caseData.caseType) errors.push("Case type is required")
    if (!caseData.filingDate) errors.push("Filing date is required")
    if (!caseData.plaintiff) errors.push("Plaintiff is required")
    if (!caseData.defendant) errors.push("Defendant is required")

    // Type validation
    const validCaseTypes = ["criminal", "civil", "constitutional", "commercial", "family", "tax"]
    if (caseData.caseType && !validCaseTypes.includes(caseData.caseType)) {
      errors.push(`Invalid case type: ${caseData.caseType}`)
    }

    const validStatuses = ["pending", "disposed", "adjourned", "dismissed"]
    if (caseData.caseStatus && !validStatuses.includes(caseData.caseStatus)) {
      errors.push(`Invalid case status: ${caseData.caseStatus}`)
    }

    // Date validation
    if (caseData.filingDate && isNaN(Date.parse(caseData.filingDate))) {
      errors.push("Invalid filing date format")
    }

    return { valid: errors.length === 0, errors }
  }

  async getCaseStatistics() {
    const db = await this.getDatabase()
    const casesCollection = db.collection("cases")

    const stats = await casesCollection
      .aggregate([
        {
          $group: {
            _id: null,
            totalCases: { $sum: 1 },
            pendingCases: { $sum: { $cond: [{ $eq: ["$caseStatus", "pending"] }, 1, 0] } },
            disposedCases: { $sum: { $cond: [{ $eq: ["$caseStatus", "disposed"] }, 1, 0] } },
            avgDuration: { $avg: "$actualDuration" },
          },
        },
      ])
      .toArray()

    const caseTypeStats = await casesCollection
      .aggregate([
        {
          $group: {
            _id: "$caseType",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    return {
      overview: stats[0] || { totalCases: 0, pendingCases: 0, disposedCases: 0, avgDuration: 0 },
      caseTypes: caseTypeStats,
    }
  }
}
