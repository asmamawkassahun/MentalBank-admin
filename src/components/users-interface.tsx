"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Download, Plus, MoreHorizontal, ChevronLeft, ChevronRight, EllipsisVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DashboardHeader } from "./dashboard/dashboard-header"

interface User {
    id: string
    name: string
    email: string
    role: "Admin" | "Premium User" | "User"
    status: "Active" | "Inactive"
    lastActive: string
    avatar: string
}

interface UsersData {
    users: User[]
    total: number
    currentPage: number
    totalPages: number
}

export function UsersInterface() {
    const [usersData, setUsersData] = useState<UsersData | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`/api/users?page=${currentPage}&limit=8`)
                const data = await response.json()
                console.log("Fetched users:", data)
                setUsersData(data)
            } catch (error) {
                console.error("Failed to fetch users:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [currentPage])

    const handleSelectAll = (checked: boolean) => {
        if (checked && usersData) {
            setSelectedUsers(usersData.users.map((user) => user.id))
        } else {
            setSelectedUsers([])
        }
    }

    const handleSelectUser = (userId: string, checked: boolean) => {
        if (checked) {
            setSelectedUsers((prev) => [...prev, userId])
        } else {
            setSelectedUsers((prev) => prev.filter((id) => id !== userId))
        }
    }

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case "Admin":
                return "default"
            case "Premium User":
                return "secondary"
            default:
                return "outline"
        }
    }

    const getStatusColor = (status: string) => {
        return status === "Active" ? "text-foreground/100" : "text-gray-400"
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
            setSelectedUsers([])
        }
    }

    const handleNextPage = () => {
        if (usersData && currentPage < usersData.totalPages) {
            setCurrentPage(currentPage + 1)
            setSelectedUsers([])
        }
    }

    const handlePageClick = (page: number) => {
        setCurrentPage(page)
        setSelectedUsers([])
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg">Loading users...</div>
            </div>
        )
    }

    const safeData = usersData || {
        users: [],
        total: 0,
        currentPage: 1,
        totalPages: 1,
    }
    console.log("Safe users data:", safeData)

    const startIndex = (currentPage - 1) * 8 + 1
    const endIndex = Math.min(currentPage * 8, safeData.total)
    const showPagination = safeData.total > 8

    return (
        <div>
            <DashboardHeader title="Users" />
            <div className="flex-1 space-y-6 p-6 ">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-80 shadow-none"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="shadow-none">
                            {/* <Filter className="h-4 w-4 mr-2" /> */}
                            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.2266 2.25H1.72656C1.51946 2.25 1.34268 2.17678 1.19623 2.03033C1.04979 1.88388 0.976562 1.70711 0.976562 1.5C0.976562 1.29289 1.04979 1.11612 1.19623 0.96967C1.34268 0.823223 1.51946 0.75 1.72656 0.75H15.2266C15.4337 0.75 15.6104 0.823223 15.7569 0.96967C15.9033 1.11612 15.9766 1.29289 15.9766 1.5C15.9766 1.70711 15.9033 1.88388 15.7569 2.03033C15.6104 2.17678 15.4337 2.25 15.2266 2.25ZM12.7266 5.75H4.22656C4.01946 5.75 3.84268 5.67678 3.69623 5.53033C3.54979 5.38388 3.47656 5.20711 3.47656 5C3.47656 4.79289 3.54979 4.61612 3.69623 4.46967C3.84268 4.32322 4.01946 4.25 4.22656 4.25H12.7266C12.9337 4.25 13.1104 4.32322 13.2569 4.46967C13.4033 4.61612 13.4766 4.79289 13.4766 5C13.4766 5.20711 13.4033 5.38388 13.2569 5.53033C13.1104 5.67678 12.9337 5.75 12.7266 5.75ZM9.72656 9.25H7.22656C7.01946 9.25 6.84268 9.17678 6.69623 9.03033C6.54979 8.88388 6.47656 8.70711 6.47656 8.5C6.47656 8.29289 6.54979 8.11612 6.69623 7.96967C6.84268 7.82322 7.01946 7.75 7.22656 7.75H9.72656C9.93367 7.75 10.1104 7.82322 10.2569 7.96967C10.4033 8.11612 10.4766 8.29289 10.4766 8.5C10.4766 8.70711 10.4033 8.88388 10.2569 9.03033C10.1104 9.17678 9.93367 9.25 9.72656 9.25Z" fill="black" />
                            </svg>

                            Filter
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        {/*  */}

                        <Button variant="outline" size="sm" className="shadow-none">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[700px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedUsers.length === safeData.users.length && safeData.users.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead className="text-[#71717A] p-4">User</TableHead>
                                    <TableHead className="text-[#71717A]">Email</TableHead>
                                    <TableHead className="text-[#71717A]">Role</TableHead>
                                    <TableHead className="text-[#71717A]">Status</TableHead>
                                    <TableHead className="text-[#71717A]">Last Active</TableHead>
                                    <TableHead className=" text-[#71717A]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {safeData.users.map((user) => (
                                    <TableRow key={user.id}  >
                                        <TableCell >
                                            <Checkbox
                                                checked={selectedUsers.includes(user.id)}
                                                onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3 p-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                                    <AvatarFallback>
                                                        {user.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-foreground/100">{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={getRoleBadgeVariant(user.role)} className={user.role === "Premium User" ? "bg-[#DBEAFE] text-[#1E40AF] font-semibold" : user.role !== "Admin" ? "bg-[#F3F4F6] text-foreground/100 border-none" : ""}>{user.role}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-2 h-2 rounded-full ${user.status === "Active" ? "bg-green-500" : "bg-gray-400"}`}
                                                />
                                                <span className="text-foreground/100">{user.status}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[#4B5563]">{user.lastActive}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <EllipsisVertical />
                                                        {/* <MoreHorizontal className="h-4 w-4" /> */}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                    <DropdownMenuItem>Edit User</DropdownMenuItem>
                                                    <DropdownMenuItem>Reset Password</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t px-4 py-6">
                        <div className="text-sm  text-[#6B7280]">
                            Showing <span className=" font-semibold">{startIndex}</span> to <span className=" font-semibold">{endIndex}</span> of <span className=" font-semibold">{safeData.total}</span> users
                        </div>
                        {showPagination && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 bg-transparent"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {Array.from({ length: Math.min(safeData.totalPages, 3) }, (_, i) => {
                                    const pageNum = i + 1
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "outline" : "outline"}
                                            size="sm"
                                            className={` ${currentPage === pageNum ? "bg-[#F3F4F6]" : ""}`}
                                            onClick={() => handlePageClick(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    )
                                })}

                                {safeData.totalPages > 3 && <span className="foreground/60 px-2">...</span>}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={currentPage === safeData.totalPages}
                                    className="flex items-center gap-1 bg-transparent"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>



            </div>
        </div>
    )
}