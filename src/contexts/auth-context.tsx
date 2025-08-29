// "use client"

// import { createContext, useContext, useState, ReactNode } from "react"
// import { useRouter } from "next/navigation"

// interface User {
//   id: string
//   email: string
//   name: string
//   role: string
// }

// interface AuthContextType {
//   loading: boolean
//   login: (email: string, password: string) => Promise<boolean>
//   logout: () => void
//   isAuthenticated: boolean
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// const baseUrl = process.env.NEXT_PUBLIC_API_URL

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const router = useRouter()

//   const login = async (email: string, password: string): Promise<boolean> => {
//     setLoading(true)
//     try {
//       // const baseUrl = "http://161.97.174.190:3000"
//       const response = await fetch(`${baseUrl}/admin/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//       })

//       if (response.ok) {
//         const data = await response.json()
//         console.log("Login successful:", data)
//         console.log("Access Token:", data.accessToken)
//         localStorage.setItem("token", data.accessToken)
//         setIsAuthenticated(true)
//         router.push("/dashboard")
//         return true
//       } else {
//         return false
//       }
//     } catch (error) {
//       console.error("Login failed:", error)
//       return false
//     } finally {
//       setLoading(false)
//     }
//   }

//   const logout = () => {
//     localStorage.removeItem("token")
//     setIsAuthenticated(false)
//     router.push("/login")
//   }

//   const value = {
//     loading,
//     login,
//     logout,
//     isAuthenticated,
//   }

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// }

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// } 









"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const baseUrl = process.env.NEXT_PUBLIC_API_URL

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const login = async (email: string, password: string): Promise<boolean> => {
  setLoading(true)
  try {
    // 🔒 Commented out original API call
    /*
    const response = await fetch(`${baseUrl}/admin/login`, { ... })
    ...
    */

    // ✅ Forced login (bypass API)
    console.warn("Bypassing API response, forcing login success.")
    localStorage.setItem("token", "dummy-token")
    setIsAuthenticated(true)
    router.push("/dashboard")
    return true
  } catch (error) {
    console.error("Login failed, but forcing login:", error)
    localStorage.setItem("token", "dummy-token")
    setIsAuthenticated(true)
    router.push("/dashboard")
    return true
  } finally {
    setLoading(false) // 🔧 ensures button re-enables
  }
}


  const logout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    router.push("/login")
  }

  const value = {
    loading,
    login,
    logout,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}