export interface User {
  id: string
  email: string
  name: string
}

export interface AuthData {
  user: User
  token: string
}

// Cookie utilities
export const AUTH_COOKIE = "finance-auth-token"

export function setAuthCookie(authData: AuthData) {
  const expires = new Date()
  expires.setDate(expires.getDate() + 7) // 7 days
  const encodedData = encodeURIComponent(JSON.stringify(authData))
  document.cookie = `${AUTH_COOKIE}=${encodedData}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`
}

export function getAuthCookie(): AuthData | null {
  if (typeof document === "undefined") return null

  const cookies = document.cookie.split(";")
  const authCookie = cookies.find((cookie) => cookie.trim().startsWith(`${AUTH_COOKIE}=`))

  if (!authCookie) return null

  try {
    const cookieValue = authCookie.split("=")[1]
    if (!cookieValue || cookieValue.trim() === "") {
      return null
    }
    return JSON.parse(decodeURIComponent(cookieValue))
  } catch (error) {
    console.error("Error parsing auth cookie:", error)
    removeAuthCookie()
    return null
  }
}

export function removeAuthCookie() {
  document.cookie = `${AUTH_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

export const clearAuthCookie = removeAuthCookie

// Local storage for user data
export function getStoredUsers(): Array<{ email: string; password: string; name: string; id: string }> {
  if (typeof localStorage === "undefined") return []

  try {
    const users = localStorage.getItem("finance-users")
    return users ? JSON.parse(users) : []
  } catch {
    return []
  }
}

export function storeUser(user: { email: string; password: string; name: string }) {
  const users = getStoredUsers()
  const newUser = {
    ...user,
    id: Date.now().toString(),
  }
  users.push(newUser)
  localStorage.setItem("finance-users", JSON.stringify(users))
  return newUser
}

export function validateUser(email: string, password: string): User | null {
  const users = getStoredUsers()
  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  }

  return null
}
