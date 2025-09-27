"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, CheckCircle, AlertCircle, Database } from "lucide-react"
import Link from "next/link"

export default function DataIngestionPage() {
  const [dataType, setDataType] = useState<"cases" | "judges">("cases")
  const [jsonData, setJsonData] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null)
  const [stats, setStats] = useState<any>(null)

  const handleIngest = async () => {
    if (!jsonData.trim()) {
      setResult({ success: 0, errors: ["Please provide JSON data to ingest"] })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const data = JSON.parse(jsonData)
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: dataType, data: Array.isArray(data) ? data : [data] }),
      })

      const result = await response.json()
      setResult(result)

      if (result.success > 0) {
        fetchStats()
      }
    } catch (error) {
      setResult({ success: 0, errors: ["Invalid JSON format or server error"] })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/ingest")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const sampleCaseData = `[
  {
    "caseId": "CASE003",
    "caseType": "criminal",
    "filingDate": "2024-03-15",
    "plaintiff": "State of Karnataka",
    "defendant": "Jane Smith",
    "judgeName": "Justice C.D. Kumar",
    "caseStatus": "pending",
    "caseSummary": "Fraud case involving financial misconduct",
    "courtLevel": "district",
    "state": "Karnataka",
    "city": "Bangalore",
    "priority": "high"
  }
]`

  const sampleJudgeData = `[
  {
    "name": "Justice C.D. Kumar",
    "experience": 18,
    "specialization": ["criminal", "commercial"],
    "totalCases": 950,
    "convictionRate": 0.72,
    "averageCaseDuration": 190,
    "courtLevel": "district",
    "state": "Karnataka"
  }
]`

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Data Ingestion System</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Import case and judge data into the judicial prediction system
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Data Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Data
              </CardTitle>
              <CardDescription>Upload JSON data for cases or judges to the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Data Type</label>
                <Select value={dataType} onValueChange={(value: "cases" | "judges") => setDataType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cases">Cases</SelectItem>
                    <SelectItem value="judges">Judges</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">JSON Data</label>
                <Textarea
                  placeholder={`Paste your ${dataType} JSON data here...`}
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleIngest} disabled={isLoading} className="flex-1">
                  {isLoading ? "Processing..." : "Ingest Data"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setJsonData(dataType === "cases" ? sampleCaseData : sampleJudgeData)}
                >
                  Load Sample
                </Button>
              </div>

              {result && (
                <Alert className={result.errors.length > 0 ? "border-red-200" : "border-green-200"}>
                  <div className="flex items-center gap-2">
                    {result.errors.length > 0 ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <AlertDescription>
                      {result.success > 0 && (
                        <div className="text-green-600 mb-2">Successfully ingested {result.success} records</div>
                      )}
                      {result.errors.length > 0 && (
                        <div className="text-red-600">
                          <div className="font-medium mb-1">Errors:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {result.errors.map((error, index) => (
                              <li key={index} className="text-sm">
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Statistics
              </CardTitle>
              <CardDescription>Current state of the judicial database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={fetchStats} variant="outline" className="w-full bg-transparent">
                  Refresh Statistics
                </Button>

                {stats && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.overview.totalCases}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Total Cases</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.overview.disposedCases}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Disposed Cases</div>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{stats.overview.pendingCases}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Pending Cases</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round(stats.overview.avgDuration || 0)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Avg Duration (days)</div>
                      </div>
                    </div>

                    {stats.caseTypes.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2">Cases by Type</h3>
                        <div className="space-y-2">
                          {stats.caseTypes.map((type: any) => (
                            <div key={type._id} className="flex justify-between items-center">
                              <span className="capitalize">{type._id}</span>
                              <span className="font-medium">{type.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
