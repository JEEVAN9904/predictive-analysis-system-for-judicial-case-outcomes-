export interface JudicialCase {
  _id?: string
  caseId: string
  caseType: "criminal" | "civil" | "constitutional" | "commercial" | "family" | "tax"
  filingDate: Date
  plaintiff: string
  defendant: string
  judgeName: string
  caseStatus: "pending" | "disposed" | "adjourned" | "dismissed"
  outcome?: "acquitted" | "convicted" | "dismissed" | "settled" | "pending"
  caseSummary?: string
  courtLevel: "district" | "high" | "supreme"
  state: string
  city: string
  priority: "low" | "medium" | "high"
  estimatedDuration?: number // in days
  actualDuration?: number // in days
  createdAt: Date
  updatedAt: Date
  caseText?: string
  aiGeneratedSummary?: string
  createdBy?: string // User ID who created the case
}

export interface Judge {
  _id?: string
  name: string
  experience: number // years
  specialization: string[]
  totalCases: number
  convictionRate: number
  averageCaseDuration: number
  courtLevel: "district" | "high" | "supreme"
  state: string
  createdAt: Date
  updatedAt: Date
  successRate: number
}

export interface Prediction {
  _id?: string
  caseId: string
  predictedOutcome: string
  confidence: number
  factors: {
    caseTypeScore: number
    judgeExperienceScore: number
    caseComplexityScore: number
    courtLoadScore: number
    historicalOutcomeScore: number
  }
  modelVersion: string
  createdAt: Date
  isAccepted: boolean
  status: string
  recommendation: string
  confidenceThreshold: number
  createdBy?: string // User ID who requested the prediction
}

export interface User {
  _id?: string
  email: string
  password: string // hashed
  name: string
  role: "administrator" | "legal_professional" | "analyst"
  permissions: string[]
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  organization?: string
  department?: string
}

export interface UserSession {
  _id?: string
  userId: string
  sessionToken: string
  expiresAt: Date
  createdAt: Date
  ipAddress?: string
  userAgent?: string
}

export interface CaseSummary {
  _id?: string
  caseId: string
  originalText: string
  generatedSummary: string
  confidence: number
  modelVersion: string
  createdAt: Date
  createdBy?: string
}
