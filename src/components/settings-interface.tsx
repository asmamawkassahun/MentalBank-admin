"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Laptop, Smartphone, Monitor, Loader2 } from "lucide-react"
import { Separator } from "./ui/separator"

interface Profile {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface LoginActivity {
  device: string
  location: string
  icon: "laptop" | "smartphone" | "monitor"
}

export function SettingsInterface() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [updateMessage, setUpdateMessage] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })

  const [searchQuery, setSearchQuery] = useState("")

  // Get token from localStorage or context
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || sessionStorage.getItem('token')
    }
    return null
  }

  // Create axios instance with base configuration
  const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Add request interceptor to include auth token
  api.interceptors.request.use((config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  const loginActivity: LoginActivity[] = [
    { device: "MacBook Pro", location: "San Francisco, CA", icon: "laptop" },
    { device: "iPhone 13", location: "San Francisco, CA", icon: "smartphone" },
    { device: "Windows PC", location: "New York, NY", icon: "monitor" },
  ]

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/admin/profile')
      setProfile(response.data)
      setFormData({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Handle unauthorized access
        console.error('Unauthorized access - please login again')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async () => {
    try {
      setIsUpdating(true)
      setUpdateMessage("")
      
      const response = await api.put('/admin/profile', formData)

      setProfile(response.data)
      setUpdateMessage("Profile updated successfully!")
      setTimeout(() => setUpdateMessage(""), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setUpdateMessage("Unauthorized access - please login again")
        } else if (error.response?.status === 400) {
          setUpdateMessage("Invalid data provided. Please check your input.")
        } else {
          setUpdateMessage("Failed to update profile. Please try again.")
        }
      } else {
        setUpdateMessage("An error occurred while updating profile.")
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordMessage("New passwords do not match!")
      return
    }

    try {
      setIsChangingPassword(true)
      setPasswordMessage("")
      
      const response = await api.put('/admin/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword,
      })

      setPasswordMessage(response.data.message || "Password changed successfully!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      })
      setTimeout(() => setPasswordMessage(""), 3000)
    } catch (error) {
      console.error('Error changing password:', error)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setPasswordMessage("Unauthorized access - please login again")
        } else if (error.response?.status === 400) {
          setPasswordMessage("Invalid current password or password requirements not met.")
        } else {
          setPasswordMessage("Failed to change password. Please try again.")
        }
      } else {
        setPasswordMessage("An error occurred while changing password.")
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  const getDeviceIcon = (iconType: "laptop" | "smartphone" | "monitor") => {
    switch (iconType) {
      case "laptop":
        return <Laptop className="h-4 w-4" />
      case "smartphone":
        return <Smartphone className="h-4 w-4" />
      case "monitor":
        return <Monitor className="h-4 w-4" />
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCancel = () => {
    if (profile) {
    setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
      })
    }
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    })
    setUpdateMessage("")
    setPasswordMessage("")
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold ">Settings</h1>
          <p className="text-sm text-foreground/60 mt-1">Manage your account settings and preferences</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card className="shadow-none rounded-[0.375rem]">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information and profile picture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/admin-user-avatar.png" alt={`${profile?.firstName} ${profile?.lastName}`} />
                <AvatarFallback>{profile?.firstName?.[0]}{profile?.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-medium">{profile?.firstName} {profile?.lastName}</h3>
                <p className="text-sm text-foreground/60">{profile?.email}</p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="shadow-none ">
                    Change Photo
                  </Button>
                  <Button variant="default" size="sm">
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="shadow-none rounded-[0.375rem]">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Manage your personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="max-w-md "
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="max-w-md"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="max-w-md"
              />
            </div>
            {updateMessage && (
              <div className={`text-sm ${updateMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                {updateMessage}
              </div>
            )}
            <div className="flex space-x-3">
              <Button 
                onClick={updateProfile} 
                disabled={isUpdating}
                className="max-w-md"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="space-y-6 shadow-none rounded-[0.375rem] ">
          {/* Security Settings */}
          <div className="p-0 border-0 shadow-none">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                  className="max-w-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••••"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    className="max-w-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    placeholder="••••••••••"
                    value={passwordData.confirmNewPassword}
                    onChange={(e) => handlePasswordChange("confirmNewPassword", e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </div>
              {passwordMessage && (
                <div className={`text-sm ${passwordMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordMessage}
                </div>
              )}
              <div className="flex space-x-3">
                <Button 
                  onClick={changePassword} 
                  disabled={isChangingPassword}
                  className="max-w-md"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </div>
            </CardContent>
          </div>
          {/* <Separator className="m-none" /> */}

          {/* Two-Factor Authentication */}
          {/* <div className="p-0 mx-6 pt-4 border-0 shadow-none border-t">
            <CardHeader className=" pl-0">
              <CardTitle className="leading-6">Two-Factor Authentication</CardTitle>
              <CardDescription className="leading-5">Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent className=" mt-4 shadow-none pl-0">
              <Button variant="outline">Enable Two-Factor Authentication</Button>
            </CardContent>
          </div> */}

          {/* <Separator /> */}
          {/* Recent Login Activity */}
          <div className="p-0 mx-6 pt-4 border-0 shadow-none border-t">
            <CardHeader className=" pl-0">
              <CardTitle>Recent Login Activity</CardTitle>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="space-y-3">
                {loginActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 py-2 rounded-lg hover:bg-gray-50">
                    <div className="p-2 bg-gray-100 rounded-lg">{getDeviceIcon(activity.icon)}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.device}</p>
                      <p className="text-xs text-foreground/60">{activity.location}</p>
                    </div>
                  </div>
                ))}
                <Button variant="link" className="p-0 h-auto text-sm">
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 ">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
