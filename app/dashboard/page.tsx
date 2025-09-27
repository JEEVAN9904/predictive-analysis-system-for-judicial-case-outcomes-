"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  BarChart3,
  TrendingUp,
  Users,
  Scale,
  Target,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import type { DashboardStats } from "@/lib/services/analytics"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchStats = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/analytics")
      if (!response.ok) throw new Error("Failed to fetch analytics")

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError("Failed to load dashboard data")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchStats}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Back to Home
            </Link>
            <Button onClick={fetchStats} variant="outline" size="sm" className="bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive insights and analytics from the judicial prediction system
          </p>
        </div>

        {stats && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Cases</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCases}</p>
                    </div>
                    <Scale className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Predictions Made</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPredictions}</p>
                    </div>
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Model Accuracy</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round(stats.modelAccuracy * 100)}%
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Confidence</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round(stats.avgConfidence * 100)}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Cases by Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Cases by Type
                  </CardTitle>
                  <CardDescription>Distribution and success rates by case type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.casesByType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Outcome Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Outcome Distribution</CardTitle>
                  <CardDescription>Distribution of case outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.outcomeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ outcome, percentage }) => `${outcome} (${percentage.toFixed(1)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {stats.outcomeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Monthly Trends
                  </CardTitle>
                  <CardDescription>Cases filed and predictions made over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="cases" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="predictions" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Case Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Case Status Overview</CardTitle>
                  <CardDescription>Current status of all cases in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.casesByStatus.map((status, index) => (
                      <div key={status.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="capitalize font-medium">{status.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">{status.count} cases</span>
                          <Badge variant="secondary">{Math.round((status.count / stats.totalCases) * 100)}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Judge Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Judge Performance
                </CardTitle>
                <CardDescription>Performance metrics for judges with the most cases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Judge</th>
                        <th className="text-left py-2">Total Cases</th>
                        <th className="text-left py-2">Avg Duration (days)</th>
                        <th className="text-left py-2">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.judgePerformance.map((judge, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 font-medium">{judge.judge}</td>
                          <td className="py-3">{judge.totalCases}</td>
                          <td className="py-3">{judge.avgDuration || "N/A"}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Progress value={judge.successRate * 100} className="w-20" />
                              <span className="text-sm">{Math.round(judge.successRate * 100)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
