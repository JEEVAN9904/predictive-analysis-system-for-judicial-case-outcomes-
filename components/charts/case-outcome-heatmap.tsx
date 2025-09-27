"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3 } from "lucide-react"

interface HeatmapData {
  caseType: string
  judge: string
  outcomes: {
    acquitted: number
    convicted: number
    dismissed: number
    settled: number
  }
  total: number
  successRate: number
}

export function CaseOutcomeHeatmap() {
  const [data, setData] = useState<HeatmapData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate heatmap data
    const mockData: HeatmapData[] = [
      {
        caseType: "Criminal",
        judge: "Justice A.K. Sharma",
        outcomes: { acquitted: 45, convicted: 78, dismissed: 12, settled: 5 },
        total: 140,
        successRate: 0.41,
      },
      {
        caseType: "Civil",
        judge: "Justice B.R. Patel",
        outcomes: { acquitted: 0, convicted: 0, dismissed: 23, settled: 67 },
        total: 90,
        successRate: 0.74,
      },
      {
        caseType: "Commercial",
        judge: "Justice C.D. Kumar",
        outcomes: { acquitted: 0, convicted: 0, dismissed: 15, settled: 45 },
        total: 60,
        successRate: 0.75,
      },
      {
        caseType: "Criminal",
        judge: "Justice D.E. Singh",
        outcomes: { acquitted: 32, convicted: 58, dismissed: 8, settled: 2 },
        total: 100,
        successRate: 0.42,
      },
      {
        caseType: "Family",
        judge: "Justice E.F. Gupta",
        outcomes: { acquitted: 0, convicted: 0, dismissed: 18, settled: 42 },
        total: 60,
        successRate: 0.7,
      },
    ]

    setTimeout(() => {
      setData(mockData)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getIntensityColor = (rate: number) => {
    if (rate >= 0.8) return "bg-green-500"
    if (rate >= 0.6) return "bg-green-400"
    if (rate >= 0.4) return "bg-yellow-400"
    if (rate >= 0.2) return "bg-orange-400"
    return "bg-red-400"
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "acquitted":
      case "dismissed":
      case "settled":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "convicted":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Case Outcome Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-500">Loading heatmap...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Case Outcome Heatmap
        </CardTitle>
        <CardDescription>Success rates by case type and judge combination</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">
                    {item.caseType}
                  </Badge>
                  <span className="font-medium">{item.judge}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${getIntensityColor(item.successRate)}`} />
                  <span className="text-sm font-medium">{Math.round(item.successRate * 100)}% success</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(item.outcomes).map(([outcome, count]) => (
                  <div key={outcome} className="text-center">
                    <div className={`text-xs px-2 py-1 rounded ${getOutcomeColor(outcome)}`}>
                      {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
                    </div>
                    <div className="text-sm font-medium mt-1">{count}</div>
                  </div>
                ))}
              </div>

              <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">Total cases: {item.total}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs">
          <span className="font-medium">Success Rate:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-400" />
            <span>0-20%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-400" />
            <span>20-40%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-400" />
            <span>40-60%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-400" />
            <span>60-80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>80-100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
