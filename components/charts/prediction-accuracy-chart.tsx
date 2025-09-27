"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp } from "lucide-react"

interface AccuracyData {
  month: string
  accuracy: number
  predictions: number
  confidence: number
}

export function PredictionAccuracyChart() {
  const [data, setData] = useState<AccuracyData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate accuracy data over time
    const mockData: AccuracyData[] = [
      { month: "Jan", accuracy: 72, predictions: 45, confidence: 68 },
      { month: "Feb", accuracy: 75, predictions: 62, confidence: 71 },
      { month: "Mar", accuracy: 78, predictions: 89, confidence: 74 },
      { month: "Apr", accuracy: 81, predictions: 103, confidence: 77 },
      { month: "May", accuracy: 83, predictions: 127, confidence: 79 },
      { month: "Jun", accuracy: 85, predictions: 156, confidence: 82 },
      { month: "Jul", accuracy: 87, predictions: 178, confidence: 84 },
      { month: "Aug", accuracy: 86, predictions: 192, confidence: 83 },
      { month: "Sep", accuracy: 88, predictions: 215, confidence: 86 },
      { month: "Oct", accuracy: 89, predictions: 234, confidence: 87 },
      { month: "Nov", accuracy: 91, predictions: 267, confidence: 89 },
      { month: "Dec", accuracy: 92, predictions: 289, confidence: 91 },
    ]

    setTimeout(() => {
      setData(mockData)
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Model Performance Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-500">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Model Performance Over Time
        </CardTitle>
        <CardDescription>Tracking accuracy and confidence levels of predictions</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                `${value}${name === "predictions" ? "" : "%"}`,
                name === "accuracy" ? "Accuracy" : name === "confidence" ? "Avg Confidence" : "Predictions",
              ]}
            />
            <Legend />
            <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={3} name="Accuracy %" />
            <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} name="Confidence %" />
            <Line type="monotone" dataKey="predictions" stroke="#f59e0b" strokeWidth={2} name="Predictions" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
