"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import { Separator } from "../ui/separator"
import axios from "axios"

interface DeletionRequest {
  id: string
  userName: string
  userAvatar: string
  status: string
  timestamp: string
}

export function AccountDeletionRequests() {
  const [requests, setRequests] = useState<DeletionRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchDeletionRequests = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://localhost:3000/admin/deleted-users", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setRequests(response.data.users || [])
      } catch (error) {
        console.error("Failed to fetch deletion requests:", error)
      }
    }
    
    fetchDeletionRequests()
  }, [])

  const filteredRequests = requests.filter((request) =>
    request.userName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold py-2">Account Deletion Requests</CardTitle>
        <div className="relative bg-[#F9FAFB]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 " />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 shadow-none"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">
                {requests.length === 0 ? (
                  "No account deletion requests found"
                ) : (
                  "No requests match your search criteria"
                )}
              </div>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id}>
                <div key={request.id} className="flex items-center  gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors hover:bg-gray-50 rounded-lg transition-colors mb-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={request.userAvatar || "/placeholder.svg"} />
                    <AvatarFallback>EJ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium ">{request.userName}</div>
                    <div className="text-sm text-red-600">{request.status}</div>
                  </div>
                  <div className="text-sm text-gray-500">{request.timestamp}</div>
                </div>
                <Separator />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
