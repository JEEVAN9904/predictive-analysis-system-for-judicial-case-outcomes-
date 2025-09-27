"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, AlertCircle, CheckCircle, BarChart3, FileText, Shield, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface PredictionResult {
  predictedOutcome: string
  confidence: number
  factors: {
    caseTypeScore: number
    judgeExperienceScore: number
    caseComplexityScore: number
    courtLoadScore: number
    historicalOutcomeScore: number
  }
  reasoning: string[]
  isAccepted: boolean
  confidenceThreshold: number
  status: string
  recommendation: string
}

export default function PredictPage() {
  const [formData, setFormData] = useState({
    caseId: "",
    caseType: "",
    judgeName: "",
    plaintiff: "",
    defendant: "",
    caseSummary: "",
    courtLevel: "district",
    state: "",
    city: "",
    priority: "medium",
    caseText: "",
  })

  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [caseSummary, setCaseSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePredict = async () => {
    if (!formData.caseId || !formData.caseType) {
      setError("Case ID and Case Type are required")
      return
    }

    setIsLoading(true)
    setError("")
    setPrediction(null)
    setCaseSummary(null)

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          description: formData.caseSummary, // For backward compatibility
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPrediction(result.prediction)
        if (result.caseSummary) {
          setCaseSummary(result.caseSummary)
        }
      } else {
        setError(result.error || "Prediction failed")
        if (result.details) {
          console.error("Prediction error details:", result.details)
        }
      }
    } catch (err) {
      setError("Network error occurred")
      console.error("Network error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome.toLowerCase()) {
      case "acquitted":
      case "dismissed":
      case "settled":
        return "text-green-600"
      case "convicted":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusBadgeVariant = (status: string) => {
    return status === "Accept" ? "default" : "destructive"
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Back to Home
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Case Outcome Prediction</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Use AI to predict the likely outcome of judicial cases based on historical data and case factors
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Case Information
              </CardTitle>
              <CardDescription>Enter the case details to generate a prediction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Case ID *</label>
                  <Input
                    placeholder="e.g., CASE001"
                    value={formData.caseId}
                    onChange={(e) => handleInputChange("caseId", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Case Type *</label>
                  <Select value={formData.caseType} onValueChange={(value) => handleInputChange("caseType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="criminal">Criminal</SelectItem>
                      <SelectItem value="civil">Civil</SelectItem>
                      <SelectItem value="constitutional">Constitutional</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="tax">Tax</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Judge Name</label>
                <Input
                  placeholder="e.g., Justice A.K. Sharma"
                  value={formData.judgeName}
                  onChange={(e) => handleInputChange("judgeName", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Plaintiff</label>
                  <Input
                    placeholder="Plaintiff name"
                    value={formData.plaintiff}
                    onChange={(e) => handleInputChange("plaintiff", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Defendant</label>
                  <Input
                    placeholder="Defendant name"
                    value={formData.defendant}
                    onChange={(e) => handleInputChange("defendant", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Court Level</label>
                  <Select value={formData.courtLevel} onValueChange={(value) => handleInputChange("courtLevel", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="district">District</SelectItem>
                      <SelectItem value="high">High Court</SelectItem>
                      <SelectItem value="supreme">Supreme Court</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">State</label>
                  <Input
                    placeholder="e.g., Maharashtra"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Case Summary</label>
                <Textarea
                  placeholder="Brief description of the case..."
                  value={formData.caseSummary}
                  onChange={(e) => handleInputChange("caseSummary", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Detailed Case Text (Optional)
                  <span className="text-xs text-gray-500 ml-2">For AI-generated summary</span>
                </label>
                <Textarea
                  placeholder="Enter detailed case information for AI-powered summary generation..."
                  value={formData.caseText}
                  onChange={(e) => handleInputChange("caseText", e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={handlePredict} disabled={isLoading} className="w-full">
                {isLoading ? "Analyzing..." : "Predict Outcome"}
              </Button>

              {error && (
                <Alert className="border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Prediction Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Prediction Results
              </CardTitle>
              <CardDescription>AI-generated prediction based on historical data and case factors</CardDescription>
            </CardHeader>
            <CardContent>
              {prediction ? (
                <div className="space-y-6">
                  {caseSummary && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        AI-Generated Case Summary
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{caseSummary}</p>
                    </div>
                  )}

                  {/* Main Prediction with Accept/Reject Status */}
                  <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-center mb-4">
                      <Badge variant={getStatusBadgeVariant(prediction.status)} className="flex items-center gap-1">
                        {prediction.status === "Accept" ? (
                          <Shield className="h-3 w-3" />
                        ) : (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                        {prediction.status}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Predicted Outcome</div>
                    <div className={`text-2xl font-bold capitalize ${getOutcomeColor(prediction.predictedOutcome)}`}>
                      {prediction.predictedOutcome}
                    </div>
                    <div className="mt-2">
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Confidence Level</div>
                      <div className={`text-xl font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                        {Math.round(prediction.confidence * 100)}%
                      </div>
                      <Progress value={prediction.confidence * 100} className="mt-2" />
                      <div className="text-xs text-gray-500 mt-1">
                        Threshold: {Math.round(prediction.confidenceThreshold * 100)}%
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded border">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recommendation</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{prediction.recommendation}</div>
                    </div>
                  </div>

                  {/* Factor Analysis */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Factor Analysis
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(prediction.factors).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm capitalize">
                            {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                          </span>
                          <div className="flex items-center gap-2">
                            <Progress value={value * 100} className="w-20" />
                            <span className="text-sm font-medium w-12">{Math.round(value * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div>
                    <h3 className="font-medium mb-3">Key Factors</h3>
                    <div className="space-y-2">
                      {prediction.reasoning.map((reason, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!prediction.isAccepted && (
                    <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                        <strong>Manual Review Recommended:</strong> This prediction has low confidence and should be
                        reviewed by a legal professional before making any decisions.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter case details and click "Predict Outcome" to see AI analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
