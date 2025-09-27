"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PredictionAccuracyChart } from "@/components/charts/prediction-accuracy-chart"
import { CaseOutcomeHeatmap } from "@/components/charts/case-outcome-heatmap"
import { PredictionFactorsRadar } from "@/components/charts/prediction-factors-radar"
import { CaseDurationDistribution } from "@/components/charts/case-duration-distribution"
import { BarChart3, Download, TrendingUp, Target, Clock, Heater as HeatMap } from "lucide-react"
import Link from "next/link"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("12months")
  const [caseTypeFilter, setCaseTypeFilter] = useState("all")

  const handleExportData = () => {
    // Simulate data export
    const data = {
      timestamp: new Date().toISOString(),
      timeRange,
      caseTypeFilter,
      charts: ["accuracy", "heatmap", "factors", "duration"],
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `judicial-analytics-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Advanced Analytics</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Deep insights and visualizations from judicial case data and predictions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="12months">Last 12 months</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Select value={caseTypeFilter} onValueChange={setCaseTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="criminal">Criminal</SelectItem>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportData} variant="outline" className="bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="space-y-8">
          {/* Row 1: Model Performance */}
          <div className="grid lg:grid-cols-2 gap-8">
            <PredictionAccuracyChart />
            <PredictionFactorsRadar />
          </div>

          {/* Row 2: Case Analysis */}
          <div className="grid lg:grid-cols-2 gap-8">
            <CaseDurationDistribution />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Insights
                </CardTitle>
                <CardDescription>AI-generated insights from the data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Model Accuracy Improving</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Prediction accuracy has increased by 15% over the last 6 months, reaching 92% in December.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-600 mt-2" />
                      <div>
                        <h4 className="font-medium text-green-900 dark:text-green-100">Commercial Cases Trend</h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Commercial cases show the highest settlement rate at 75%, with faster resolution times.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-600 mt-2" />
                      <div>
                        <h4 className="font-medium text-orange-900 dark:text-orange-100">Court Load Impact</h4>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                          High court loads correlate with 23% longer case durations and lower prediction confidence.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-600 mt-2" />
                      <div>
                        <h4 className="font-medium text-purple-900 dark:text-purple-100">Judge Experience Factor</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                          Judges with 15+ years experience show 18% higher favorable outcome rates across all case
                          types.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Detailed Analysis */}
          <CaseOutcomeHeatmap />

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Prediction Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">2.3s</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Model Confidence</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">87%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Data Points</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">15.2K</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Judges</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">127</p>
                  </div>
                  <HeatMap className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
