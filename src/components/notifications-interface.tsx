"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, Plus, Copy, Trash2, Bell, ChevronLeft, ChevronRight, Calendar, Edit, Eye } from "lucide-react"
import axios from "axios"

interface Admin {
  firstName: string
  lastName: string
  email: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: "UPGRADE" | "ALERT"
  audience: string[]
  scheduledDate: string
  status: "SENT" | "SCHEDULED" | "DRAFT"
  admin: Admin
  createdAt: string
  sentAt?: string
}

interface NotificationData {
  notifications: Notification[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface CreateNotificationData {
  title: string
  message: string
  type: "UPGRADE" | "ALERT"
  audience: string[]
  scheduledDate?: string
}

export function NotificationsInterface() {
  const [data, setData] = useState<NotificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [notificationForm, setNotificationForm] = useState<CreateNotificationData>({
    title: "",
    message: "",
    type: "ALERT",
    audience: ["ALL_USERS"],
    scheduledDate: "",
  })

  const BASE_URL = "http://localhost:3000/admin"

  // Create axios instance with default authorization header
  const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      'Content-Type': 'application/json',
    }
  })

  // Add request interceptor to ensure token is always up to date
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // Add response interceptor to handle token expiration
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  useEffect(() => {
    fetchNotifications()
  }, [currentPage, searchTerm])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get(`/notifications`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined
        }
      })
      setData(response.data)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
      setError("Failed to fetch notifications")
    } finally {
      setLoading(false)
    }
  }

  const createNotification = async (notificationData: CreateNotificationData, action?: 'draft' | 'send' | 'schedule') => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      const payload = {
        ...notificationData,
        scheduledDate: notificationData.scheduledDate || undefined
      }
      
      const response = await apiClient.post(`/notifications`, payload)
      const notificationId = response.data.id
      
      // If an action was specified, perform it after creation
      if (action && notificationId) {
        try {
          switch (action) {
            case 'draft':
              await apiClient.post(`/notifications/${notificationId}/draft`)
              setSuccess("Notification created and saved as draft")
              break
            case 'send':
              const sendResponse = await apiClient.post(`/notifications/${notificationId}/send`)
              setSuccess(`Notification created and sent successfully to ${sendResponse.data.sentCount} users`)
              break
            case 'schedule':
              await apiClient.post(`/notifications/${notificationId}/schedule`)
              setSuccess("Notification created and scheduled successfully")
              break
          }
        } catch (actionError: any) {
          console.error(`Failed to perform action ${action}:`, actionError)
          setError(`Notification created but failed to ${action}: ${actionError.response?.data?.message || 'Unknown error'}`)
        }
      } else {
        setSuccess("Notification created successfully")
      }
      
      setIsModalOpen(false)
      resetForm()
      fetchNotifications()
    } catch (error: any) {
      console.error("Failed to create notification:", error)
      setError(error.response?.data?.message || "Failed to create notification")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateNotification = async (id: string, updateData: Partial<CreateNotificationData>) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      await apiClient.patch(`/notifications/${id}`, updateData)
      setSuccess("Notification updated successfully")
      setIsEditModalOpen(false)
      setSelectedNotification(null)
      fetchNotifications()
    } catch (error: any) {
      console.error("Failed to update notification:", error)
      setError(error.response?.data?.message || "Failed to update notification")
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteNotification = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return
    
    try {
      setError(null)
      await apiClient.delete(`/notifications/${id}`)
      setSuccess("Notification deleted successfully")
      fetchNotifications()
    } catch (error: any) {
      console.error("Failed to delete notification:", error)
      setError(error.response?.data?.message || "Failed to delete notification")
    }
  }

  const sendNotificationNow = async (id: string) => {
    try {
      setError(null)
      const response = await apiClient.post(`/notifications/${id}/send`)
      setSuccess(`Notification sent successfully to ${response.data.sentCount} users`)
      fetchNotifications()
    } catch (error: any) {
      console.error("Failed to send notification:", error)
      setError(error.response?.data?.message || "Failed to send notification")
    }
  }

  const scheduleNotification = async (id: string) => {
    try {
      setError(null)
      await apiClient.post(`/notifications/${id}/schedule`)
      setSuccess("Notification scheduled successfully")
      fetchNotifications()
    } catch (error: any) {
      console.error("Failed to schedule notification:", error)
      setError(error.response?.data?.message || "Failed to schedule notification")
    }
  }

  const saveAsDraft = async (id: string) => {
    try {
      setError(null)
      await apiClient.post(`/notifications/${id}/draft`)
      setSuccess("Notification saved as draft")
      fetchNotifications()
    } catch (error: any) {
      console.error("Failed to save as draft:", error)
      setError(error.response?.data?.message || "Failed to save as draft")
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "UPGRADE":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "ALERT":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      default:
        return "bg-gray-100 text-foreground hover:bg-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "DRAFT":
        return "bg-gray-100 text-foreground hover:bg-gray-200"
      default:
        return "bg-gray-100 text-foreground hover:bg-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (data && currentPage < data.pagination.pages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleFormChange = (field: string, value: unknown) => {
    if (field === "audience") {
      setNotificationForm((prev) => ({
        ...prev,
        audience: value as string[],
      }))
    } else {
      setNotificationForm((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleAudienceChange = (audienceType: string, checked: boolean) => {
    setNotificationForm((prev) => {
      if (checked) {
        return {
          ...prev,
          audience: [...prev.audience, audienceType]
        }
      } else {
        // Don't allow removing ALL_USERS if it's the only one selected
        if (audienceType === "ALL_USERS" && prev.audience.length === 1) {
          return prev
        }
        return {
          ...prev,
          audience: prev.audience.filter(a => a !== audienceType)
        }
      }
    })
  }

  const resetForm = () => {
    setNotificationForm({
      title: "",
      message: "",
      type: "ALERT",
      audience: ["ALL_USERS"],
      scheduledDate: "",
    })
  }

  const handleCreateNotification = () => {
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      setError("Title and message are required")
      return
    }
    
    if (notificationForm.audience.length === 0) {
      setError("Please select at least one audience type")
      return
    }

    createNotification(notificationForm)
  }

  const handleEditNotification = (notification: Notification) => {
    setSelectedNotification(notification)
    setNotificationForm({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      audience: notification.audience,
      scheduledDate: notification.scheduledDate,
    })
    setIsEditModalOpen(true)
  }

  const handleViewNotification = (notification: Notification) => {
    setSelectedNotification(notification)
    setIsViewModalOpen(true)
  }

  const handleUpdateNotification = () => {
    if (!selectedNotification) return
    
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      setError("Title and message are required")
      return
    }
    
    if (notificationForm.audience.length === 0) {
      setError("Please select at least one audience type")
      return
    }

    updateNotification(selectedNotification.id, notificationForm)
  }

  const handleSaveAsDraft = () => {
    if (!isFormValid) {
      setError("Please fill in all required fields")
      return
    }
    
    // Create notification and save as draft
    createNotification({
      ...notificationForm,
      scheduledDate: undefined // Remove scheduled date for draft
    }, 'draft')
  }

  const handleSendNow = () => {
    if (!isFormValid) {
      setError("Please fill in all required fields")
      return
    }
    
    // Create notification and send immediately
    createNotification(notificationForm, 'send')
  }

  const handleSchedule = () => {
    if (!isFormValid) {
      setError("Please fill in all required fields")
      return
    }
    
    if (!notificationForm.scheduledDate) {
      setError("Please select a schedule date")
      return
    }
    
    // Create notification and schedule
    createNotification(notificationForm, 'schedule')
  }

  const safeData = data || {
    notifications: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 1
    }
  }

  const isFormValid = notificationForm.title.trim() && 
                     notificationForm.message.trim() && 
                     notificationForm.audience.length > 0

  const isPaginationActive = safeData.pagination.total > 10

  // Clear success/error messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  if (loading && !data) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-foreground/60">Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Notifications</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Notification
          </Button>
          <div className="relative">
            <Bell className="h-5 w-5 text-foreground/60" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {safeData.pagination.total}
            </span>
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-medium text-foreground/60">A</span>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Notification Management Section */}
      <div className="text-center py-8">
        <h2 className="text-[1.5rem] font-semibold mb-2">Notification Management</h2>
        <p className="text-foreground/60">Manage your notification templates and delivery settings</p>
      </div>

      {/* Notifications Table */}
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
              <p className="text-sm text-foreground/60 mt-1">
                {safeData.pagination.total} total notifications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Notification
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeData.notifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-foreground/60">
                        No notifications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    safeData.notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell className="font-medium">{notification.title}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(notification.type)}>
                            {notification.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground/100">
                          {notification.audience.join(", ")}
                        </TableCell>
                        <TableCell className="text-foreground/100">
                          {notification.scheduledDate ? formatDate(notification.scheduledDate) : "Not scheduled"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground/100">
                          {formatDate(notification.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewNotification(notification)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditNotification(notification)}
                              disabled={notification.status === "SENT"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => deleteNotification(notification.id)}
                              disabled={notification.status === "SENT"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {isPaginationActive && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground/60">
                  Showing {Math.min((currentPage - 1) * 10 + 1, safeData.pagination.total)} to{" "}
                  {Math.min(currentPage * 10, safeData.pagination.total)} of {safeData.pagination.total} notifications
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage >= safeData.pagination.pages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* New Notification Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">New Notification</DialogTitle>
            <p className="text-foreground/60 text-sm">Create a notification to send to your Mental Bank users</p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Notification Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Notification Title</label>
              <Input
                placeholder="Enter notification title"
                value={notificationForm.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
              />
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Message Body</label>
              <Textarea
                placeholder="Type your message here..."
                rows={4}
                value={notificationForm.message}
                onChange={(e) => handleFormChange("message", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Notification Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground/80">Notification Type</label>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleFormChange("type", "ALERT")}
                    className={`flex flex-col items-center justify-center gap-2 p-8 border
                      ${notificationForm.type === "ALERT"
                        ? "bg-[#EBF5FF] text-foreground border-[#7C9CBF] hover:bg-[#EBF5FF]"
                        : "bg-background text-foreground hover:bg-black/5"
                      }`}
                  >
                    🔔
                    <p>Alert</p>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleFormChange("type", "UPGRADE")}
                    className={`flex flex-col items-center justify-center gap-2 p-8 border
                      ${notificationForm.type === "UPGRADE"
                        ? "bg-[#EBF5FF] text-foreground border-[#7C9CBF] hover:bg-[#EBF5FF]"
                        : "bg-background text-foreground hover:bg-black/5"
                      }`}
                  >
                    ✨
                    <p>Upgrade</p>
                  </Button>
                </div>
              </div>

              {/* Schedule Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Schedule Time</label>
                <div className="relative">
                  <Input
                    type="datetime-local"
                    value={notificationForm.scheduledDate}
                    onChange={(e) => handleFormChange("scheduledDate", e.target.value)}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/60" />
                </div>
              </div>
            </div>

            {/* Audience Targeting */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground/80">Audience Targeting</label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allUsers"
                    checked={notificationForm.audience.includes("ALL_USERS")}
                    onCheckedChange={(checked) => handleAudienceChange("ALL_USERS", checked as boolean)}
                  />
                  <label htmlFor="allUsers" className="text-sm text-foreground/80">
                    All Users
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="premiumUsers"
                    checked={notificationForm.audience.includes("PREMIUM_USERS")}
                    onCheckedChange={(checked) => handleAudienceChange("PREMIUM_USERS", checked as boolean)}
                  />
                  <label htmlFor="premiumUsers" className="text-sm text-foreground/60">
                    Premium Users
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="activeUsers"
                    checked={notificationForm.audience.includes("ACTIVE_USERS")}
                    onCheckedChange={(checked) => handleAudienceChange("ACTIVE_USERS", checked as boolean)}
                  />
                  <label htmlFor="activeUsers" className="text-sm text-foreground/60">
                    Active Users
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleSaveAsDraft}>
              Save as Draft
            </Button>
            <Button
              variant="outline"
              onClick={handleSendNow}
              disabled={!isFormValid}
              className={!isFormValid ? "bg-[#E5E7EB] cursor-not-allowed" : ""}
            >
              Send Now
            </Button>
            <Button onClick={handleSchedule} disabled={!isFormValid}>
              Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Notification Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Notification</DialogTitle>
            <p className="text-foreground/60 text-sm">Update notification details</p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Notification Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Notification Title</label>
              <Input
                placeholder="Enter notification title"
                value={notificationForm.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
              />
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Message Body</label>
              <Textarea
                placeholder="Type your message here..."
                rows={4}
                value={notificationForm.message}
                onChange={(e) => handleFormChange("message", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Notification Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground/80">Notification Type</label>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleFormChange("type", "ALERT")}
                    className={`flex flex-col items-center justify-center gap-2 p-8 border
                      ${notificationForm.type === "ALERT"
                        ? "bg-[#EBF5FF] text-foreground border-[#7C9CBF] hover:bg-[#EBF5FF]"
                        : "bg-background text-foreground hover:bg-black/5"
                      }`}
                  >
                    🔔
                    <p>Alert</p>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleFormChange("type", "UPGRADE")}
                    className={`flex flex-col items-center justify-center gap-2 p-8 border
                      ${notificationForm.type === "UPGRADE"
                        ? "bg-[#EBF5FF] text-foreground border-[#7C9CBF] hover:bg-[#EBF5FF]"
                        : "bg-background text-foreground hover:bg-black/5"
                      }`}
                  >
                    ✨
                    <p>Upgrade</p>
                  </Button>
                </div>
              </div>

              {/* Schedule Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Schedule Time</label>
                <div className="relative">
                  <Input
                    type="datetime-local"
                    value={notificationForm.scheduledDate}
                    onChange={(e) => handleFormChange("scheduledDate", e.target.value)}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/60" />
                </div>
              </div>
            </div>

            {/* Audience Targeting */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground/80">Audience Targeting</label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-allUsers"
                    checked={notificationForm.audience.includes("ALL_USERS")}
                    onCheckedChange={(checked) => handleAudienceChange("ALL_USERS", checked as boolean)}
                  />
                  <label htmlFor="edit-allUsers" className="text-sm text-foreground/80">
                    All Users
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-premiumUsers"
                    checked={notificationForm.audience.includes("PREMIUM_USERS")}
                    onCheckedChange={(checked) => handleAudienceChange("PREMIUM_USERS", checked as boolean)}
                  />
                  <label htmlFor="edit-premiumUsers" className="text-sm text-foreground/60">
                    Premium Users
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-activeUsers"
                    checked={notificationForm.audience.includes("ACTIVE_USERS")}
                    onCheckedChange={(checked) => handleAudienceChange("ACTIVE_USERS", checked as boolean)}
                  />
                  <label htmlFor="edit-activeUsers" className="text-sm text-foreground/60">
                    Active Users
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateNotification}
              disabled={!isFormValid || isSubmitting}
              className={!isFormValid ? "bg-[#E5E7EB] cursor-not-allowed" : ""}
            >
              {isSubmitting ? "Updating..." : "Update Notification"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Notification Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Notification Details</DialogTitle>
            <p className="text-foreground/60 text-sm">View notification information</p>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/80">Title</label>
                  <p className="text-sm text-foreground/100 mt-1">{selectedNotification.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/80">Type</label>
                  <Badge className={`mt-1 ${getTypeColor(selectedNotification.type)}`}>
                    {selectedNotification.type}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/80">Status</label>
                  <Badge className={`mt-1 ${getStatusColor(selectedNotification.status)}`}>
                    {selectedNotification.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/80">Created</label>
                  <p className="text-sm text-foreground/100 mt-1">
                    {formatDate(selectedNotification.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/80">Scheduled Date</label>
                  <p className="text-sm text-foreground/100 mt-1">
                    {selectedNotification.scheduledDate ? formatDate(selectedNotification.scheduledDate) : "Not scheduled"}
                  </p>
                </div>
                {selectedNotification.sentAt && (
                  <div>
                    <label className="text-sm font-medium text-foreground/80">Sent At</label>
                    <p className="text-sm text-foreground/100 mt-1">
                      {formatDate(selectedNotification.sentAt)}
                    </p>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-foreground/80">Audience</label>
                  <p className="text-sm text-foreground/100 mt-1">
                    {selectedNotification.audience.join(", ")}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-foreground/80">Message</label>
                  <p className="text-sm text-foreground/100 mt-1 p-3 bg-gray-50 rounded">
                    {selectedNotification.message}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-foreground/80">Created By</label>
                  <p className="text-sm text-foreground/100 mt-1">
                    {selectedNotification.admin.firstName} {selectedNotification.admin.lastName} ({selectedNotification.admin.email})
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                {selectedNotification.status === "DRAFT" && (
                  <>
                    <Button variant="outline" onClick={handleSaveAsDraft}>
                      Save as Draft
                    </Button>
                    <Button onClick={handleSendNow}>
                      Send Now
                    </Button>
                  </>
                )}
                {selectedNotification.status === "DRAFT" && selectedNotification.scheduledDate && (
                  <Button onClick={handleSchedule}>
                    Schedule
                  </Button>
                )}
                {selectedNotification.status === "SCHEDULED" && (
                  <Button onClick={handleSendNow}>
                    Send Now
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
