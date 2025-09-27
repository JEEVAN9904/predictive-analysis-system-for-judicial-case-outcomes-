import { connectToDatabase } from "@/lib/mongodb"
import type { JudicialCase, Judge, Prediction } from "@/lib/models/case"

interface PredictionFeatures {
  caseTypeScore: number
  judgeExperienceScore: number
  caseComplexityScore: number
  courtLoadScore: number
  historicalOutcomeScore: number
}

interface PredictionResult {
  predictedOutcome: string
  confidence: number
  factors: PredictionFeatures
  reasoning: string[]
  isAccepted: boolean
  confidenceThreshold: number
  status: string
  recommendation: string
}

export class PredictionEngine {
  private async getDatabase() {
    try {
      const { db } = await connectToDatabase()
      return db
    } catch (error) {
      console.error("[v0] Database connection failed in prediction engine:", error)
      throw new Error("Database connection failed")
    }
  }

  async predictCaseOutcome(caseData: Partial<JudicialCase>): Promise<PredictionResult> {
    try {
      console.log("[v0] Starting prediction for case:", caseData.caseId)
      const db = await this.getDatabase()

      if (!caseData.caseType) {
        throw new Error("Case type is required for prediction")
      }

      // Get judge information
      const judge = await this.getJudgeInfo(caseData.judgeName || "")
      console.log("[v0] Judge info retrieved:", judge?.name || "No judge found")

      // Calculate prediction features
      const features = await this.calculateFeatures(caseData, judge)
      console.log("[v0] Features calculated:", features)

      // Apply machine learning model (simplified rule-based for demo)
      const prediction = this.applyPredictionModel(features, caseData)
      console.log("[v0] Prediction generated:", prediction)

      const confidenceThreshold = 0.85
      const isAccepted = prediction.confidence >= confidenceThreshold

      const enhancedPrediction = {
        ...prediction,
        isAccepted,
        confidenceThreshold,
        status: isAccepted ? "Accept" : "Reject",
        recommendation: isAccepted
          ? "Prediction confidence is high - can be used for decision making"
          : "Prediction confidence is low - manual review recommended",
      }

      // Store prediction in database
      if (caseData.caseId) {
        await this.storePrediction(caseData.caseId, enhancedPrediction)
      }

      return enhancedPrediction
    } catch (error) {
      console.error("[v0] Prediction error:", error)
      throw error
    }
  }

  private async getJudgeInfo(judgeName: string): Promise<Judge | null> {
    if (!judgeName) return null

    try {
      const db = await this.getDatabase()
      const judgesCollection = db.collection<Judge>("judges")
      return await judgesCollection.findOne({ name: judgeName })
    } catch (error) {
      console.error("[v0] Error fetching judge info:", error)
      return null
    }
  }

  private async calculateFeatures(caseData: Partial<JudicialCase>, judge: Judge | null): Promise<PredictionFeatures> {
    const db = await this.getDatabase()
    const casesCollection = db.collection<JudicialCase>("cases")

    // Case Type Score (based on historical success rates)
    const caseTypeScore = await this.calculateCaseTypeScore(caseData.caseType || "", casesCollection)

    // Judge Experience Score
    const judgeExperienceScore = this.calculateJudgeScore(judge)

    // Case Complexity Score (based on case summary length, parties involved, etc.)
    const caseComplexityScore = this.calculateComplexityScore(caseData)

    // Court Load Score (based on pending cases in the court)
    const courtLoadScore = await this.calculateCourtLoadScore(
      caseData.state || "",
      caseData.courtLevel || "district",
      casesCollection,
    )

    // Historical Outcome Score
    const historicalOutcomeScore = await this.calculateHistoricalScore(caseData, casesCollection)

    return {
      caseTypeScore,
      judgeExperienceScore,
      caseComplexityScore,
      courtLoadScore,
      historicalOutcomeScore,
    }
  }

  private async calculateCaseTypeScore(caseType: string, casesCollection: any): Promise<number> {
    const typeStats = await casesCollection
      .aggregate([
        { $match: { caseType, outcome: { $exists: true } } },
        {
          $group: {
            _id: "$outcome",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    if (typeStats.length === 0) return 0.5 // Neutral score if no data

    const totalCases = typeStats.reduce((sum: number, stat: any) => sum + stat.count, 0)
    const favorableOutcomes = typeStats
      .filter((stat: any) => ["acquitted", "dismissed", "settled"].includes(stat._id))
      .reduce((sum: number, stat: any) => sum + stat.count, 0)

    return favorableOutcomes / totalCases
  }

  private calculateJudgeScore(judge: Judge | null): number {
    if (!judge) return 0.5 // Neutral score if no judge data

    // Normalize judge experience and conviction rate
    const experienceScore = Math.min(judge.experience / 20, 1) // Max 20 years
    const efficiencyScore = judge.averageCaseDuration > 0 ? Math.max(0, 1 - judge.averageCaseDuration / 365) : 0.5

    return (experienceScore + efficiencyScore) / 2
  }

  private calculateComplexityScore(caseData: Partial<JudicialCase>): number {
    let complexity = 0.5 // Base complexity

    // Adjust based on case summary length
    if (caseData.caseSummary) {
      const summaryLength = caseData.caseSummary.length
      if (summaryLength > 500) complexity += 0.2
      else if (summaryLength < 100) complexity -= 0.1
    }

    // Adjust based on priority
    if (caseData.priority === "high") complexity += 0.2
    else if (caseData.priority === "low") complexity -= 0.1

    // Adjust based on court level
    if (caseData.courtLevel === "supreme") complexity += 0.3
    else if (caseData.courtLevel === "high") complexity += 0.1

    return Math.max(0, Math.min(1, complexity))
  }

  private async calculateCourtLoadScore(state: string, courtLevel: string, casesCollection: any): Promise<number> {
    const pendingCases = await casesCollection.countDocuments({
      state,
      courtLevel,
      caseStatus: "pending",
    })

    // Normalize court load (assuming 100 pending cases is high load)
    const loadScore = Math.max(0, 1 - pendingCases / 100)
    return loadScore
  }

  private async calculateHistoricalScore(caseData: Partial<JudicialCase>, casesCollection: any): Promise<number> {
    // Find similar cases based on type and judge
    const similarCases = await casesCollection
      .find({
        caseType: caseData.caseType,
        judgeName: caseData.judgeName,
        outcome: { $exists: true },
      })
      .limit(50)
      .toArray()

    if (similarCases.length === 0) return 0.5

    const favorableOutcomes = similarCases.filter((c: JudicialCase) =>
      ["acquitted", "dismissed", "settled"].includes(c.outcome || ""),
    ).length

    return favorableOutcomes / similarCases.length
  }

  private applyPredictionModel(features: PredictionFeatures, caseData: Partial<JudicialCase>): PredictionResult {
    // Weighted scoring system
    const weights = {
      caseTypeScore: 0.25,
      judgeExperienceScore: 0.2,
      caseComplexityScore: 0.15,
      courtLoadScore: 0.15,
      historicalOutcomeScore: 0.25,
    }

    const overallScore =
      features.caseTypeScore * weights.caseTypeScore +
      features.judgeExperienceScore * weights.judgeExperienceScore +
      (1 - features.caseComplexityScore) * weights.caseComplexityScore + // Lower complexity = better outcome
      features.courtLoadScore * weights.courtLoadScore +
      features.historicalOutcomeScore * weights.historicalOutcomeScore

    // Determine predicted outcome based on case type and score
    let predictedOutcome: string
    let confidence: number

    if (caseData.caseType === "criminal") {
      if (overallScore > 0.7) {
        predictedOutcome = "acquitted"
        confidence = overallScore
      } else if (overallScore > 0.4) {
        predictedOutcome = "convicted"
        confidence = 1 - overallScore
      } else {
        predictedOutcome = "convicted"
        confidence = 0.8
      }
    } else {
      // Civil cases
      if (overallScore > 0.6) {
        predictedOutcome = "settled"
        confidence = overallScore
      } else if (overallScore > 0.3) {
        predictedOutcome = "dismissed"
        confidence = overallScore
      } else {
        predictedOutcome = "dismissed"
        confidence = 0.7
      }
    }

    // Generate reasoning
    const reasoning = this.generateReasoning(features, caseData, overallScore)

    return {
      predictedOutcome,
      confidence: Math.round(confidence * 100) / 100,
      factors: features,
      reasoning,
    }
  }

  private generateReasoning(
    features: PredictionFeatures,
    caseData: Partial<JudicialCase>,
    overallScore: number,
  ): string[] {
    const reasoning: string[] = []

    if (features.caseTypeScore > 0.7) {
      reasoning.push(`High success rate for ${caseData.caseType} cases historically`)
    } else if (features.caseTypeScore < 0.3) {
      reasoning.push(`Lower success rate for ${caseData.caseType} cases historically`)
    }

    if (features.judgeExperienceScore > 0.7) {
      reasoning.push("Judge has extensive experience and efficient case handling")
    } else if (features.judgeExperienceScore < 0.3) {
      reasoning.push("Judge has limited experience or slower case processing")
    }

    if (features.caseComplexityScore > 0.7) {
      reasoning.push("Case appears complex based on details and court level")
    } else if (features.caseComplexityScore < 0.3) {
      reasoning.push("Case appears straightforward with clear facts")
    }

    if (features.courtLoadScore < 0.3) {
      reasoning.push("High court load may delay proceedings")
    } else if (features.courtLoadScore > 0.7) {
      reasoning.push("Court has manageable caseload for timely resolution")
    }

    if (features.historicalOutcomeScore > 0.7) {
      reasoning.push("Similar cases with this judge have favorable outcomes")
    } else if (features.historicalOutcomeScore < 0.3) {
      reasoning.push("Similar cases with this judge have less favorable outcomes")
    }

    if (reasoning.length === 0) {
      reasoning.push("Prediction based on balanced analysis of available factors")
    }

    return reasoning
  }

  private async storePrediction(caseId: string, prediction: any): Promise<void> {
    try {
      const db = await this.getDatabase()
      const predictionsCollection = db.collection<Prediction>("predictions")

      const predictionDoc: Prediction = {
        caseId,
        predictedOutcome: prediction.predictedOutcome,
        confidence: prediction.confidence,
        factors: prediction.factors,
        modelVersion: "v1.0",
        createdAt: new Date(),
        isAccepted: prediction.isAccepted,
        status: prediction.status,
        recommendation: prediction.recommendation,
      }

      await predictionsCollection.replaceOne({ caseId }, predictionDoc, { upsert: true })
      console.log("[v0] Prediction stored successfully for case:", caseId)
    } catch (error) {
      console.error("[v0] Error storing prediction:", error)
      throw error
    }
  }

  async getPredictionHistory(caseId: string): Promise<Prediction[]> {
    const db = await this.getDatabase()
    const predictionsCollection = db.collection<Prediction>("predictions")

    return await predictionsCollection.find({ caseId }).sort({ createdAt: -1 }).toArray()
  }

  async getModelAccuracy(): Promise<{ accuracy: number; totalPredictions: number }> {
    const db = await this.getDatabase()
    const predictionsCollection = db.collection("predictions")
    const casesCollection = db.collection("cases")

    // Get predictions for cases with known outcomes
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

  async generateCaseSummary(caseText: string): Promise<string> {
    try {
      // Simulate AI-powered case summary generation
      // In a real implementation, this would use an LLM like GPT or a specialized legal AI model

      const sentences = caseText.split(".").filter((s) => s.trim().length > 0)
      const keyPhrases = [
        "plaintiff",
        "defendant",
        "court",
        "judge",
        "evidence",
        "testimony",
        "verdict",
        "damages",
        "contract",
        "breach",
        "negligence",
        "liability",
      ]

      // Extract key sentences containing legal terms
      const keySentences = sentences
        .filter((sentence) => keyPhrases.some((phrase) => sentence.toLowerCase().includes(phrase.toLowerCase())))
        .slice(0, 3)

      if (keySentences.length === 0) {
        return "Case summary: " + sentences.slice(0, 2).join(". ") + "."
      }

      return "Case Summary: " + keySentences.join(". ") + "."
    } catch (error) {
      console.error("[v0] Error generating case summary:", error)
      return "Unable to generate case summary at this time."
    }
  }
}
