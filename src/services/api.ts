import axios, { type AxiosResponse } from "axios"

import type {
  Resume,
  UniversalResume,
  UserData,
  UserDetails
} from "~data/types"

const WEBAPP_URL = process.env.PLASMO_PUBLIC_WEBAPP_URL

export const profileAPI = {
  async getProfile(): Promise<UserData | null> {
    try {
      const result = await chrome.storage.local.get(["authToken"])
      const token = result.authToken
      console.log("Fetching profile with token:", token)
      const userResponse: AxiosResponse = await axios.get(
        `${WEBAPP_URL}/api/v1/user/details`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      const userDetails: UserDetails = userResponse.data.data
      const resumeResponse: AxiosResponse = await axios.get(
        `${WEBAPP_URL}/api/v1/resume/actions/list-all-resumes`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      const resumes: Resume[] = resumeResponse.data.data

      let universalResumes: UniversalResume[] = []
      try {
        const universalResumeResponse: AxiosResponse = await axios.get(
          `${WEBAPP_URL}/api/v1/resume/actions/universal`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        if (universalResumeResponse.data.data) {
          universalResumes = universalResumeResponse.data.data
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.log(
            "No universal resumes found for this user (404). This is normal for users without universal"
          )
        } else {
          // For any other errors, we should still log them but not block the main profile fetch.
          console.error(
            "An error occurred while fetching universal resumes, but proceeding without them:",
            error
          )
        }
      }
      // Create a map from parentResumeId to UniversalResume
      const universalMap = new Map<string, UniversalResume>()

      universalResumes.forEach((ur) => {
        universalMap.set(ur.parentResumeId, ur)
      })

      // Attach matching universalResume to each Resume
      const enrichedResumes: Resume[] = resumes.map((resume) => ({
        ...resume,
        universalResume: universalMap.get(resume._id) || undefined
      }))

      const finalUserProfileData: UserData = {
        userDetails,
        resume: enrichedResumes
      }
      return finalUserProfileData
    } catch (error) {
      console.error("Error fetching profile:", error)
      return null
    }
  },

  async getAssignedUsers(): Promise<{
    success: boolean
    message: string
    data: { userId: string; name: string }[]
  }> {
    try {
      const result = await chrome.storage.local.get(["authToken"])
      const token = result.authToken

      const response: AxiosResponse<{
        success: boolean
        message: string
        data: { userId: string; name: string }[]
      }> = await axios.get(`${WEBAPP_URL}/api/v1/agent/assigned-users-list`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    } catch (error) {
      console.error("Error fetching assigned users:", error)
      throw error 
    }
  }
}

