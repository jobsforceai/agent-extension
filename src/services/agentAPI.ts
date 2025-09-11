import axios from "axios"

const WEBAPP_URL = process.env.PLASMO_PUBLIC_WEBAPP_URL

export type CreateJobForUserBody = {
  jobId: string
  jobTitle: string
  jobDescription: string
  jobLink: string
  imageUrl?: string | null
  priority?: "low" | "medium" | "high" | string
  companyName?: string
  companyUrl?: string
  companyLogo?: string
  location?: string
  status?:
    | "Saved"
    | "Assigned"
    | "In Progress"
    | "Applied"
    | "Screen"
    | "Interviewing"
    | "Offer"
    | "Withdrawn"
    | "Rejected"
    | "Accepted"
}

export type AssignedUser = { userId: string; name: string }

async function getAuthToken(): Promise<string | null> {
  const { authToken } = await chrome.storage.local.get(["authToken"])
  return authToken ?? null
}

export const agentAPI = {
  async getAssignedUsers(): Promise<AssignedUser[]> {
    const token = await getAuthToken()
    const res = await axios.get(
      `${WEBAPP_URL}/api/v1/agent/assigned-users-list`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    // backend shape: { success, message, data: AssignedUser[] }
    return res.data?.data ?? []
  },

  async createJobForUser(userId: string, body: CreateJobForUserBody) {
    const token = await getAuthToken()
    const url = `${WEBAPP_URL}/api/v1/agent/users/${encodeURIComponent(userId)}/jobs`
    try {
      const res = await axios.post(url, body, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      })
      return res.data
    } catch (err: any) {
      // surface friendly messages based on backend codes
      if (err?.response?.status === 409) {
        throw new Error("This job has already been added for this user.")
      }
      if (err?.response?.status === 403) {
        throw new Error("The user has no credits left.")
      }
      if (err?.response?.status === 400) {
        throw new Error("Missing required fields.")
      }
      throw new Error(
        err?.response?.data?.message ||
          `Failed to create job (status: ${err?.response?.status ?? "?"}).`
      )
    }
  }
}
