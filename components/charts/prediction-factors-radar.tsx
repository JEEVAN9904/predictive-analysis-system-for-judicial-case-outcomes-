"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts"
import { Target } from "lucide-react"

interface RadarData {
  factor: string
  currentCase: number
  avgSuccessful: number
  avgUnsuccessful: number
}

interface PredictionFactorsRadarProps {
  factors?: {
    caseTypeScore: number
    judgeExperienceScore: number
    caseComplexityScore: number
    courtLoadScore: number
    historicalOutcomeScore: number
  }
}

export function PredictionFactorsRadar({ factors }: PredictionFactorsRadarProps) {
  const data: RadarData[] = [
    {
      factor: "Case Type",
      currentCase: factors ? factors.caseTypeScore * 100 : 75,
      avgSuccessful: 82,
      avgUnsuccessful: 45,
    },
    {
      factor: "Judge Experience",
      currentCase: factors ? factors.judgeExperienceScore * 100 : 68,
      avgSuccessful: 78,
      avgUnsuccessful: 52,
    },
    {
      factor: "Case Complexity",
      currentCase: factors ? (1 - factors.caseComplexityScore) * 100 : 72,
      avgSuccessful: 71,
      avgUnsuccessful: 38,
    },
    {
      factor: "Court Load",
      currentCase: factors ? factors.courtLoadScore * 100 : 65,
      avgSuccessful: 69,
      avgUnsuccessful: 41,
    },
    {
      factor: "Historical Pattern",
      currentCase: factors ? factors.historicalOutcomeScore * 100 : 79,
      avgSuccessful: 85,
      avgUnsuccessful: 35,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Prediction Factors Analysis
        </CardTitle>
        <CardDescription>Comparison of current case factors with historical patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="factor" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar
              name="Current Case"
              dataKey="currentCase"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Avg Successful Cases"
              dataKey="avgSuccessful"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Radar
              name="Avg Unsuccessful Cases"
              dataKey="avgUnsuccessful"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
