"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Mail, User, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "legal_professional" as "administrator" | "legal_professional" | "analyst",
    organization: "",
    department: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
      const payload = isLogin ? { email: formData.email, password: formData.password } : formData

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        if (isLogin) {
          router.push("/dashboard")
        } else {
          setSuccess("Account created successfully! Please login.")
          setIsLogin(true)
          setFormData({ ...formData, password: "" })
        }
      } else {
        setError(result.error || "Operation failed")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Judicial Prediction System</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {isLogin ? "Login" : "Register"}
            </CardTitle>
            <CardDescription>
              {isLogin ? "Enter your credentials to access the system" : "Fill in your details to create an account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleInputChange("role", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="legal_professional">Legal Professional</option>
                      <option value="analyst">Analyst</option>
                      <option value="administrator">Administrator</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Organization</label>
                      <Input
                        type="text"
                        placeholder="Your organization"
                        value={formData.organization}
                        onChange={(e) => handleInputChange("organization", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Department</label>
                      <Input
                        type="text"
                        placeholder="Your department"
                        value={formData.department}
                        onChange={(e) => handleInputChange("department", e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
              </Button>

              {error && (
                <Alert className="border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">{success}</AlertDescription>
                </Alert>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError("")
                    setSuccess("")
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {isLogin ? "Don't have an account? Register here" : "Already have an account? Login here"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
