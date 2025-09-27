import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Scale, BarChart3, Database, Brain, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Scale className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Judicial Case Outcome Predictor</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            AI-powered predictive analysis system for forecasting judicial case outcomes in India. Leverage machine
            learning to provide data-driven insights to legal professionals.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>AI Predictions</CardTitle>
              <CardDescription>
                Advanced machine learning models analyze case patterns to predict outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/predict">
                <Button className="w-full">Make Prediction</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Comprehensive visualizations and insights from historical case data</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full bg-transparent">
                  View Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Database className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Case Management</CardTitle>
              <CardDescription>
                Manage and analyze your case database with powerful search and filtering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/cases">
                <Button variant="outline" className="w-full bg-transparent">
                  Manage Cases
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Deep insights with interactive charts and data visualizations</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/analytics">
                <Button variant="outline" className="w-full bg-transparent">
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">System Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">10,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Cases Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">92%</div>
              <div className="text-gray-600 dark:text-gray-300">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">500+</div>
              <div className="text-gray-600 dark:text-gray-300">Judges Profiled</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">System Availability</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
