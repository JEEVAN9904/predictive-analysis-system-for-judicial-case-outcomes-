import { connectToDatabase } from "@/lib/mongodb"

export interface DashboardStats {
  totalCases: number
  totalPredictions: number
  modelAccuracy: number
  avgConfidence: number
  casesByType: Array<{ type: string; count: number; successRate: number }>
  casesByStatus: Array<{ status: string; count: number }>
  judgePerformance: Array<{ judge: string; totalCases: number; avgDuration: number; successRate: number }>
  monthlyTrends: Array<{ month: string; cases: number; predictions: number }>
  outcomeDistribution: Array<{ outcome: string; count: number; percentage: number }>
}

export class AnalyticsService {
  private async getDatabase() {
    const { db } = await connectToDatabase()
    return db
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const db = await this.getDatabase()
    const casesCollection = db.collection("cases")
    const predictionsCollection = db.collection("predictions")
    const judgesCollection = db.collection("judges")

    // Basic counts
    const totalCases = await casesCollection.countDocuments()
    const totalPredictions = await predictionsCollection.countDocuments()

    // Model accuracy
    const accuracyData = await this.calculateModelAccuracy()

    // Average confidence
    const avgConfidenceResult = await predictionsCollection
      .aggregate([{ $group: { _id: null, avgConfidence: { $avg: "$confidence" } } }])
      .toArray()
    const avgConfidence = avgConfidenceResult[0]?.avgConfidence || 0

    // Cases by type with success rates
    const casesByType = await this.getCasesByType()

    // Cases by status
    const casesByStatus = await casesCollection
      .aggregate([{ $group: { _id: "$caseStatus", count: { $sum: 1 } } }])
      .toArray()
      .then((results) => results.map((r) => ({ status: r._id, count: r.count })))

    // Judge performance
    const judgePerformance = await this.getJudgePerformance()

    // Monthly trends
    const monthlyTrends = await this.getMonthlyTrends()

    // Outcome distribution
    const outcomeDistribution = await this.getOutcomeDistribution()

    return {
      totalCases,
      totalPredictions,
      modelAccuracy: accuracyData.accuracy,
      avgConfidence,
      casesByType,
      casesByStatus,
      judgePerformance,
      monthlyTrends,
      outcomeDistribution,
    }
  }

  private async calculateModelAccuracy(): Promise<{ accuracy: number; totalPredictions: number }> {
    const db = await this.getDatabase()
    const predictionsCollection = db.collection("predictions")

    const predictions = await predictionsCollection
      .aggregate([
        {
          $lookup: {
            from: "cases",
            localField: "caseId",
            foreignField: "caseId",
            as: "case",
          },
        },
        {
          $match: {
            "case.outcome": { $exists: true },
          },
        },
      ])
      .toArray()

    if (predictions.length === 0) {
      return { accuracy: 0, totalPredictions: 0 }
    }

    const correctPredictions = predictions.filter((pred: any) => pred.predictedOutcome === pred.case[0]?.outcome).length

    return {
      accuracy: correctPredictions / predictions.length,
      totalPredictions: predictions.length,
    }
  }

  private async getCasesByType() {
    const db = await this.getDatabase()
    const casesCollection = db.collection("cases")

    return await casesCollection
      .aggregate([
        {
          $group: {
            _id: "$caseType",
            count: { $sum: 1 },
            disposed: { $sum: { $cond: [{ $eq: ["$caseStatus", "disposed"] }, 1, 0] } },
            favorable: {
              $sum: {
                $cond: [{ $in: ["$outcome", ["acquitted", "dismissed", "settled"]] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            type: "$_id",
            count: 1,
            successRate: {
              $cond: [{ $gt: ["$disposed", 0] }, { $divide: ["$favorable", "$disposed"] }, 0],
            },
          },
        },
      ])
      .toArray()
  }

  private async getJudgePerformance() {
    const db = await this.getDatabase()
    const casesCollection = db.collection("cases")

    return await casesCollection
      .aggregate([
        {
          $match: {
            judgeName: { $exists: true, $ne: "" },
          },
        },
        {
          $group: {
            _id: "$judgeName",
            totalCases: { $sum: 1 },
            avgDuration: { $avg: "$actualDuration" },
            disposed: { $sum: { $cond: [{ $eq: ["$caseStatus", "disposed"] }, 1, 0] } },
            favorable: {
              $sum: {
                $cond: [{ $in: ["$outcome", ["acquitted", "dismissed", "settled"]] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            judge: "$_id",
            totalCases: 1,
            avgDuration: { $round: ["$avgDuration", 0] },
            successRate: {
              $cond: [{ $gt: ["$disposed", 0] }, { $divide: ["$favorable", "$disposed"] }, 0],
            },
          },
        },
        { $sort: { totalCases: -1 } },
        { $limit: 10 },
      ])
      .toArray()
  }

  private async getMonthlyTrends() {
    const db = await this.getDatabase()
    const casesCollection = db.collection("cases")
    const predictionsCollection = db.collection("predictions")

    const casesTrend = await casesCollection
      .aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$filingDate" },
              month: { $month: "$filingDate" },
            },
            cases: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ])
      .toArray()

    const predictionsTrend = await predictionsCollection
      .aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            predictions: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ])
      .toArray()

    // Merge trends
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const trends = casesTrend.map((c) => {
      const month = monthNames[c._id.month - 1]
      const prediction = predictionsTrend.find((p) => p._id.year === c._id.year && p._id.month === c._id.month)
      return {
        month,
        cases: c.cases,
        predictions: prediction?.predictions || 0,
      }
    })

    return trends
  }

  private async getOutcomeDistribution() {
    const db = await this.getDatabase()
    const casesCollection = db.collection("cases")

    const outcomes = await casesCollection
      .aggregate([
        {
          $match: {
            outcome: { $exists: true },
          },
        },
        {
          $group: {
            _id: "$outcome",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    const total = outcomes.reduce((sum, outcome) => sum + outcome.count, 0)

    return outcomes.map((outcome) => ({
      outcome: outcome._id,
      count: outcome.count,
      percentage: total > 0 ? (outcome.count / total) * 100 : 0,
    }))
  }
}
