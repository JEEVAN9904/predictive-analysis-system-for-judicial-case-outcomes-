"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Calendar,
  User,
  Scale,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import type { JudicialCase } from "@/lib/models/case"

interface CasesResponse {
  cases: JudicialCase[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function CasesPage() {
  const [cases, setCases] = useState<JudicialCase[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedCase, setSelectedCase] = useState<JudicialCase | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [newCase, setNewCase] = useState({
    caseId: "",
    caseType: "",
    filingDate: "",
    plaintiff: "",
    defendant: "",
    judgeName: "",
    caseSummary: "",
    courtLevel: "district",
    state: "",
    city: "",
    priority: "medium",
  })

  const fetchCases = async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== "all" && { caseType: filterType }),
        ...(filterStatus !== "all" && { status: filterStatus }),
      })

      const response = await fetch(`/api/cases?${params}`)
      const data: CasesResponse = await response.json()

      setCases(data.cases)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching cases:", error)
      setMessage({ type: "error", text: "Failed to fetch cases" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCase = async () => {
    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCase),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: "success", text: "Case created successfully" })
        setIsCreateDialogOpen(false)
        setNewCase({
          caseId: "",
          caseType: "",
          filingDate: "",
          plaintiff: "",
          defendant: "",
          judgeName: "",
          caseSummary: "",
          courtLevel: "district",
          state: "",
          city: "",
          priority: "medium",
        })
        fetchCases()
      } else {
        setMessage({ type: "error", text: result.error })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create case" })
    }
  }

  const handleDeleteCase = async (caseId: string) => {
    if (!confirm("Are you sure you want to delete this case?")) return

    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: "success", text: "Case deleted successfully" })
        fetchCases()
      } else {
        setMessage({ type: "error", text: result.error })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete case" })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disposed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "adjourned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "dismissed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  useEffect(() => {
    fetchCases()
  }, [searchTerm, filterType, filterStatus])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Case Management</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage and track judicial cases in the system</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Case
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Case</DialogTitle>
                  <DialogDescription>Enter the details for the new judicial case</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Case ID *</label>
                    <Input
                      placeholder="e.g., CASE001"
                      value={newCase.caseId}
                      onChange={(e) => setNewCase({ ...newCase, caseId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Case Type *</label>
                    <Select
                      value={newCase.caseType}
                      onValueChange={(value) => setNewCase({ ...newCase, caseType: value })}
                    >
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">Filing Date *</label>
                    <Input
                      type="date"
                      value={newCase.filingDate}
                      onChange={(e) => setNewCase({ ...newCase, filingDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Judge Name</label>
                    <Input
                      placeholder="e.g., Justice A.K. Sharma"
                      value={newCase.judgeName}
                      onChange={(e) => setNewCase({ ...newCase, judgeName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Plaintiff</label>
                    <Input
                      placeholder="Plaintiff name"
                      value={newCase.plaintiff}
                      onChange={(e) => setNewCase({ ...newCase, plaintiff: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Defendant</label>
                    <Input
                      placeholder="Defendant name"
                      value={newCase.defendant}
                      onChange={(e) => setNewCase({ ...newCase, defendant: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">State</label>
                    <Input
                      placeholder="e.g., Maharashtra"
                      value={newCase.state}
                      onChange={(e) => setNewCase({ ...newCase, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">City</label>
                    <Input
                      placeholder="e.g., Mumbai"
                      value={newCase.city}
                      onChange={(e) => setNewCase({ ...newCase, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Court Level</label>
                    <Select
                      value={newCase.courtLevel}
                      onValueChange={(value) => setNewCase({ ...newCase, courtLevel: value })}
                    >
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
                    <label className="text-sm font-medium mb-2 block">Priority</label>
                    <Select
                      value={newCase.priority}
                      onValueChange={(value) => setNewCase({ ...newCase, priority: value })}
                    >
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
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-2 block">Case Summary</label>
                    <Textarea
                      placeholder="Brief description of the case..."
                      value={newCase.caseSummary}
                      onChange={(e) => setNewCase({ ...newCase, caseSummary: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="bg-transparent">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCase}>Create Case</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert className={`mb-6 ${message.type === "error" ? "border-red-200" : "border-green-200"}`}>
            {message.type === "error" ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription className={message.type === "error" ? "text-red-600" : "text-green-600"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search cases, parties, or judges..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="criminal">Criminal</SelectItem>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="constitutional">Constitutional</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="tax">Tax</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="disposed">Disposed</SelectItem>
                  <SelectItem value="adjourned">Adjourned</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cases List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Cases ({pagination.total})
            </CardTitle>
            <CardDescription>Manage and track all judicial cases in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading cases...</div>
            ) : cases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No cases found</div>
            ) : (
              <>
                <div className="space-y-4">
                  {cases.map((case_) => (
                    <div key={case_.caseId} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{case_.caseId}</h3>
                            <Badge className={getStatusColor(case_.caseStatus)}>{case_.caseStatus}</Badge>
                            <Badge className={getPriorityColor(case_.priority)}>{case_.priority}</Badge>
                            <Badge variant="outline" className="capitalize">
                              {case_.caseType}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>
                                {case_.plaintiff} vs {case_.defendant}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Scale className="h-4 w-4" />
                              <span>{case_.judgeName || "Not assigned"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(case_.filingDate).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span>
                                {case_.state}, {case_.courtLevel} court
                              </span>
                            </div>
                          </div>
                          {case_.caseSummary && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                              {case_.caseSummary}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCase(case_)
                              setIsViewDialogOpen(true)
                            }}
                            className="bg-transparent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Link href={`/predict?caseId=${case_.caseId}`}>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              Predict
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCase(case_.caseId)}
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} cases
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchCases(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="bg-transparent"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {pagination.page} of {pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchCases(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="bg-transparent"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* View Case Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Case Details</DialogTitle>
              <DialogDescription>Complete information about the selected case</DialogDescription>
            </DialogHeader>
            {selectedCase && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Case ID</label>
                    <p className="font-semibold">{selectedCase.caseId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Case Type</label>
                    <p className="font-semibold capitalize">{selectedCase.caseType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Status</label>
                    <Badge className={getStatusColor(selectedCase.caseStatus)}>{selectedCase.caseStatus}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Priority</label>
                    <Badge className={getPriorityColor(selectedCase.priority)}>{selectedCase.priority}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Filing Date</label>
                    <p className="font-semibold">{new Date(selectedCase.filingDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Judge</label>
                    <p className="font-semibold">{selectedCase.judgeName || "Not assigned"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Plaintiff</label>
                    <p className="font-semibold">{selectedCase.plaintiff}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Defendant</label>
                    <p className="font-semibold">{selectedCase.defendant}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Court Level</label>
                    <p className="font-semibold capitalize">{selectedCase.courtLevel}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Location</label>
                    <p className="font-semibold">
                      {selectedCase.city}, {selectedCase.state}
                    </p>
                  </div>
                </div>
                {selectedCase.caseSummary && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Case Summary</label>
                    <p className="mt-1 text-sm">{selectedCase.caseSummary}</p>
                  </div>
                )}
                {selectedCase.outcome && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Outcome</label>
                    <p className="font-semibold capitalize">{selectedCase.outcome}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
