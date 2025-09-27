"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Clock } from "lucide-react"

interface DurationData {
  range: string
  criminal: number
  civil: number
  commercial: number
  family: number
}

export function CaseDurationDistribution() {
  const [data, setData] = useState<DurationData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate duration distribution data
    const mockData: DurationData[] = [
      { range: "0-30 days", criminal: 12, civil: 8, commercial: 15, family: 10 },
      { range: "31-90 days", criminal: 28, civil: 22, commercial: 35, family: 25 },
      { range: "91-180 days", criminal: 45, civil: 38, commercial: 28, family: 32 },
      { range: "181-365 days", criminal: 67, civil: 89, commercial: 45, family: 58 },
      { range: "1-2 years", criminal: 34, civil: 67, commercial: 23, family: 41 },
      { range: "2+ years", criminal: 18, civil: 45, commercial: 12, family: 28 },
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
            <Clock className="h-5 w-5" />
            Case Duration Distribution
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
          <Clock className="h-5 w-5" />
          Case Duration Distribution
        </CardTitle>
        <CardDescription>Average case resolution time by type and duration range</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="criminal" stackId="a" fill="#ef4444" name="Criminal" />
            <Bar dataKey="civil" stackId="a" fill="#3b82f6" name="Civil" />
            <Bar dataKey="commercial" stackId="a" fill="#10b981" name="Commercial" />
            <Bar dataKey="family" stackId="a" fill="#f59e0b" name="Family" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
