import axios, { type AxiosResponse } from "axios";
import type { UserData, UserDetails, Resume, UniversalResume } from "~data/types";

const WEBAPP_URL = process.env.PLASMO_PUBLIC_WEBAPP_URL;

export const agentAPI = {
  // Add agent-specific API calls here
  // Example:
  async getProfile(): Promise<UserData | null> { // <--- Added getProfile function
    try {
      const token = await chrome.storage.local.get(["authToken"]);
      const userResponse: AxiosResponse = await axios.get(
        `${WEBAPP_URL}/api/v1/user/details`, // <--- Replace with your actual endpoint
        {
          headers: {
            Authorization: `Bearer ${token.authToken}`, // <--- Make sure you have the correct token
          },
        }
      );
      const userDetails: UserDetails = userResponse.data.data;
      const resumeResponse: AxiosResponse = await axios.get(
        `${WEBAPP_URL}/api/v1/resume/actions/list-all-resumes`,
        {
          headers: {
            Authorization: `Bearer ${token.authToken}`
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
              Authorization: `Bearer ${token.authToken}`
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
      return finalUserProfileData;
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      return null;
    }
  },
};
