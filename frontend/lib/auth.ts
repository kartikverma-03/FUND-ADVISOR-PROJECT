// Reads the logged-in user's identifier (email) from the JWT, if present
export function tokenSubject(): string {
  try {
    const token = localStorage.getItem("token")
    if (!token) return ""
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(atob(part)).sub ?? ""
  } catch {
    return ""
  }
}